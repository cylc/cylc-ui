import ApolloClient from 'apollo-client'
import { ApolloLink, split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import store from '@/store'

/**
 * Create the HTTP and WebSocket URLs for an ApolloClient.
 *
 * @private
 * @return {{wsUrl: string, httpUrl: string}}
 * @private
 */
export function createGraphQLUrls () {
  // TODO: revisit this and evaluate other ways to build the GraphQL URL - not safe to rely on window.location (?)
  const baseUrl = `${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}${window.location.pathname}`
  const httpUrl = `${window.location.protocol}//${baseUrl}graphql`
  const wsUrl = `${window.location.protocol.startsWith('https') ? 'wss' : 'ws'}://${baseUrl}subscriptions`
  return {
    httpUrl: httpUrl,
    wsUrl: wsUrl
  }
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
  const opts = Object.assign({
    reconnect: true,
    lazy: false
  }, options)
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
  //   store.commit('SET_ALERT', new Alert(error, null, 'error'))
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

  const wsLink = subscriptionClient !== null ? new WebSocketLink(subscriptionClient)
    : new ApolloLink() // return an empty link, useful for testing, offline mode, etc

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    wsLink,
    httpLink
  )

  return new ApolloClient({
    link: link,
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
    connectToDevTools: process.env.NODE_ENV !== 'production'
  })
}
