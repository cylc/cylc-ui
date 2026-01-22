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

import { SubscriptionClient } from 'subscriptions-transport-ws'
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client/core'
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'
import { setContext } from '@apollo/client/link/context'
import { store } from '@/store/index'
import { createUrl, getXSRFHeaders } from '@/utils/urls'

/** @typedef {import('subscriptions-transport-ws').ClientOptions} ClientOptions */

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
    wsUrl,
  }
}

/**
 * Create a subscription client.
 *
 * @private
 * @param {string} wsUrl - WebSocket subscription URL
 * @param {ClientOptions} options - SubscriptionClient options
 * @param {*} wsImpl - WebSocket implementation (native by default)
 * @return {SubscriptionClient} a subscription client
 */
export function createSubscriptionClient (wsUrl, options = {}, wsImpl = null) {
  /** @type {ClientOptions} */
  const opts = {
    reconnect: true,
    lazy: false,
    // Raise initial connection timeout from 1->3 secs to try to mitigate slow connection problem
    // https://github.com/cylc/cylc-ui/issues/1200
    minTimeout: 3e3,
    ...options,
  }
  const subscriptionClient = new SubscriptionClient(wsUrl, opts, wsImpl)
  // these are the available hooks in the subscription client lifecycle
  subscriptionClient.onConnecting(() => {
    store.commit('SET_OFFLINE', true)
  })
  subscriptionClient.onConnected(() => {
    store.commit('SET_OFFLINE', false)
  })
  subscriptionClient.onReconnecting(() => {
    store.commit('SET_OFFLINE', true)
  })
  subscriptionClient.onReconnected(() => {
    store.commit('SET_OFFLINE', false)
  })
  subscriptionClient.onDisconnected(() => {
    store.commit('SET_OFFLINE', true)
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
    uri: httpUrl,
  })

  const wsLink = subscriptionClient !== null
    ? new WebSocketLink(subscriptionClient)
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
        ...getXSRFHeaders(),
      },
    }
  })

  return new ApolloClient({
    link: wsAuthLink.concat(link),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    },
    devtools: {
      enabled: import.meta.env.MODE !== 'production',
    },
  })
}
