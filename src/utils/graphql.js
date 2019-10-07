import ApolloClient from 'apollo-boost'
import axios from 'axios'
import { buildAxiosFetch } from 'axios-fetch'
import { ApolloLink, split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

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
    // we must define fetch, as otherwise running unit tests it would fail as there is no global fetch variable
    fetch: buildAxiosFetch(axios),
    fetchOptions: {
      link: link
    }
  })
}
