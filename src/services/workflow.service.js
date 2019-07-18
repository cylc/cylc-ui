import { GQuery } from '@/services/gquery'

class LiveWorkflowService extends GQuery {
  /**
     * WorkflowService for on-line work.
     * This class provides the functionality required for polling the GraphQL
     * endpoint.
     */

  constructor () {
    super()
    this.polling = setInterval(() => {
      this.request()
    }, 5000)
  }

  destructor () {
    clearInterval(this.polling)
  }
}

const workflowService = new LiveWorkflowService()

export { workflowService }
