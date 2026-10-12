/*
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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
import { Subscription } from '@/model/Subscription.model'
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
  tokenise,
} from '@/utils/aotf'
import { store } from '@/store/index'
import { createApolloClient } from '@/graphql/index'
import { print } from 'graphql'
import mergeQueries from '@/graphql/merge'

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

export class WorkflowService {
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
    store.commit('workflows/CREATE')
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
        ...args,
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
      fetchPolicy: 'no-cache',
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
        fetchPolicy: 'no-cache',
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
      fields: extractFields(type, fields, types),
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
    if (!subscription.subscribers.has(componentOrView._uid)) {
      // NOTE: make sure to remove it afterwards to avoid memory leaks!
      subscription.subscribers.set(componentOrView._uid, componentOrView)
      // Then we recompute the query, checking if variables match, and action name is set.
      this.recompute(subscription)
    }
    // Otherwise we are calling subscribe for a component or view already subscribed.
  }

  /**
   * Start any pending subscriptions.
   */
  startSubscriptions () {
    for (const subscription of Object.values(this.subscriptions)) {
      if (!subscription.observable || subscription.reload) {
        this.startSubscription(subscription)
      }
    }
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
    if (subscription.observable) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.debug(
          `Subscription for query [${subscription.query.name}] already running. Stopping it...`)
      }
      this.stopSubscription(subscription, true)
    }

    try {
      // Then start subscription.
      subscription.observable = this.startCylcSubscription(subscription.query).subscribe({
        next: subscription.query.next ?? ((response) => {
          const deltas = response.data.deltas || {}
          const { added, updated, pruned } = deltas

          // Wipe all child nodes from a workflow in the data store if a reloaded
          // delta is received. Reloaded deltas are sent whenever a workflow is
          // restarted or reloaded (note, restarting a workflow implicitly reloads
          // it).
          //
          // When a workflow reloads it is hard to generate the relevant pruned
          // and updated deltas to remove any objects which have been wiped out by
          // the configuration change, so the easiest solution is to wipe the
          // entire tree under the workflow and rebuild from scratch. If we don't
          // do this, we can end up with nodes in the store which aren't meant to be
          // there and won't get pruned.
          if (updated?.workflow?.reloaded) {
            store.commit('workflows/REMOVE_CHILDREN', (updated.workflow.id))
          }
          if (added?.workflow?.reloaded) {
            store.commit('workflows/REMOVE_CHILDREN', (added.workflow.id))
          }

          // then the local before hooks if there are any
          for (const { query } of subscription.subscribers.values()) {
            query?.hooks?.onBeforeDelta?.(deltas)
          }

          // then the global store updates
          if (added) store.commit('workflows/UPDATE_DELTAS', added)
          if (updated) store.commit('workflows/UPDATE_DELTAS', updated)
          if (pruned) store.commit('workflows/REMOVE_DELTAS', pruned)

          // then the main local hooks if there are any
          for (const { query } of subscription.subscribers.values()) {
            query?.hooks?.onDelta?.(deltas)
          }
        }),
        error: (err) => {
          // e.g. if the subscription query requests a non-existent field
          subscription.handleViewState(ViewState.ERROR, err)
        },
      })
      this.subscriptions[subscription.query.name] = subscription
      // All done!
      subscription.handleViewState(ViewState.COMPLETE)
      subscription.reload = false
    } catch (e) {
      subscription.handleViewState(ViewState.ERROR, e)
    }
  }

  /**
   * Create and start a deltas GraphQL subscription. It will result in a JS
   * Observable being created to monitor the subscription. Apollo Client is
   * used here to create the observer and the subscription.
   *
   * @param {SubscriptionQuery} subscriptionQuery
   * @returns {import('zen-observable-ts').Observable}
   */
  startCylcSubscription ({ query, variables }) {
    if (!query) {
      throw new Error('You must provide a query for the subscription')
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
      fetchPolicy: 'no-cache',
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
    subscription.subscribers.delete(uid)
    // If no more subscribers, then stop the subscription.
    if (!subscription.subscribers.size) {
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

  /**
   * Stop a subscription.
   *
   * If the subscription is the "workflow" subscription the datastore
   * housekeeping will be invoked unless `reload === true`.
   *
   * @param {Subscription} subscription
   * @param {boolean} reload
   */
  stopSubscription (subscription, reload) {
    // Stop WebSockets subscription.
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug(`Stopping subscription ${subscription.query.name}`)
    }
    subscription.observable.unsubscribe()
    for (const { query } of subscription.subscribers.values()) {
      query?.hooks?.tearDown?.()
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
        subscription.query.variables.workflowID
      )
    }
    delete this.subscriptions[subscription.query.name]
  }

  // --- Merging GraphQL queries...

  /**
   * @param {Subscription} subscription
   */
  recompute (subscription) {
    if (!subscription.subscribers.size) {
      throw new Error('Error recomputing subscription: No Subscribers.')
    }
    const subscribersIter = subscription.subscribers.values()
    // We will pop the first subscriber to compare its variables, and also will
    // merge other queries into a copy of the base query
    const baseSubscriber = subscribersIter.next().value

    // Reset.
    const initialQuery = subscription.query.query
    let finalQuery = cloneDeep(initialQuery)

    // Iterate over the remaining subscribers
    for (const subscriber of subscribersIter) {
      // NB: We can remove this check if we so want, as the library used to
      // combine queries supports merging variables too. Only issue would be
      // the possibility of merging subscriptions for different workflows by
      // accident...
      if (!isEqual(subscriber.query.variables, baseSubscriber.query.variables)) {
        throw new Error('Error recomputing subscription: Query variables do not match.')
      }
      finalQuery = mergeQueries(finalQuery, subscriber.query.query)
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
