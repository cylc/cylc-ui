/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import isEqual from 'lodash/isEqual'
import ViewState from '@/model/ViewState.model'
import Subscription from '@/model/Subscription.model'
import {
  getIntrospectionQuery,
  getMutationArgsFromTokens,
  mutate,
  primaryMutations,
  processMutations,
  tokenise
} from '@/utils/aotf'
import store from '@/store/index'
import { createApolloClient } from '@/graphql/index'
import { print } from 'graphql'
import mergeQueries from '@/graphql/merge'
import Alert from '@/model/Alert.model'
import CylcTreeCallback from '@/services/treeCallback'

// Typedef imports
/* eslint-disable no-unused-vars, no-duplicate-imports */
import { Deltas } from '@/components/cylc/common/deltas'
import { MutationResponse } from '@/utils/aotf'
import { DocumentNode } from 'graphql'
import { SubscriptionClient } from 'subscriptions-transport-ws'
/* eslint-enable no-unused-vars, no-duplicate-imports */

/**
 * @typedef {Object} MutationsAndTypes
 * @property {Array<Object>} mutations
 * @property {Array<Object>} types
 */

/**
 * @typedef {Object} SubscriptionOptions
 * @property {Function} next
 * @property {Function} error
 */

class WorkflowService {
  /**
   * @constructor
   * @param {string} httpUrl
   * @param {SubscriptionClient|null} subscriptionClient
   */
  constructor (httpUrl, subscriptionClient) {
    this.debug = process.env.NODE_ENV !== 'production'

    this.subscriptionClient = subscriptionClient
    this.apolloClient = createApolloClient(httpUrl, subscriptionClient)

    /**
     * This is the mapping of Vue components/views subscriptions. Not necessarily
     * GraphQL subscriptions. A Vue components/views subscription results, ultimately,
     * in a GraphQL subscription. But you may have 10 Vue components/views subscriptions,
     * all using the same query. In this case, we end up with a single, merged, GraphQL
     * query, and a single Apollo Client GraphQL subscription.
     *
     * The Apollo Client GraphQL subscription can be accessed via the Subscription
     * attribute `.observable`, or via the `.subscriptionClient`.
     *
     * @type {Object.<String, Subscription>}
     */
    this.subscriptions = {}

    // mutations defaults
    this.primaryMutations = primaryMutations

    this.mutationsAndTypes = this.loadMutations()

    this.globalCallback = new CylcTreeCallback()
  }

  // --- Mutations

  /**
   * Call a mutation on the given identifier.
   *
   * Will only work if no additional information (other than the identifier
   * itself) is required.
   *
   * Requires an absolute identifier (i.e. must include the workflow name).
   *
   * @param {String} mutationName
   * @param {String} id
   * @returns {Promise<MutationResponse>}
   */
  async mutate (mutationName, id) {
    const mutation = await this.getMutation(mutationName)
    return await mutate(
      mutation,
      getMutationArgsFromTokens(
        mutation,
        tokenise(id)
      ),
      this.apolloClient
    )
  }

  /**
   * Load mutations for internal use from GraphQL introspection.
   *
   * @returns {Promise<MutationsAndTypes>}
   */
  async loadMutations () {
    // TODO: this assumes all workflows use the same schema which is and
    //       isn't necessarily true, not quite sure, come back to this later.
    const response = await this.apolloClient.query({
      query: getIntrospectionQuery(),
      fetchPolicy: 'no-cache'
    })
    const mutations = response.data.__schema.mutationType.fields
    const types = response.data.__schema.types
    processMutations(mutations, types)
    return { mutations, types }
  }

  /**
   * Return a mutation by name.
   *
   * @param {String} mutationName
   * @returns {Promise<Object>}
   */
  async getMutation (mutationName) {
    const { mutations } = await this.mutationsAndTypes
    return mutations.find(mutation => mutation.name === mutationName)
  }

  // --- GraphQL query subscriptions

  /**
   * @param {View} componentOrView
   * @returns {Subscription}
   */
  getOrCreateSubscription (componentOrView) {
    const queryName = componentOrView.query.name
    let subscription = this.subscriptions[queryName]
    // note, this will force a return of the FIRST query of the SAME name as any subsequent queries
    if (!subscription) {
      subscription = this.subscriptions[queryName] = new Subscription(componentOrView.query)
    }
    return subscription
  }

