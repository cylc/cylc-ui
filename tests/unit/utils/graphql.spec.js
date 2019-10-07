import { expect } from 'chai'
// need the polyfill as otherwise ApolloClient fails to be imported as it checks for a global fetch object on import...
import 'cross-fetch/polyfill'
import { createApolloClient } from '@/utils/graphql'

describe('utils', () => {
  describe('graphql', () => {
    it('should create an apollo client', () => {
      const uri = 'http://localhost:12345'
      const apolloClient = createApolloClient(uri)
      expect(apolloClient.link !== null).to.equal(true)
    })
  })
})
