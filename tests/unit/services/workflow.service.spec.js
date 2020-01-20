import { expect } from 'chai'
// need the polyfill as otherwise ApolloClient fails to be imported as it checks for a global fetch object on import...
import 'cross-fetch/polyfill'
import sinon from 'sinon'
import SubscriptionWorkflowService from '@/services/workflow.service'

describe('SubscriptionWorkflowService', () => {
  describe('request', () => {
    it('should debounce the request function', () => {
      // mocked createApolloClient because it will try to create a new ApolloClient and use a websocket
      const fakeClient = sinon.mock()
      const service = new SubscriptionWorkflowService(fakeClient)
      // because we don't want to call or test the actual request_ implementation, which would try to use a websocket
      const requestSpy = sinon.spy(service, 'request_')
      for (let i = 0; i < 10; i++) {
        service.request()
      }
      // now after 1 second the function should have been debounced
      setTimeout(() => {
        expect(requestSpy.callCount).to.equal(1)
        requestSpy.restore()
      }, 700)
    })
  })
})
