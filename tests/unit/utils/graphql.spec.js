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

import { describe, it, expect } from 'vitest'
import {
  createApolloClient,
  createGraphQLUrls,
  createSubscriptionClient
} from '@/graphql'

describe('graphql', () => {
  describe('ApolloClient', () => {
    it('should create an apollo client', () => {
      const apolloClient = createApolloClient('http://localhost:12345', null)
      expect(apolloClient.link).toBeTruthy()
      expect(apolloClient.cache).toBeTruthy()
    })
  })

  describe('SubscriptionClient', () => {
    it('creates a subscription client', () => {
      const subscriptionClient = createSubscriptionClient('ws://localhost:12345')
      expect(subscriptionClient.on).toBeTypeOf('function')
    })
  })

  describe('GraphQL URLs', () => {
    it('should create the correct URLs', () => {
      const graphQLUrls = createGraphQLUrls()
      expect(graphQLUrls.httpUrl.slice(0, 4)).to.equal('http')
      expect(graphQLUrls.wsUrl.slice(0, 2)).to.equal('ws')
    })
  })
})
