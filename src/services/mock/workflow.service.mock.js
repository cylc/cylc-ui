import { checkpoint } from '@/services/mock/checkpoint.js'
import { GQuery } from '@/services/gquery'
import store from '@/store/'

class MockWorkflowService extends GQuery {
  /**
     * Stand-in WorkflowService for off-line work.
     * This class provides the functionality for fetching mock data.
     */

  constructor () {
    super()
    // load mock data
    store.dispatch('workflows/set', checkpoint.workflows)
  }

  subscribe (view, query) {
    /**
         * Subscribe to a query.
         * This wraps the GQuery method to set each subscription to active.
         */
    const id = super.subscribe(view, query)
    this.subscriptions.every(s => {
      s.active = true
    })
    this.callbackActive()
    return id
  }
}

const workflowService = new MockWorkflowService()

export { workflowService }
