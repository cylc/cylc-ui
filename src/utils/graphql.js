// import { createProvider } from './vue-apollo'
import ApolloClient from 'apollo-boost'
import fetch from 'node-fetch'

// GraphQL
const apolloClient = new ApolloClient({
  // You should use an absolute URL here
  uri: "https://api.graphcms.com/simple/v1/awesomeTalksClone",
  // we must define fetch, as otherwise running unit tests it would fail as there is no global fetch variable
  fetch: fetch
});

export default apolloClient
