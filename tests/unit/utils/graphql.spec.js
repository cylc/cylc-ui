import dedent from 'dedent'
import { expect } from 'chai'
// need the polyfill as otherwise ApolloClient fails to be imported as it checks for a global fetch object on import...
import 'cross-fetch/polyfill'
import { createApolloClient, getNullValue, iterateType, argumentSignature, constructMutation } from '@/utils/graphql'

describe('utils', () => {
  describe('graphql', () => {
    describe('createApolloClient', () => {
      it('should create an apollo client', () => {
        const uri = 'http://localhost:12345'
        const apolloClient = createApolloClient(uri)
        expect(apolloClient.link !== null).to.equal(true)
      })
    })

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
        for (const node of iterateType(nodes[0])) {
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
            argumentSignature({
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
            getNullValue(item[0])
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
        expect(constructMutation(mutation)).to.equal(dedent`
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
        expect(constructMutation(mutation)).to.equal(dedent`
          mutation MyMutation($myArg: [String]!) {
            MyMutation(myArg: $myArg) {
              result
            }
          }
        `.trim())
      })
    })
  })
})
