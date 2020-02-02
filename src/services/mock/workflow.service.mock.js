import { checkpoint } from '@/services/mock/checkpoint.js'
import { GQuery } from '@/services/gquery'
import store from '@/store/index'

/**
 * Stand-in WorkflowService for off-line work.
 * This class provides the functionality for fetching mock data.
 */
class MockWorkflowService extends GQuery {
  constructor () {
    super(/* enableWebSockets */ false)
    // load mock data
    store.dispatch('workflows/set', checkpoint.workflows).then(() => {})
  }

  /**
   * Subscribe to a query.
   * This wraps the GQuery method to set each subscription to active.
   * @param view
   * @param query
   * @return {number}
   */
  subscribe (view, query) {
    const id = super.subscribe(view, query)
    this.subscriptions.every(s => {
      s.active = true
    })
    this.callbackActive()
    return id
  }
}

export { MockWorkflowService }

export default MockWorkflowService
