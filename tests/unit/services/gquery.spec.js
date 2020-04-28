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

import { expect } from 'chai'
// need the polyfill as otherwise ApolloClient fails to be imported as it checks for a global fetch object on import...
import 'cross-fetch/polyfill'
import { GQuery } from '@/services/gquery'
import { parse } from 'graphql/language/parser'

describe('GQuery', () => {
  describe('constructor', () => {
    it('should create an object correctly', () => {
      const gquery = new GQuery()
      expect(gquery.apolloClient).to.not.equal(null)
      expect(gquery.query).to.equal(null)
    })
  })
  describe('merge', () => {
    it('should merge two queries correctly', () => {
      const gquery = new GQuery()
      const query1 = `
        query {
          workflows {
            id
          }
        }
      `
      const view1 = {
      }
      gquery.subscribe(view1, query1)
      // at this point we have only 1 query, so the computed query must have the exact value we provided
      const expectedQuery1 = JSON.stringify(parse(query1))
      expect(expectedQuery1).to.equal(JSON.stringify(gquery.query))

      const query2 = `
        query {
          workflows {
            name
          }
        }
      `
      const view2 = {
      }
      gquery.subscribe(view2, query2)
      // now the queries must have been merged
      expect(JSON.stringify(gquery.query)).to.contain('name')
    })
  })
  describe('recompute', () => {
    it('should not change query if no views were added', () => {
      const gquery = new GQuery()
      gquery.recompute()
      expect(gquery.query).to.equal(null)
    })
  })
})
