import ApolloClient from 'apollo-boost'
import axios from 'axios'
import { buildAxiosFetch } from 'axios-fetch'

export function createApolloClient (uri) {
  return new ApolloClient({
    // You should use an absolute URL here
    uri: uri,
    // we must define fetch, as otherwise running unit tests it would fail as there is no global fetch variable
    fetch: buildAxiosFetch(axios)
  })
}
