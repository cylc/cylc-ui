import dedent from 'dedent'
import { expect } from 'chai'
// need the polyfill as otherwise ApolloClient fails to be imported as it checks for a global fetch object on import...
import 'cross-fetch/polyfill'
import * as graphql from '@/utils/graphql'
import store from '@/store'

describe('utils', () => {
  describe('graphql', () => {
    describe('iterateType', () => {
      it('Should walk the type tree until it hits a solid foundation', () => {
        const nodes = [
          {
            name: null,
            kind: 'NON_NULL'
          },
          {
            name: null,
            kind: 'LIST'
          },
          {
            name: null,
            kind: 'NON_NULL'
          },
          {
            name: 'MyInputObject',
            kind: 'INPUT_OBJECT'
          }
        ]

        // chain these nodes together using the ofType field
        let prev = nodes[0]
        nodes.slice(1).forEach((node) => {
          prev.ofType = node
          prev = node
        })

        const result = []
        for (const node of graphql.iterateType(nodes[0])) {
          result.push(node)
        }

        expect(
          result
        ).to.deep.equal(
          nodes
        )
      })
    })

    describe('argumentSignature', () => {
      it('should correctly render the signature', () => {
        [
          // [type, signature]
          [
            {
              name: 'String',
              kind: 'SCALAR',
              ofType: null
            },
            'String'
          ],
          [
            {
              name: null,
              kind: 'NON_NULL',
              ofType: {
                name: 'String',
                kind: 'SCALAR',
                ofType: null
              }
            },
            'String!'
          ],
          [
            {
              name: null,
              kind: 'NON_NULL',
              ofType: {
                name: null,
                kind: 'LIST',
                ofType: {
                  name: null,
                  kind: 'NON_NULL',
                  ofType: {
                    name: 'String',
                    kind: 'SCALAR',
                    ofType: null
                  }
                }
              }
            },
            '[String!]!'
          ]
        ].forEach(([type, signature]) => {
          expect(
            graphql.argumentSignature({
              name: 'myArgument',
              type: type
            })
          ).to.equal(signature)
        })
      })
    })

    describe('getNullValue', () => {
      it('should pick appropriate default types', () => {
        [
          [ // String => null
            {
              type: 'String',
              kind: 'SCALAR'
            },
            null
          ],
          [ // NON_NULL<String> => null
            {
              type: null,
              kind: 'NON_NULL',
              ofType: {
                type: 'String',
                kind: 'SCALAR'
              }
            },
            null
          ],
          [ // LIST<String> => []
            {
              type: null,
              kind: 'LIST',
              ofType: {
                type: 'String',
                kind: 'SCALAR'
              }
            },
            []
          ],
          [ // NON_NULL<LIST<String>> => []
            {
              type: null,
              kind: 'NON_NULL',
              ofType: {
                type: null,
                kind: 'LIST',
                ofType: {
                  type: 'String',
                  kind: 'SCALAR'
                }
              }
            },
            []
          ]
        ].forEach((item) => {
          expect(
            graphql.getNullValue(item[0])
          ).to.deep.equal(
            item[1]
          )
        })
      })
    })

    describe('constructMutation', () => {
      it('populates with basic argument inputs', () => {
        const mutation = {
          name: 'MyMutation',
          args: [
            {
              name: 'foo',
              type: {
                name: 'String',
                kind: 'SCALAR',
                ofType: null
              }
            },
            {
              name: 'bar',
              type: {
                name: 'Int',
                kind: 'SCALAR',
                ofType: null
              }
            }
          ]
        }
        expect(graphql.constructMutation(mutation)).to.equal(dedent`
          mutation MyMutation($foo: String, $bar: Int) {
            MyMutation(foo: $foo, bar: $bar) {
              result
            }
          }
        `.trim())
      })

      it('handles nested types', () => {
        const mutation = {
          name: 'MyMutation',
          args: [
            {
              name: 'myArg',
              type: {
                name: null,
                kind: 'NON_NULL',
                ofType: {
                  name: null,
                  kind: 'LIST',
                  ofType: {
                    name: 'String',
                    kind: 'SCALAR',
                    ofType: null
                  }
                }
              }
            }
          ]
        }
        expect(graphql.constructMutation(mutation)).to.equal(dedent`
          mutation MyMutation($myArg: [String]!) {
            MyMutation(myArg: $myArg) {
              result
            }
          }
        `.trim())
      })
    })

    describe('ApolloClient', () => {
      it('should create an apollo client', () => {
        const apolloClient = graphql.createApolloClient('http://localhost:12345', null)
        expect(apolloClient.link !== null).to.equal(true)
        expect(apolloClient.cache !== null).to.equal(true)
      })
    })

    describe('SubscriptionClient', () => {
      beforeEach(() => {
        store.state.offline = false
      })
      it('should create a subscription client', () => {
        const subscriptionClient = graphql.createSubscriptionClient('ws://localhost:12345', {
          reconnect: false,
          lazy: true
        },
        {})
        expect(typeof subscriptionClient.request).to.equal('function')
      })
      it('should call the subscription client callbacks', () => {
        const subscriptionClient = graphql.createSubscriptionClient('ws://localhost:12345', {
          reconnect: false,
          lazy: true
        },
        {})
        expect(store.state.offline).to.equal(false)

        let eventName, offline
        for ({ eventName, offline } of [
          {
            eventName: 'connecting',
            offline: true
          },
          {
            eventName: 'connected',
            offline: false
          },
          {
            eventName: 'reconnecting',
            offline: true
          },
          {
            eventName: 'reconnected',
            offline: false
          },
          {
            eventName: 'disconnected',
            offline: true
          }
        ]) {
          subscriptionClient.eventEmitter.emit(eventName)
          expect(store.state.offline).to.equal(offline)
        }
      })
    })

    describe('GraphQL URLs', () => {
      it('should create the correct URLs', () => {
        const graphQLUrls = graphql.createGraphQLUrls()
        expect(graphQLUrls.httpUrl.slice(0, 4)).to.equal('http')
        expect(graphQLUrls.wsUrl.slice(0, 2)).to.equal('ws')
      })
    })
  })
})
