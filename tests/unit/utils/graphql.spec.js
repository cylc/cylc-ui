import { expect } from 'chai'
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
