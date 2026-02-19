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

import { cloneDeep, isEqual } from 'lodash'
import gql from 'graphql-tag'
import ViewState from '@/model/ViewState.model'
import Subscription from '@/model/Subscription.model'
import {
  dummyMutations,
  extractFields,
  findByName,
  getBaseType,
  getIntrospectionQuery,
  getMutationArgsFromTokens,
  mutate,
  primaryMutations,
  processMutations,
  query,
  tokenise
} from '@/utils/aotf'
import { store } from '@/store/index'
import { createApolloClient } from '@/graphql/index'
import { print } from 'graphql'
import mergeQueries from '@/graphql/merge'
import { Alert } from '@/model/Alert.model'
import CylcTreeCallback from '@/services/treeCallback'

/** @typedef {import('graphql').DocumentNode} DocumentNode */
/** @typedef {import('graphql').IntrospectionInputType} IntrospectionInputType */
/** @typedef {import('subscriptions-transport-ws').SubscriptionClient} SubscriptionClient */
/** @typedef {import('@/utils/aotf').Mutation} Mutation */
/** @typedef {import('@/utils/aotf').MutationResponse} MutationResponse */
/** @typedef {import('@/utils/aotf').Query} Query */

/**
 * @typedef {Object} IntrospectionObj
 * @property {Mutation[]} mutations
 * @property {Mutation[]} queries
 * @property {IntrospectionInputType[]} types
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
   * @param {?SubscriptionClient} subscriptionClient
   */
  constructor (httpUrl, subscriptionClient) {
    this.debug = import.meta.env.MODE !== 'production'

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
     * @type {Object.<string, Subscription>}
     */
    this.subscriptions = {}

    // mutations defaults
    this.primaryMutations = primaryMutations

    this.introspection = this.loadTypes()

    // create & start the global callback
    this.globalCallback = new CylcTreeCallback()
    this.globalCallback.init(store, [])
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
   * @param {string} mutationName
   * @param {string} id
   * @returns {Promise<MutationResponse>}
   */
  async mutate (mutationName, id, args = {}) {
    const mutation = await this.getMutation(mutationName)
    return await mutate(
      mutation,
      {
        ...getMutationArgsFromTokens(
          mutation,
          tokenise(id),
        ),
        ...args
      },
      this.apolloClient
    )
  }

  /**
   * Send a query.
   *
   * @param {string} queryName
   * @param {Object} args
   * @param {Field[]} fields
   * @return {Promise<Object>}
   * @memberof WorkflowService
   */
  async query (queryName, args, fields) {
    const queryObj = await this.getQuery(queryName, Object.keys(args), fields)
    return await query(
      queryObj,
      args,
      this.apolloClient
    )
  }

  async query2 (query, variables) { // TODO: refactor or come up with better name
    const response = await this.apolloClient.query({
      query,
      variables,
      fetchPolicy: 'no-cache'
    })
    return response
  }

  /**
   * Load mutations, queries and types from GraphQL introspection.
   *
   * @returns {Promise<IntrospectionObj>}
   */
  async loadTypes () {
    // TODO: this assumes all workflows use the same schema which is and
    //       isn't necessarily true, not quite sure, come back to this later.
    let response
    try {
      response = await this.apolloClient.query({
        query: getIntrospectionQuery(),
        fetchPolicy: 'no-cache'
      })
    } catch (err) {
      console.error(err)
      // eslint-disable-next-line no-console
      console.log('retrying introspection query')
      await new Promise(resolve => setTimeout(resolve, 2000))
      return this.loadTypes()
    }
    const mutations = response.data.__schema.mutationType.fields
    const queries = response.data.__schema.queryType.fields
    const { types } = response.data.__schema
    mutations.push(...dummyMutations)
    processMutations(mutations, types)
    return { mutations, queries, types }
  }

  /**
   * Return a mutation by name.
   *
   * @param {string} mutationName
   * @returns {Promise<Mutation=>}
   */
  async getMutation (mutationName) {
    const { mutations } = await this.introspection
    return findByName(mutations, mutationName)
  }

  /**
   * Return a GraphQL query for a type, containing the given fields.
   *
   * @param {string} queryName - Name of the GraphQL query available in the schema.
   * @param {string[]} argNames - Names of args to supply in the query (note: the variables (i.e. values of the args) are supplied elsewhere).
   * @param {Field[]} fields - Fields to include in the query.
   * @return {Promise<Query>}
   */
  async getQuery (queryName, argNames, fields) {
    const { queries, types } = await this.introspection
    const queryObj = findByName(queries, queryName)
    const typeName = getBaseType(queryObj.type).name
    const type = findByName(types, typeName)

    return {
      name: queryName,
      args: queryObj.args.filter(({ name }) => argNames.includes(name)),
      fields: extractFields(type, fields, types)
    }
  }

  // --- GraphQL query subscriptions

  /**
   * @param {SubscriptionQuery} query
   * @returns {Subscription}
   */
  getOrCreateSubscription (query) {
    // note, this will force a return of the FIRST query of the SAME name as any subsequent queries
    return (this.subscriptions[query.name] ??= new Subscription(query))
  }

  /**
   * @param {View} componentOrView
   */
  subscribe (componentOrView) {
    // First we retrieve the existing, or create a new subscription (and add to the pool).
    const subscription = this.getOrCreateSubscription(componentOrView.query)
    if (!subscription.subscribers[componentOrView._uid]) {
      // NOTE: make sure to remove it afterwards to avoid memory leaks!
      subscription.subscribers[componentOrView._uid] = componentOrView
      // Then we recompute the query, checking if variables match, and action name is set.
      this.recompute(subscription)
      // regardless of whether this results in a restart, we take this opportunity to preset the componentOrView store if needed
      const errors = []
      // if the callbacks class has an init method defined, use it
      for (const callback of subscription.callbacks) {
        // if any of the views currently using this subscription have an init hook, trigger it (which will check if its needed)
        if (callback.init) {
          callback.init(store, errors)
          for (const error of errors) {
            store.commit('SET_ALERT', new Alert(error[0], 'error'), { root: true })
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
      this.stopSubscription(subscription, true)
    }
    if (subscription.query.isDelta === false & subscription.query.isGlobalCallback === false) {
      try {
        // Then start subscription.
        subscription.observable = this.startCylcSubscription(
          subscription.query.query,
          subscription.query.variables,
          {
            next: function next (response) {
              if (subscription.callbacks.length === 0) {
                return
              }
              const errors = []
              for (const callback of subscription.callbacks) {
                callback.onAdded(response.data.logs, store, errors)
                callback.commit(store, errors)
              }
            },
            error: function error (err) {
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
      }
    } else {
      const globalCallback = this.globalCallback
      try {
        // Then start subscription.
        subscription.observable = this.startCylcSubscription(
          subscription.query.query,
          subscription.query.variables,
          {
            next: function next (response) {
              const deltas = response.data.deltas || {}
              const added = deltas.added || {}
              const updated = deltas.updated || {}
              const pruned = deltas.pruned || {}
              const errors = []

              // run the global callback first
              globalCallback.before(deltas, store, errors)
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
                  new Alert(error[0], 'error'),
                  { root: true }
                )
                console.warn(...error)
              }
            },
            error: function error (err) {
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
      }
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
  startCylcSubscription (query, variables, subscriptionOptions) {
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

  /**
   * Remove subscriber and stop subscription.
   *
   * @param {SubscriptionQuery} query - The component/view's subscription query.
   * @param {string} uid - The unique ID for the component/view.
   */
  unsubscribe (query, uid) {
    const subscription = this.subscriptions[query.name]
    if (!subscription) {
      console.warn(`Could not unsubscribe [${query.name}]: Not Found`)
      return
    }
    // Remove viewOrComponent subscriber
    delete subscription.subscribers[uid]
    // If no more subscribers, then stop the subscription.
    if (Object.keys(subscription.subscribers).length === 0) {
      this.stopSubscription(subscription)
    }
    // TODO: recompute, unsubscribe and wipe unwanted store data
    // see https://github.com/cylc/cylc-ui/issues/2479
    // * The subscription has changed, there may be data we no longer need
    // * Recompute the subscription.
    // * Reload the subscription if needed.
    // * Remove objects requested before which are no longer needed.
    // this.recompute(subscription)
    // this.startSubscriptions()
    // store.commit(...)
  }

  /* Stop a subscription.
   *
   * If the subscription is the "workflow" subscription the datastore
   * housekeeping will be invoked unless `reload === true`.
   */
  stopSubscription (subscription, reload) {
    // Stop WebSockets subscription.
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug(`Stopping subscription ${subscription.query.name}`)
    }
    subscription.observable.unsubscribe()
    for (const callback of subscription.callbacks) {
      callback.tearDown(store)
    }
    if (!reload && subscription.query.name === 'workflow') {
      // Remove all children in the store for each workflow in the subscription.
      // This is how the store gets housekept when we change workflow.
      //
      // Because of this we cannot request cycles/edges/families/namespaces
      // in the global subscription.
      //
      // Longer term the solution is to have views provide lists of the fields
      // they require for tasks/cycles/namespaces etc and have the
      // WorkflowService construct the query from this information. That way the
      // WorkflowService will know what data to remove when a subscription is
      // stopped.
      store.commit(
        'workflows/REMOVE_CHILDREN',
        subscription.query.variables.workflowId
      )
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
    // merge other queries into a copy of the base query
    /**
     * @type {Vue}
     */
    const baseSubscriber = subscribers[0]

    // Reset.
    const initialQuery = subscription.query.query
    let finalQuery = cloneDeep(initialQuery)
    // subscription.query.query = baseSubscriber.query.query
    subscription.callbacks = baseSubscriber.query.callbacks

    for (const subscriber of subscribers.slice(1)) {
      // NB: We can remove this check if we so want, as the library used to
      // combine queries supports merging variables too. Only issue would be
      // the possibility of merging subscriptions for different workflows by
      // accident...
      if (!isEqual(subscriber.query.variables, baseSubscriber.query.variables)) {
        throw new Error('Error recomputing subscription: Query variables do not match.')
      }
      finalQuery = mergeQueries(finalQuery, subscriber.query.query)
      // Combine the arrays of callbacks, creating an array of unique
      // callbacks.  The callbacks are compared by their class/constructor
      // name.

      for (const callback of subscriber.query.callbacks) {
        // comparing by constructor name does not work as the minifier
        // normalizer these names and because we have two subscriptions and the
        // normalized callback names are assigned to these independently, from
        // what looks like a predefined set of possible options [t,n] So this
        // block wont work as it compares and decides it already exists when it
        // doesn't
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
    // TODO: consider using a better approach than print(a) === print(b)
    // If we changed the query due to query-merging, then we know we must
    // reload its GraphQL subscription (i.e. stop subscription, start a new one
    // with the server).
    if (print(initialQuery) !== print(finalQuery)) {
      subscription.reload = true
      // And here we set the new merged-query. Voila!
      // NOTE: we-recreate the gql object because it contains derived attributes
      // which may only get updated by doing this
      // see https://github.com/cylc/cylc-ui/issues/1110
      subscription.query.query = gql(print(finalQuery))
    }
  }
}

export default WorkflowService
