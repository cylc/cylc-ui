import ApolloClient from 'apollo-boost'
import { ApolloLink, split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

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
 * @param queryUri {string} Query URI, e.g. http://localhost:3000/graphql
 * @param subscriptionUri {object} Subscription URI, e.g. ws://localhost:3000/subscriptions
 * @returns {DefaultClient} an ApolloClient
 */
export function createApolloClient (queryUri, subscriptionUri = null) {
  const httpLink = new HttpLink({
    uri: queryUri
  })

  const wsLink = subscriptionUri !== null ? new WebSocketLink({
    uri: subscriptionUri,
    options: {
      reconnect: true
    }
  }) : new ApolloLink() // return an empty link, useful for testing

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    wsLink,
    httpLink
  )

  return new ApolloClient({
    fetchOptions: {
      link: link
    }
  })
}
