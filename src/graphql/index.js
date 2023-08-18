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

import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split
} from '@apollo/client/core'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { createClient } from 'graphql-ws'
import { store } from '@/store/index'
import { createUrl } from '@/utils/urls'

/**
 * Create the HTTP and WebSocket URLs for an ApolloClient.
 *
 * @return {{wsUrl: string, httpUrl: string}}
 * @private
 */
export function createGraphQLUrls () {
  const httpUrl = createUrl('graphql')
  const wsUrl = createUrl('subscriptions', true)
  return {
    httpUrl,
    wsUrl
  }
}

/**
 * Get request headers for use with UI Server requests.
 *
 * - Adds X-XSRFToken header for hubless token based auth.
 */
export function getCylcHeaders () {
  const xsrfToken = document.cookie.match('\\b_xsrf=([^;]*)\\b')
  const cylcHeaders = {}
  if (Array.isArray(xsrfToken) && xsrfToken.length > 0) {
    // pick the last match
    cylcHeaders['X-XSRFToken'] = xsrfToken.splice(-1)
  }
  return cylcHeaders
}

/**
 * Create a subscription client.
 *
 * @private
 * @param {string} wsUrl - WebSocket subscription URL
 * @param {{
 *   reconnect: boolean,
 *   lazy: boolean
 * }} options - SubscriptionClient options (only two main options added here, see their doc for more)
 * @param {*} wsImpl
 * @return {SubscriptionClient} a subscription client
 */
export function createSubscriptionClient (wsUrl, options = {}, wsImpl = null) {
  const subscriptionClient = createClient({
    url: wsUrl,
    shouldRetry: () => true,
    retryAttempts: 999999999999999,
    retryWait: async function waitForServerHealthyBeforeRetry () {
      // this is called when the connection fails
      // wait 2 seconds, then retry
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
    on: {
      connecting: () => {
        store.commit('SET_OFFLINE', true)
      },
      connected: (socket, payload) => {
        store.commit('SET_OFFLINE', false)
      },
      closed: (event) => {
        store.commit('SET_OFFLINE', true)
      },
      error: (error) => {
        console.error(error)
        store.commit('SET_OFFLINE', true)
      },
    }
  })

  // TODO: at the moment the error displays an Event object, but the browser also displays the problem, as well as the offline indicator
  //       would be nice to find a better error message using the error object
  // subscriptionClient.onError((error) => {
  //   console.error(error)
  //   store.commit('SET_ALERT', new Alert(error, 'error'))
  // })
  return subscriptionClient
}

/**
 * Create an ApolloClient using the given URI's.
 *
 * If a `queryUri` is provided, it will be used for handling Query operations.
 *
 * If a `subscriptionUri` is provided, it will be used for handling Subscription operations.
 *
 * If no `subscriptionUri` is provided, any Subscription operation will fail, as we will be
 * using an empty link (a simple instance of `ApolloLink`).
 *
 * The link object is actually a split function (from the `apollo-link` module). This function
 * works similarly to a ternary operator. Based on the operation, it will return a Query or
 * a Subscription link.
 *
 * @public
 * @param {string} httpUrl
 * @param {SubscriptionClient|null} subscriptionClient
 * @returns {ApolloClient} an ApolloClient
 */
export function createApolloClient (httpUrl, subscriptionClient) {
  const httpLink = new HttpLink({
    uri: httpUrl
  })

  const wsLink = subscriptionClient !== null
    ? new GraphQLWsLink(subscriptionClient)
    : new ApolloLink() // return an empty link, useful for testing, offline mode, etc

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    wsLink,
    httpLink
  )

  const wsAuthLink = setContext((_, { headers }) => {
    // add an X-XSRFToken header for hubless token based auth
    return {
      headers: {
        ...headers,
        ...getCylcHeaders()
      }
    }
  })

  return new ApolloClient({
    link: wsAuthLink.concat(link),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
      },
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
      }
    },
    connectToDevTools: import.meta.env.MODE !== 'production'
  })
}
