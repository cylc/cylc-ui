import ApolloClient from 'apollo-client'
import { ApolloLink, split } from 'apollo-link'
import dedent from 'dedent'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'

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

/** Walk a GraphQL type yielding all composite types on route.
 *
 * E.G. NonNull<List<String>> would yield:
 *  1. NonNull
 *  2. List
 *  3. String
 *
 * @param type {Object} A type as returned by an introspction query.
 * (i.e. an object of the form {name: x, kind: y, ofType: z}
 *
 * @yields {Object} Type objects of the same form as the type argument.
 */
export function * iterateType (type) {
  while (type) {
    yield type
    type = type.ofType
  }
}

/** Return an appropriate null value for the specified type.
 *
 * @param type {Object} A type field as returned by an introspection query.
 * (an object of the form {name: x, kind: y, ofType: z}).
 * @param types {Array} An array of all types present in the schema.
 * (optional: used to resolve InputObjectType fields).
 *
 * @returns {Object|Array|undefined}
 */
export function getNullValue (type, types) {
  if (!types) {
    types = []
  }
  let ret = null
  let ofType = null
  for (const subType of iterateType(type)) {
    if (subType.kind === 'LIST') {
      ofType = getNullValue(subType.ofType)
      if (ofType) {
        // this list contains an object
        ret = [
          getNullValue(subType.ofType)
        ]
      } else {
        ret = []
      }
      break
    }
    if (subType.kind === 'INPUT_OBJECT') {
      ret = {}
      for (const type of types) {
        // TODO: this type iteration is already done in the mixin
        //       should we use the mixin or a subset there-of here?
        if (
          type.name === subType.name &&
          type.kind === subType.kind
        ) {
          for (const field of type.inputFields) {
            ret[field.name] = getNullValue(field.type)
          }
          break
        }
      }
      break
    }
  }
  return ret
}

/** Return the signature for an argument.
 *
 * E.G: NonNull<List<String>>  =>  [String]!
 *
 * @param arg {Object} An argument from a introspection query.
 *
 * @returns {string} A type string for use in a client query / mutation.
 */
export function argumentSignature (arg) {
  const stack = [...iterateType(arg.type)]
  stack.reverse()
  let ret = ''
  for (const type of stack) {
    if (
      type.name === null &&
      type.kind === 'LIST'
    ) {
      ret = `[${ret}]`
    } else if (
      type.name === null &&
      type.kind === 'NON_NULL'
    ) {
      ret = ret + '!'
    } else if (type.name) {
      ret = type.name
    } else {
      ret = type.kind
    }
  }
  return ret
}

/** Construct a mutation string from a mutation introspection.
 *
 * @param mutation {Object} A mutation as returned by an introspection query.
 *
 * @returns {string} A mutation string for a client to send to the server.
 */
export function constructMutation (mutation) {
  const argNames = []
  const argTypes = []
  for (const arg of mutation.args) {
    argNames.push(`${arg.name}: $${arg.name}`)
    argTypes.push(`$${arg.name}: ${argumentSignature(arg)}`)
  }

  return dedent`
    mutation ${mutation.name}(${argTypes.join(', ')}) {
      ${mutation.name}(${argNames.join(', ')}) {
        result
      }
    }
  `.trim()
}
