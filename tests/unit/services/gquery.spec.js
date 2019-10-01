import { expect } from 'chai'
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