  /**
   * @param {View} componentOrView
   */
  subscribe (componentOrView) {
    // First we retrieve the existing, or create a new subscription (and add to the pool).
    const subscription = this.getOrCreateSubscription(componentOrView)
    if (!subscription.subscribers[componentOrView._uid]) {
      // NOTE: make sure to remove it afterwards to avoid memory leaks!
      subscription.subscribers[componentOrView._uid] = componentOrView
      // Then we recompute the query, checking if variables match, and action name is set.
      this.recompute(subscription)
      // regardless of whether this results in a restart, we take this opertunity to preset the componentOrView store if needed
      const errors = []
      // start the global callback first
      this.globalCallback.init(store, errors)
      // if the callbacks class has an init method defined, use it
      for (const callback of subscription.callbacks) {
        // if any of the views currently using this subscription have an init hook, trigger it (which will check if its needed)
        if (callback.init) {
          callback.init(store, errors)
          for (const error of errors) {
            store.commit('SET_ALERT', new Alert(error[0], null, 'error'), { root: true })
            // eslint-disable-next-line no-console
            console.warn(...error)
            subscription.handleViewState(ViewState.ERROR, error('Error presetting view state'))
          }
        }
      }
    }
    // Otherwise we are calling subscribe for a component or view already subscribed.
  }

  /**
   * Start any pending subscriptions.
   */
  startSubscriptions () {
    const pendingSubscriptions = Object.values(this.subscriptions)
      .filter(subscription => {
        return subscription.observable === null || subscription.reload
      })
    pendingSubscriptions.forEach(subscription => this.startSubscription(subscription))
  }

  /**
   * Start a Subscription for a view or component.
   *
   * @param {Subscription} subscription
   */
  startSubscription (subscription) {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug(
        `Starting subscription ${subscription.query.name}`,
        subscription
      )
    }
    subscription.handleViewState(ViewState.LOADING, null)

