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

// Tests for the WorkflowService subscriptions. Not necessarily GraphQL subscriptions!

/**
 * Helper function to retrieve the subscriptions.
 * @returns {Cypress.Chainable<any>}
 */
const getSubscriptions = () => cy.window().its('app.$workflowService.subscriptions')

/**
 * Helper function to retrieve the query.
 * @returns {Cypress.Chainable<any>}
 */
const getQuery = () => cy.window().its('app.$workflowService.query')

/**
 * Get the first selection.
 * @param {Object} query - GraphQL query response object
 * @returns {*}
 */
const getFirstSelection = (query) => query.definitions[0].selectionSet.selections[0]

/**
 * Get the alias or name (in this order) of the elements in the first level selection set. For the workflow selection,
 * it should bring every entry under the workflow in the GraphQL query. For example, it could bring name, port, owner,
 * taskProxies, familyProxies, etc (as strings).
 * @param {Object} selection
 * @returns {[String]}
 */
const getSelectionSetNames = (selection) => selection.selectionSet.selections.map((selection) => selection.alias ? selection.alias.value : selection.name.value)

describe('WorkflowService subscriptions', () => {
  it('-> Dashboard, should contain 2 subscriptions (GScan, Dashboard)', () => {
    cy.visit('/#/')
    getSubscriptions().then(subscriptions => {
      expect(subscriptions.length).to.equal(2)
      getQuery().then(query => {
        const firstSelection = getFirstSelection(query)
        expect(firstSelection.name.value).to.equal('workflows')
        // the GScan and Dashboard queries do not use cyclePoints, while the Tree query does
        // so test to confirm cyclePoints is not present
        expect(getSelectionSetNames(firstSelection)).to.not.include('cyclePoints')
      })
    })
  })
  it('-> Dashboard -> Workflows, should contain 2 subscriptions (GScan, Tree)', () => {
    cy.visit('/#/')
    cy.get('[href="#/workflows/one"]').click()
    cy.wait(500)
    getSubscriptions().then(subscriptions => {
      expect(subscriptions.length).to.equal(2)
      getQuery().then(query => {
        const firstSelection = getFirstSelection(query)
        expect(firstSelection.name.value).to.equal('workflows')
        // the Tree query uses cycle points, so it must be present
        expect(getSelectionSetNames(firstSelection)).to.include('cyclePoints')
      })
    })
  })
  it('-> Dashboard -> Workflows -> Dashboard, should contain 2 subscriptions (GScan, Dashboard)', () => {
    cy.visit('/#/')
    cy.get('[href="#/workflows/one"]').click()
    cy.wait(500)
    cy.get('[href="#/"]').click()
    cy.wait(500)
    getSubscriptions().then(subscriptions => {
      expect(subscriptions.length).to.equal(2)
      getQuery().then(query => {
        const firstSelection = getFirstSelection(query)
        expect(firstSelection.name.value).to.equal('workflows')
        // the GScan and Dashboard queries do not use cyclePoints, while the Tree query does
        // so test to confirm cyclePoints is not present
        expect(getSelectionSetNames(firstSelection)).to.not.include('cyclePoints')
      })
    })
  })
  it('-> Tree, should contain 2 subscriptions (GScan, Tree)', () => {
    cy.visit('/#/tree/one')
    getSubscriptions().then(subscriptions => {
      expect(subscriptions.length).to.equal(2)
      getQuery().then(query => {
        const firstSelection = getFirstSelection(query)
        expect(firstSelection.name.value).to.equal('workflows')
        // the Tree query uses cycle points, so it must be present
        expect(getSelectionSetNames(firstSelection)).to.include('cyclePoints')
      })
    })
  })
  it('-> Tree - > Dashboard, should contain 2 subscriptions (GScan, Tree)', () => {
    cy.visit('/#/tree/one')
    cy.get('[href="#/"]').click()
    cy.wait(500)
    getSubscriptions().then(subscriptions => {
      expect(subscriptions.length).to.equal(2)
      getQuery().then(query => {
        const firstSelection = getFirstSelection(query)
        expect(firstSelection.name.value).to.equal('workflows')
        // the GScan and Dashboard queries do not use cyclePoints, while the Tree query does
        // so test to confirm cyclePoints is not present
        expect(getSelectionSetNames(firstSelection)).to.not.include('cyclePoints')
      })
    })
  })
})
