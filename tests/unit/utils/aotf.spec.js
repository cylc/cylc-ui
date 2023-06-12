/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as aotf from '@/utils/aotf'
import dedent from 'dedent'
// need the polyfill as otherwise ApolloClient fails to be imported as it checks for a global fetch object on import...
import 'cross-fetch/polyfill'

describe('aotf (Api On The Fly)', () => {
  describe('tokenise', () => {
    it('should convert an id into tokens', () => {
      const tokens = {}
      expect(aotf.tokenise(null)).to.deep.equal(tokens)
      tokens[aotf.cylcObjects.User] = 'a'
      expect(aotf.tokenise('~a')).to.deep.equal(tokens)
      tokens[aotf.cylcObjects.Workflow] = 'b'
      expect(aotf.tokenise('~a/b')).to.deep.equal(tokens)
      tokens[aotf.cylcObjects.CyclePoint] = 'c'
      expect(aotf.tokenise('~a/b//c')).to.deep.equal(tokens)
      tokens[aotf.cylcObjects.Namespace] = 'd'
      expect(aotf.tokenise('~a/b//c/d')).to.deep.equal(tokens)
      tokens[aotf.cylcObjects.Job] = 'e'
      expect(aotf.tokenise('~a/b//c/d/e')).to.deep.equal(tokens)
    })
  })

  describe('getType', () => {
    it('should extract the type from tokens', () => {
      const tokens = {}
      expect(aotf.getType(tokens)).to.deep.equal(null)
      tokens[aotf.cylcObjects.User] = 'a'
      expect(aotf.getType(tokens)).to.deep.equal(aotf.cylcObjects.User)
      tokens[aotf.cylcObjects.Workflow] = 'b'
      expect(aotf.getType(tokens)).to.deep.equal(aotf.cylcObjects.Workflow)
      tokens[aotf.cylcObjects.CyclePoint] = 'c'
      expect(aotf.getType(tokens)).to.deep.equal(aotf.cylcObjects.CyclePoint)
    })
  })

  describe('camelToWords', () => {
    it('should convert camel case to plain text', () => {
      expect(aotf.camelToWords(null)).to.equal('')
      expect(aotf.camelToWords('aBC')).to.equal('A B C')
    })
  })

  describe('getStates', () => {
    it('gets valid states', () => {
      expect(aotf.getStates('Valid for: running, stopped workflows.')).to.deep.equal(['running', 'stopped'])
    })
  })

  describe('processMutations', () => {
    it('should add computed fields', () => {
      const input = {
        name: 'fooBar',
        description: 'Short description.\n\nLong\ndescription.\nValid for: stopped, paused workflows.',
        args: []
      }
      const output = {
        ...input,
        _title: 'Foo Bar',
        _icon: aotf.mutationIcons[''],
        _shortDescription: 'Short description.',
        _help: 'Long\ndescription.\nValid for: stopped, paused workflows.',
        _validStates: ['stopped', 'paused']
      }
      aotf.processMutations([input], null)
      expect(input).to.deep.equal(output)
    })
  })

  describe('processArguments', () => {
    it('should add computed fields', () => {
      const input = {
        args: [
          {
            name: 'fooBar',
            kind: 'Whatever',
            ofType: 'Whatever',
            defaultValue: '42'
          }
        ]
      }
      const output = {
        args: [
          {
            ...input.args[0],
            _title: 'Foo Bar',
            _cylcObject: null,
            _cylcType: null,
            _multiple: false,
            _required: false,
            _default: 42
          }
        ]
      }
      aotf.processArguments(input, [])
      expect(input).to.deep.equal(output)
    })

    it('should identify Cylc types', () => {
      const input = {
        args: [
          {
            name: 'fooBar',
            defaultValue: '["a"]',
            type: {
              name: '',
              kind: 'NON_NULL',
              ofType: {
                name: '',
                kind: 'LIST',
                ofType: {
                  name: 'WorkflowID',
                  type: {
                    name: 'SCALAR',
                    ofType: null
                  }
                }
              }
            }
          }
        ]
      }
      const output = {
        args: [
          {
            ...input.args[0],
            _title: 'Foo Bar',
            _cylcObject: aotf.cylcObjects.Workflow,
            _cylcType: 'WorkflowID',
            _multiple: true, // because of the LIST
            _required: true, // because of the NON_NULL
            _default: ['a']
          }
        ]
      }
      aotf.processArguments(input, [])
      expect(input).to.deep.equal(output)
    })
  })

  describe('filterAssociations', () => {
    it('should filter by Cylc object', () => {
      const mutations = [
        {
          // mutation that operates on workflows and users
          name: 'foo',
          args: [
            {
              name: 'arg1',
              _cylcObject: aotf.cylcObjects.Workflow,
              _required: true
            },
            {
              name: 'arg2',
              _cylcObject: aotf.cylcObjects.User,
              _required: false
            }
          ]
        },
        {
          // mutation that operates on users
          name: 'bar',
          args: [
            {
              name: 'arg1',
              _cylcObject: aotf.cylcObjects.User,
              _required: false
            }
          ]
        },
        {
          // mutation that operates on workflows but requires additional info
          name: 'baz',
          args: [
            {
              name: 'arg1',
              _cylcObject: aotf.cylcObjects.Workflow,
              _required: true
            },
            {
              name: 'arg2',
              _cylcObject: null,
              _required: true
            }
          ]
        }
      ]
      const tokens = aotf.tokenise('~a/b//c/d')
      const permissions = []

      // filter by an object no mutations operate on
      expect(
        aotf.filterAssociations(
          // filter by the "namespace" object
          aotf.cylcObjects.Namespace,
          tokens,
          mutations,
          permissions
        )
      // no results
      ).to.deep.equal([])

      // filter by workflow
      const all = aotf.filterAssociations(
        // filter by the "workflow" object
        aotf.cylcObjects.Workflow,
        tokens,
        mutations,
        permissions
      )
      expect(
        all.map((item) => [item.mutation.name, item.requiresInfo]).sort()
      ).to.deep.equal([
        ['baz', true],
        ['foo', false]
      ])
    })

    it('should determine when additional info is required', () => {
      // some test mutations
      const mutations = [
        {
          // second argument is optional -> no info required
          name: 'argon',
          args: [
            {
              name: 'arg1',
              _cylcObject: aotf.cylcObjects.Workflow,
              _required: true
            },
            {
              name: 'arg2',
              _cylcObject: null,
              _required: false
            }
          ]
        },
        {
          // second argument is required -> info is required
          name: 'boron',
          args: [
            {
              name: 'arg1',
              _cylcObject: aotf.cylcObjects.Workflow,
              _required: true
            },
            {
              name: 'arg2',
              _cylcObject: null,
              _required: true
            }
          ]
        },
        {
          // second argument is required -> info is required unless
          // a cycle point is present in the context
          name: 'carbon',
          args: [
            {
              name: 'arg1',
              _cylcObject: aotf.cylcObjects.Workflow,
              _required: true
            },
            {
              name: 'arg2',
              _cylcObject: aotf.cylcObjects.CyclePoint,
              _required: true
            }
          ]
        }
      ]
      const permissions = []

      // filter mutations from the context of the workflow
      const out1 = aotf.filterAssociations(
        aotf.cylcObjects.Workflow,
        aotf.tokenise('~a/b'),
        mutations,
        permissions
      )
      expect(
        out1.map((item) => [item.mutation.name, item.requiresInfo]).sort()
      ).to.deep.equal([
        ['argon', false],
        ['boron', true],
        ['carbon', true] // no cycle point in the context -> info required
      ])

      // filter mutations from the context of a cycle point
      const out2 = aotf.filterAssociations(
        aotf.cylcObjects.Workflow,
        aotf.tokenise('~a/b//c'),
        mutations,
        permissions
      )
      expect(
        out2.map((item) => [item.mutation.name, item.requiresInfo]).sort()
      ).to.deep.equal([
        ['argon', false],
        ['boron', true],
        ['carbon', false] // cycle point in the context -> no info is required
      ])
    })

    it('should filter by permissions', () => {
      const args = [{
        name: 'arg1',
        _cylcObject: aotf.cylcObjects.Workflow,
        _required: true
      }]
      const mutations = [
        { name: 'argon', args },
        { name: 'boron', args },
        { name: 'carbon', args }
      ]
      const permissions = ['carbon', 'argon']

      expect(
        aotf.filterAssociations(
          aotf.cylcObjects.Workflow,
          aotf.tokenise('~a/b'),
          mutations,
          permissions
        ).map(x => [x.mutation.name, x.authorised]).sort()
      ).to.deep.equal([
        ['argon', true],
        ['boron', false],
        ['carbon', true]
      ])
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
      for (const node of aotf.iterateType(nodes[0])) {
        result.push(node)
      }

      expect(
        result
      ).to.deep.equal(
        nodes
      )
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
          [],
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
          [],
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
          [],
          []
        ],
        [ // LIST<LIST<String>> => [[]]
          {
            type: null,
            kind: 'LIST',
            ofType: {
              type: null,
              kind: 'LIST',
              ofType: {
                type: 'String',
                kind: 'SCALAR'
              }
            }
          },
          [],
          [[]]
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
          [],
          []
        ],
        [ // OBJECT { A } => { foo: null, bar: null }
          {
            kind: 'OBJECT',
            name: 'A'
          },
          [
            {
              name: 'A',
              kind: 'OBJECT',
              fields: [
                { name: 'foo', type: 'String' },
                { name: 'bar', type: 'String' }
              ]
            }
          ],
          { foo: null, bar: null }
        ]
      ].forEach(([type, types, expected]) => {
        expect(
          aotf.getNullValue(type, types)
        ).to.deep.equal(expected)
      })
    })
  })

  describe('argumentSignature', () => {
    it('should correctly render the signature', () => {
      [
        // [type, signature]
        [
          {
            kind: 'TEST_TYPE'
          },
          'TEST_TYPE'
        ],
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
          aotf.argumentSignature({
            name: 'myArgument',
            type
          })
        ).to.equal(signature)
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
      expect(aotf.constructMutation(mutation)).to.equal(dedent`
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
      expect(aotf.constructMutation(mutation)).to.equal(dedent`
        mutation MyMutation($myArg: [String]!) {
          MyMutation(myArg: $myArg) {
            result
          }
        }
      `.trim())
    })
  })

  describe('getMutationArgsFromTokens', () => {
    it('extracts info from tokens to populate the arguments', () => {
      const mutation = {
        name: 'foo',
        args: [
          {
            name: 'arg1',
            _cylcType: 'WorkflowID',
            _cylcObject: aotf.cylcObjects.Workflow,
            _multiple: true,
            _default: null
          },
          {
            name: 'arg2',
            _cylcType: null,
            _cylcObject: null,
            _multiple: false,
            _default: 42
          }
        ]
      }
      const tokens = aotf.tokenise('~a/b')
      expect(
        aotf.getMutationArgsFromTokens(mutation, tokens)
      ).to.deep.equal({
        arg1: ['~a/b'],
        arg2: 42
      })
    })
  })

  describe('extractFields', () => {
    // Example, simplified GraphQL introspection responses:
    let types
    let personType
    beforeEach(() => {
      types = [
        {
          name: 'Person',
          fields: [
            { name: 'age', type: { name: 'Integer' } },
            { name: 'height', type: { name: 'Integer' } },
            { name: 'width', type: { name: 'Integer' } },
            { name: 'criminalAllegations', type: { name: 'CriminalAllegations' } }
          ]
        },
        { name: 'Integer' },
        {
          name: 'CriminalAllegations',
          fields: [
            { name: 'date', type: { name: 'Date' } },
            { name: 'location', type: { name: 'Location' } }
          ]
        },
        { name: 'Date' },
        {
          name: 'Location',
          fields: [
            { name: 'coordinates', type: { name: 'Coordinates' } }
          ]
        },
        { name: 'Coordinates' }
      ]
      personType = types.find(({ name }) => name === 'Person')
    })

    it('extracts all fields when not specified', () => {
      expect(
        aotf.extractFields(personType, null, types)
      ).to.deep.equal([
        { name: 'age', fields: null },
        { name: 'height', fields: null },
        { name: 'width', fields: null },
        {
          name: 'criminalAllegations',
          fields: [
            { name: 'date', fields: null },
            {
              name: 'location',
              fields: [
                { name: 'coordinates', fields: null }
              ]
            }
          ]
        }
      ])
    })

    it('extracts only specified fields', () => {
      expect(
        aotf.extractFields(
          personType,
          [
            {
              name: 'criminalAllegations',
              fields: [
                { name: 'location' }
              ]
            }
          ],
          types
        )
      ).to.deep.equal([
        {
          name: 'criminalAllegations',
          fields: [
            {
              name: 'location',
              fields: [
                { name: 'coordinates', fields: null }
              ]
            }
          ]
        }
      ])
    })

    it('can extract multiple fields', () => {
      expect(
        aotf.extractFields(
          personType,
          [
            { name: 'width' },
            { name: 'height' }
          ],
          types
        )
      ).to.deep.equal([
        { name: 'width', fields: null },
        { name: 'height', fields: null }
      ])
    })
  })
})