    // Stop if already running.
    if (subscription.observable !== null) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.debug(
          `Subscription for query [${subscription.query.name}] already running. Stopping it...`)
      }
      this.stopSubscription(subscription)
    }

    const globalCallback = this.globalCallback

    try {
      // Then start subscription.
      subscription.observable = this.startDeltasSubscription(
        subscription.query.query,
        subscription.query.variables,
        {
          next: function next (response) {
            /**
             * @type {Deltas}
             */
            const deltas = response.data.deltas || {}
            const added = deltas.added || {}
            const updated = deltas.updated || {}
            const pruned = deltas.pruned || {}
            const errors = []

            // run the global callback first
            globalCallback.onAdded(added, store, errors)
            globalCallback.onUpdated(updated, store, errors)
            globalCallback.onPruned(pruned, store, errors)

            // then run the local callbacks if there are any
            if (subscription.callbacks.length === 0) {
              return
            }
            for (const callback of subscription.callbacks) {
              callback.before(deltas, store, errors)
              callback.onAdded(added, store, errors)
              callback.onUpdated(updated, store, errors)
              callback.commit(store, errors)
            }
            for (const callback of [...subscription.callbacks].reverse()) {
              callback.onPruned(pruned, store, errors)
              callback.after(deltas, store, errors)
              callback.commit(store, errors)
            }
            for (const error of errors) {
              store.commit(
                'SET_ALERT',
                new Alert(error[0], null, 'error'),
                { root: true }
              )
              // eslint-disable-next-line no-console
              console.warn(...error)
            }
          },
          error: function error (err) {
            console.log('BUGGERED')
            subscription.handleViewState(ViewState.ERROR, err)
          }
        }
      )
      this.subscriptions[subscription.query.name] = subscription
      // All done!
      subscription.handleViewState(ViewState.COMPLETE, null)
      subscription.reload = false
    } catch (e) {
      subscription.handleViewState(ViewState.ERROR, e)
      debugger
    }
  }

  /**
   * Create and start a deltas GraphQL subscription. It will result in a JS
   * Observable being created to monitor the subscription. Apollo Client is
   * used here to create the observer and the subscription.
   *
   * @param {DocumentNode} query - an already parsed GraphQL query (i.e. not a `string`)
   * @param {Object} variables
   * @param {SubscriptionOptions} subscriptionOptions - { next(), error() }
   * @returns {Subscription}
   */
  startDeltasSubscription (query, variables, subscriptionOptions) {
    if (!query) {
      throw new Error('You must provide a query for the subscription')
    }
    if (!variables) {
      variables = {}
    }
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug('graphql query:', query.loc.source.body)
      // eslint-disable-next-line no-console
      console.debug('graphql variables:', variables)
    }
    return this.apolloClient.subscribe({
      query,
      variables,
      fetchPolicy: 'no-cache'
    }).subscribe({
      next (value) {
        subscriptionOptions.next(value)
      },
      error (errorValue) {
        subscriptionOptions.error(errorValue)
      }
    })
  }

  unsubscribe (componentOrView) {
    const subscription = this.subscriptions[componentOrView.query.name]
    if (!subscription) {
      // eslint-disable-next-line no-console
      console.warn(`Could not unsubscribe [${componentOrView.query.name}]: Not Found`)
      return
    }
    // Remove viewOrComponent subscriber
    delete subscription.subscribers[componentOrView._uid]
    // If no more subscribers, then stop the subscription.
    if (Object.keys(subscription.subscribers).length === 0) {
      this.stopSubscription(subscription)
    }
  }

  stopSubscription (subscription) {
    // Stop WebSockets subscription.
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug(`Stopping subscription ${subscription.query.name}`)
    }
    subscription.observable.unsubscribe()
    for (const callback of subscription.callbacks) {
      callback.tearDown(store)
    }
    delete this.subscriptions[subscription.query.name]
  }

  // --- Merging GraphQL queries...

  /**
   * @param {Subscription} subscription
   */
  recompute (subscription) {
    const subscribers = Object.values(subscription.subscribers)
    if (subscribers.length === 0) {
      throw new Error('Error recomputing subscription: No Subscribers.')
    }

    // We will use the first subscriber to compare its variables, and also will
    // merge other queries into its base query, in-place.
    /**
     * @type {Vue}
     */
    const baseSubscriber = subscribers[0]

    // Reset.
    const initialQuery = print(baseSubscriber.query.query)
    subscription.query.query = baseSubscriber.query.query
    subscription.callbacks = baseSubscriber.query.callbacks

    for (const subscriber of subscribers.slice(1)) {
      // NB: We can remove this check if we so want, as the library used to combine queries
      //     supports merging variables too. Only issue would be the possibility of merging
      //     subscriptions for different workflows by accident...
      if (!isEqual(subscriber.query.variables, baseSubscriber.query.variables)) {
        throw new Error('Error recomputing subscription: Query variables do not match.')
      }
      baseSubscriber.query.query = mergeQueries(baseSubscriber.query.query, subscriber.query.query)
      // Combine the arrays of callbacks, creating an array of unique callbacks.
      // The callbacks are compared by their class/constructor name.

      for (const callback of subscriber.query.callbacks) {
        // comparing by constructor name does not work as the minifier normalizer these names and because we have two subscriptions and the normalized
        // callback names are assigned to these independently, from what looks like a predefined set of possible options [t,n]
        // So this block wont work as it compares and decides it already exists when it doesn't
        if (!subscription.callbacks.find(element => {
          const elementObjectKeys = Object.keys(element)
          const callbackObjectKeys = Object.keys(callback)
          // this fall through approach is a bit easier to read and should conserve some memory as object keys dont need to be recalculated each time
          if (element.constructor.name === callback.constructor.name) {
            if (elementObjectKeys.length === callbackObjectKeys.length) {
              if (elementObjectKeys.sort().join() === callbackObjectKeys.sort().join()) {
                return true
              }
            }
          }
          return false
        })) {
          subscription.callbacks.push(callback)
        }
      }
    }
    const finalQuery = print(baseSubscriber.query.query)
    // TODO: consider using a better approach than print(a) === print(b)
    // If we changed the query due to query-merging, then we know we must reload its
    // GraphQL subscription (i.e. stop subscription, start a new one with the server).
    if (initialQuery !== finalQuery) {
      subscription.reload = true
    }
    // And here we set the new merged-query. Voila!
    subscription.query.query = baseSubscriber.query.query
  }
}

export default WorkflowService
