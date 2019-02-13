// import { createProvider } from './vue-apollo'
import ApolloClient from 'apollo-boost'

// GraphQL
const apolloClient = new ApolloClient({
  // You should use an absolute URL here
  uri: "https://api.graphcms.com/simple/v1/awesomeTalksClone"
})

export default apolloClient
