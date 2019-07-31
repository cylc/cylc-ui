import { GQuery } from '@/services/gquery'

class LiveWorkflowService extends GQuery {
  /**
     * WorkflowService for on-line work.
     * This class provides the functionality required for polling the GraphQL
     * endpoint.
     */

  constructor () {
    super()
    this.polling = null
  }

  destructor () {
    clearInterval(this.polling)
  }

  subscribe (view, query) {
    const ret = super.subscribe(view, query)
    if (!this.polling) {
      // start polling when we receive the first subscription
      this.polling = setInterval(() => {
        this.request()
      }, 5000)
      this.request()
    }
    return ret
  }
}

const workflowService = new LiveWorkflowService()

export { workflowService }
