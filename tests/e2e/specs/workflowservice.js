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
 * Helper function to retrieve the subscriptions
 * @returns {[]} - array of subscriptions
 */
const getSubscriptions = () => cy.window().its('app.$workflowService.subscriptions')

describe('WorkflowService subscriptions', () => {
  it('-> Dashboard, should contain 2 subscriptions (GScan, Dashboard)', () => {
    cy.visit('/#/')
    getSubscriptions().then(subscriptions => {
      expect(subscriptions.length).to.equal(2)
    })
  })
  it('-> Dashboard -> Workflows, should contain 2 subscriptions (GScan, Tree)', () => {
    cy.visit('/#/')
    getSubscriptions().then(subscriptions => {
      expect(subscriptions.length).to.equal(2)
    })
  })
  it('-> Dashboard -> Workflows -> Dashboard, should contain 2 subscriptions (GScan, Dashboard)', () => {
    cy.visit('/#/')
    getSubscriptions().then(subscriptions => {
      expect(subscriptions.length).to.equal(2)
    })
  })
})
