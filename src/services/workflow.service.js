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
import gql from 'graphql-tag'

// TODO: remove these once the api-on-the-fly mutations are hooked into the UI
const HOLD_WORKFLOW = gql`
mutation HoldWorkflowMutation($workflow: WorkflowID!) {
  hold (workflows: [$workflow]) {
    result
  }
}
`

const RELEASE_WORKFLOW = gql`
mutation ReleaseWorkflowMutation($workflow: WorkflowID!) {
  release (workflows: [$workflow]){
    result
  }
}
`

const STOP_WORKFLOW = gql`
mutation StopWorkflowMutation($workflow: WorkflowID!) {
  stop (workflows: [$workflow]) {
    result
  }
}
`

class SubscriptionWorkflowService extends GQuery {
  /**
   * @constructor
   * @param {string} httpUrl
   * @param {SubscriptionClient|null} subscriptionClient
   */
  constructor (httpUrl, subscriptionClient) {
    super()
    this.apolloClient = createApolloClient(httpUrl, subscriptionClient)
    this.observable = null
  }

  recompute () {
    super.recompute()
    this.request()
  }

  request () {
    /**
     * Perform a REST GraphQL request for all subscriptions.
     */
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('graphql request:', this.query)
    }
    if (!this.query) {
      return null
    }
    if (this.observable !== null) {
      this.observable.unsubscribe()
      this.observable = null
    }
    const vm = this
    const query = this.apolloClient.watchQuery({
      query: this.query,
      fetchPolicy: 'no-cache'
    })
    // HACK: remove it later
    console.warn = function () {}
    query.subscribeToMore({
      document: gql`
        subscription {
          deltas (id: "kinow|five") {
            pruned {
              tasks
              jobs
            }
            workflow {
              id
              status
              tasks {
                id
                name
                meanElapsedTime
              }
              jobs {
                id
                state
                batchSysName
                batchSysJobId
              }
            }
          }
        }
      `,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }
        const deltas = subscriptionData.data.deltas
        store.dispatch('workflows/updateDeltas', { deltas })
      }
    })
    this.observable = query
      .subscribe({
        next (result) {
          // commit results
          store.dispatch(
            'workflows/set',
            result.data.workflows
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
}

export default SubscriptionWorkflowService
