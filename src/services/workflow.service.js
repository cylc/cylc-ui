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

import { GQuery } from '@/services/gquery'
import store from '@/store/'
import Alert from '@/model/Alert.model'
import { createApolloClient } from '@/utils/graphql'
import { HOLD_WORKFLOW, RELEASE_WORKFLOW, STOP_WORKFLOW } from '@/graphql/queries'
/* eslint-disable no-unused-vars */
import { SubscriptionClient } from 'subscriptions-transport-ws'
import ZenObservable from 'zen-observable'
import { DocumentNode } from 'graphql'
/* eslint-enable no-unused-vars */

class SubscriptionWorkflowService extends GQuery {
  /**
   * @constructor
   * @param {string} httpUrl
   * @param {SubscriptionClient|null} subscriptionClient
   */
  constructor (httpUrl, subscriptionClient) {
    super()
    this.subscriptionClient = subscriptionClient
    this.apolloClient = createApolloClient(httpUrl, subscriptionClient)
    this.observable = null
    this.debug = process.env.NODE_ENV !== 'production'
  }

  recompute () {
    super.recompute()
    this.request()
  }

  request () {
    /**
     * Perform a REST GraphQL request for all subscriptions.
     */
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug('graphql request:', this.query)
    }
    if (!this.query) {
      return null
    }
    const vm = this
    if (this.observable !== null) {
      this.observable.unsubscribe()
      this.observable = null
    }
    this.observable = this.apolloClient.subscribe({
      query: this.query,
      fetchPolicy: 'no-cache'
    }).subscribe({
      next (response) {
        // commit results
        store.dispatch(
          'workflows/set',
          response.data.workflows
        )
        // set all subscriptions to active
        vm.subscriptions
          .filter(s => s.active === false)
          .forEach(s => { s.active = true })
        // run callback functions on the views
        vm.callbackActive()
      },
      error (err) {
        store.dispatch(
          'setAlert',
          new Alert(err.message, null, 'error')
        )
      },
      complete () {
      }
    })
  }

  // mutations

  releaseWorkflow (workflowId) {
    return this.apolloClient.mutate({
      mutation: RELEASE_WORKFLOW,
      variables: {
        workflow: workflowId
      }
    })
  }

  holdWorkflow (workflowId) {
    return this.apolloClient.mutate({
      mutation: HOLD_WORKFLOW,
      variables: {
        workflow: workflowId
      }
    })
  }

  stopWorkflow (workflowId) {
    return this.apolloClient.mutate({
      mutation: STOP_WORKFLOW,
      variables: {
        workflow: workflowId
      }
    })
  }

  // deltas

  /**
   * Create and start a subscription.
   *
   * @param query {DocumentNode} - an already parsed GraphQL query (i.e. not a `string`)
   * @param variables
   * @param subscriptionOptions
   * @returns {Promise<ZenObservable.Subscription>}
   */
  startSubscription (query, variables, subscriptionOptions) {
    if (!query) {
      throw new Error('You must provide a query for the subscription')
    }
    if (!subscriptionOptions || !subscriptionOptions.next || !subscriptionOptions.error) {
      throw new Error('You must provide the next and error callbacks for the subscription')
    }
    if (!variables) {
      variables = {}
    }
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug('graphql request:', query)
    }
    return new Promise((resolve, reject) => {
      /**
       * @type {ZenObservable.Subscription<*>}
       */
      const subscription = this.apolloClient.subscribe({
        query: query,
        variables: variables,
        fetchPolicy: 'no-cache'
      }).subscribe({
        next (value) {
          subscriptionOptions.next(value)
        },
        error (errorValue) {
          subscriptionOptions.error(errorValue)
        }
      })
      resolve(subscription)
    })
  }

  /**
   * @param subscription {ZenObservable.Subscription} - An active subscription
   */
  stopSubscription (subscription) {
    subscription.unsubscribe()
  }
}

export default SubscriptionWorkflowService
