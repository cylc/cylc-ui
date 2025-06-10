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

import mergeQueries, { removeAstLoc } from '@/graphql/merge'
import { print } from 'graphql'
import gql from 'graphql-tag'

describe('mergeQueries', () => {
  const assertQueriesAreEqual = (queryA, queryB) => {
    // we are converting to string because sometimes GraphQL.js creates
    // arrays with undefined items (i.e. [undefined]) which is hard to
    // reproduce.
    expect(print(removeAstLoc(queryA))).to.equal(print(removeAstLoc(queryB)))
  }
  describe('Validation', () => {
    it('should throw an error if no query provided', () => {
      expect(() => { mergeQueries(null, null) }).to.throw()
      expect(() => { mergeQueries(null, {}) }).to.throw()
      expect(() => { mergeQueries({}, null) }).to.throw()
      expect(() => { mergeQueries(undefined, undefined) }).to.throw()
      expect(() => { mergeQueries(undefined, {}) }).to.throw()
      expect(() => { mergeQueries({}, undefined) }).to.throw()
    })
    it('should throw an error if the kind is not correct', () => {
      const queryA = gql`query { id }`
      const queryB = gql`query { id }`
      const selectionSetA = queryA.definitions[0].selectionSet
      expect(() => { mergeQueries(selectionSetA, queryB) }).to.throw()
    })
    it('should throw an error if the operations are different (subscription and query for example)', () => {
      const queryA = gql`query { id }`
      const subscriptionB = gql`subscription { id }`
      expect(() => mergeQueries(queryA, subscriptionB)).to.throw()
    })
    it('should throw an error if more than a single definition', () => {
      const documentA = gql`query A { id } subscription B { id }`
      const documentB = gql`query { id }`
      expect(() => { mergeQueries(documentA, documentB) }).to.throw()
      expect(() => { mergeQueries(documentB, documentA) }).to.throw()
    })
    it('should throw an error if the selection sets do not match', () => {
      const queryA = gql`{
        deltas {
          jobs
        }
      }`
      const queryB = gql`{
        deltas {
          jobs {
            id
          }
        }
      }`
      expect(() => mergeQueries(queryA, queryB)).to.throw()
    })
    it('should throw an error if an inline fragment is used', () => {
      // TODO: if we ever support it, just uncomment this case, then look at the
      //       InlineFragmentNode AST node, and handle that in the merge module.
      const queryA = gql`query {
        ... on Jobs {
          name
        }
      }`
      const queryB = gql`query {
        id
      }`
      expect(() => mergeQueries(queryA, queryB)).to.throw()
      expect(() => mergeQueries(queryB, queryA)).to.throw()
    })
    it('should throw an error if the types of the fields do not match', () => {
      // Cannot merge Field Jobs with FragmentSpread Jobs
      const queryA = gql`query {
        Jobs {
          id
        }
      }`
      const queryB = gql`query {
        ...Jobs
      }`
      expect(() => mergeQueries(queryA, queryB)).to.throw()
    })
    it('should throw an error if the variables are different', () => {
      const queryA = gql`query ($id: ID) { id }`
      const queryB = gql`query ($name: Name) { id }`
      expect(() => mergeQueries(queryA, queryB)).to.throw()
    })
    it('should throw an error if a directive is found (not supported/used right now', () => {
      const queryA = gql`query { id }`
      const queryB = gql`query { id @skip(if: true) }`
      expect(() => mergeQueries(queryA, queryB)).to.throw()
    })
  })
  describe('Merge definitions', () => {
    it('should merge two queries', () => {
      const queryA = gql`query A {
        id
        name
        car {
          brand
        }
      }`
      const queryB = gql`query B {
        id
        age
        insurance {
          id
        }
        car {
          brand
          model
        }
      }`
      const merged = mergeQueries(queryA, queryB)
      const expected = gql`query A {
        id
        name
        car {
          brand
          model
        }
        age
        insurance {
          id
        }
      }`
      assertQueriesAreEqual(merged, expected)
    })
    describe('Arguments', () => {
      describe('Validation', () => {
        it('should throw an error if the kind of argument is different', () => {
          const queryA = gql`query {
            jobs (sort: true) { id }
          }`
          const queryB = gql`query {
            jobs (sort: ["a"]) { id }
          }`
          expect(() => mergeQueries(queryA, queryB)).to.throw()
        })
        it('should throw an error if using different variables', () => {
          const queryA = gql`query {
            jobs (sort: $sortA) { id }
          }`
          const queryB = gql`query {
            jobs (sort: $sortB) { id }
          }`
          expect(() => mergeQueries(queryA, queryB)).to.throw()
        })
        it('should throw an error if using different values for boolean, string, int, and float', () => {
          const tests = [
            {
              a: true,
              b: false,
            },
            {
              a: 'test',
              b: 'production',
            },
            {
              a: 1,
              b: 10,
            },
            {
              a: 1.0,
              b: 10.0,
            },
          ]
          for (const test of tests) {
            const queryA = gql`query {
              jobs (sort: ${test.a}) { id }
            }`
            const queryB = gql`query {
              jobs (sort: ${test.b}) { id }
            }`
            expect(() => mergeQueries(queryA, queryB)).to.throw()
          }
        })
        it('should throw an error if using different objects', () => {
          const queryA = gql`query {
            jobs (sort: { keys: ["a"] }) {
              id
            }
          }`
          const queryB = gql`query {
            jobs (sort: { array: ["a"] }) {
              id
            }
          }`
          expect(() => mergeQueries(queryA, queryB)).to.throw()
        })
      })
      describe('Values', () => {
        it('should merge arguments', () => {
          const queryA = gql`query A {
            jobs (sort: true, name: "a", keys: ["a", "b"], expired: 100, flag: $flag, test: null) { id }
          }`
          const queryB = gql`query B {
            jobs (keys: ["c"], age: 10, expired: 100, flag: $flag, test: null) { name }
          }`
          const merged = mergeQueries(queryA, queryB)
          const expected = gql`query A {
            jobs (sort: true, name: "a", keys: ["a", "b", "c"], expired: 100, flag: $flag, test: null, age: 10) { id name }
          }`
          assertQueriesAreEqual(merged, expected)
        })
        it('should merge arguments with objects', () => {
          // Objects tests are a bit longer, so breaking into two basic tests
          const queryA = gql`query A {
            jobs (user: { id: 1, name: "cylc" }) {
              id
            }
          }`
          const queryB = gql`query B {
            jobs (user: { id: 1, name: "cylc" }) {
              name
            }
          }`
          const merged = mergeQueries(queryA, queryB)
          const expected = gql`query A {
            jobs (user: { id: 1, name: "cylc" }) {
              id
              name
            }
          }`
          assertQueriesAreEqual(merged, expected)
        })
        it('should merge arguments with lists', () => {
          const queryA = gql`query A {
            jobs (workflows: ["root", "test"]) {
              id
            }
          }`
          const queryB = gql`query B {
            jobs (workflows: ["root", "airplane"]) {
              name
            }
          }`
          const merged = mergeQueries(queryA, queryB)
          const expected = gql`query A {
            jobs (workflows: ["root", "test", "airplane"]) {
              id
              name
            }
          }`
          assertQueriesAreEqual(merged, expected)
        })
      })
    })
  })
  describe('Merge fragments', () => {
    it('should merge two fragments', () => {
      const queryA = gql`query A {
        ...Jobs
      }

      fragment Jobs on Job {
        id
        name
      }
      `
      const queryB = gql`query B {
        ...Jobs
        ...Tasks
      }

      fragment Jobs on Job {
        name
        status
      }

      fragment Tasks on Task {
        id
        name
        status
      }
      `

      const merged = mergeQueries(queryA, queryB)
      const expected = gql`query A {
        ...Jobs
        ...Tasks
      }

      fragment Jobs on Job {
        id
        name
        status
      }

      fragment Tasks on Task {
        id
        name
        status
      }`
      assertQueriesAreEqual(merged, expected)
    })
  })
})
