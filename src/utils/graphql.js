// import { createProvider } from './vue-apollo'
import ApolloClient from 'apollo-boost'
import axios from 'axios';
import { buildAxiosFetch } from 'axios-fetch'

// GraphQL
const apolloClient = new ApolloClient({
  // You should use an absolute URL here
  uri: "https://api.graphcms.com/simple/v1/awesomeTalksClone",
  // we must define fetch, as otherwise running unit tests it would fail as there is no global fetch variable
  fetch: buildAxiosFetch(axios)
});

export default apolloClient
