// import { createProvider } from './vue-apollo'
import ApolloClient from 'apollo-boost'
import { ApolloLink, concat } from 'apollo-link'
import axios from 'axios'
import { buildAxiosFetch } from 'axios-fetch'

export function createApolloClient (uri) {
  const authMiddleware = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        // FIXME: this is the random generated password, update every time it is generated for now!
        Authorization: 'Basic Y3lsYzpiaFRTbnRpWjRqR2YzSWR3eTlVMg=='
      }
    })
    return forward(operation)
  })
  const client = new ApolloClient({
    // You should use an absolute URL here
    uri: uri,
    // we must define fetch, as otherwise running unit tests it would fail as there is no global fetch variable
    fetch: buildAxiosFetch(axios)
  })
  client.link = concat(authMiddleware, client.link)
  return client
}

// GraphQL
const apolloClient = new ApolloClient({
  // You should use an absolute URL here
  uri: 'https://api.graphcms.com/simple/v1/awesomeTalksClone',
  // we must define fetch, as otherwise running unit tests it would fail as there is no global fetch variable
  fetch: buildAxiosFetch(axios)
})

export default apolloClient
