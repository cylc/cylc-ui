import { GQuery } from '@/services/gquery'
import store from '@/store/'
import Alert from '@/model/Alert.model'

class SubscriptionWorkflowService extends GQuery {
  constructor (apolloClient) {
    super(apolloClient)
    /**
     * @type {object}
     */
    this.observable = null
  }

  destructor () {
    if (this.observable !== null) {
      this.observable.unsubscribe()
    }
    this.observable = null
  }

  recompute () {
    this.destructor()
    super.recompute()
    if (this.query !== null) {
      this.request()
    }
  }

  request () {
    /**
     * Perform a REST GraphQL request for all subscriptions.
     */
    if (process.env.NODE_ENV !== 'production') {
      console.debug('graphql request:', this.query)
    }
    if (!this.query) {
      return null
    }
    const vm = this
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
}

export default SubscriptionWorkflowService
