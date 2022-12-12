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

import { Deferred } from '../../util'

// Tests for the WorkflowService subscriptions. Not necessarily GraphQL subscriptions!

/**
 * Helper function to retrieve the subscriptions.
 * @returns {Cypress.Chainable<any>}
 */
const getSubscriptions = () => cy.window().its('app.$workflowService.subscriptions')

describe('WorkflowService subscriptions', () => {
  it('-> Dashboard, should contain 1 subscriptions ("root" = GScan + Dashboard)', () => {
    cy.visit('/#/')
    cy.get('.c-header').should('exist')
    getSubscriptions().then(subscriptions => {
      expect(Object.keys(subscriptions).length).to.equal(1)
    })
  })

  it('-> Dashboard -> User Profile, should contain 1 subscription (GScan)', () => {
    cy.visit('/#/')
    cy.get('[href="#/user-profile"]').click({ force: true })
    cy.contains('h3', 'Your Profile')
    getSubscriptions().then(subscriptions => {
      // Only GScan subscription "root"
      expect(Object.keys(subscriptions).length).to.equal(1)
    })
  })

  it('-> Dashboard -> Workflows, should contain 2 subscriptions (GScan + Tree)', () => {
    cy.visit('/#/')
    cy.get('[href="#/workflows/one"]').click({ force: true })
    // <div id='main'> is used by Lumino, and its initial tab contains the text tree
    cy.get('div#main').find('.c-tree')
    getSubscriptions().then(subscriptions => {
      // GScan subscription "root" and the subscription "workflow" used by the Tree view
      expect(Object.keys(subscriptions).length).to.equal(2)
      expect(subscriptions.root.observable.closed).to.equal(false)
      expect(subscriptions.workflow.observable.closed).to.equal(false)
    })
  })

  it('-> Dashboard -> Workflows -> Dashboard, should contain 2 subscriptions (GScan + Dashboard)', () => {
    cy.visit('/#/')
    cy.get('[href="#/workflows/one"]').click()
    // <div id='main'> is used by Lumino, and its initial tab contains the text tree
    cy.get('div#main').find('.c-tree')
    cy.get('[href="#/"]').click({ force: true })
    cy.get('div.c-dashboard')
    getSubscriptions().then(subscriptions => {
      expect(Object.keys(subscriptions).length).to.equal(1)
    })
  })

  it('-> Tree, should contain 2 subscriptions (GScan + Tree)', () => {
    cy.visit('/#/tree/one')
    cy.get('.c-header').should('exist')
    getSubscriptions().then(subscriptions => {
      // GScan subscription "root" and the subscription "workflow" used by the Tree view
      expect(Object.keys(subscriptions).length).to.equal(2)
      expect(subscriptions.root.observable.closed).to.equal(false)
      expect(subscriptions.workflow.observable.closed).to.equal(false)
    })
  })

  it('-> Tree - > Dashboard, should contain 1 subscription ("root" = GScan + Dashboard)', () => {
    cy.visit('/#/tree/one')
    cy
      .get('.v-list-item')
      .contains('Dashboard')
      .click({ force: true })
    cy.get('div.c-dashboard')
    getSubscriptions().then(subscriptions => {
      expect(Object.keys(subscriptions).length).to.equal(1)
    })
  })
})

describe('WorkflowService mutations', () => {
  it('handles asynchronously loaded mutations properly', () => {
    const deferred = new Deferred()
    cy.intercept('/graphql', req => {
      if (req.body.query?.startsWith('mutation')) {
        // equivalent to `.as('mutation')`:
        req.alias = 'mutation'
      } else if (req.body.query?.includes('__schema')) {
        // Cypress will await promise before continuing with the request
        return deferred.promise
      }
    })
    cy.visit('/#/workflows/one')
    // Before mutations have loaded
    cy
      // Play/stop buttons in toolbar should wait for mutations before sending the mutation
      .get('#workflow-stop-button')
      .click()
      // Mutations menu should show skeleton loader
      .get('#workflow-mutate-button.c-interactive')
      .click()
      .get('.c-mutation-menu')
      .find('.v-skeleton-loader:first')
      .should('be.visible')
      .get('.c-mutation-menu-list')
      .should('not.exist')
      // Now load mutations
      .then(() => {
        cy.log('Now load the mutations')
        deferred.resolve()
      })
    // After mutations have loaded
    cy
      // Skeleton loader should be gone, list of mutations now shown
      .get('.c-mutation-menu')
      .find('.v-skeleton-loader')
      .should('not.exist')
      .get('.c-mutation-menu-list')
      .should('be.visible')
      // Earlier click of stop button should come through
      .wait('@mutation').then(({ request }) => {
        expect(request.body.operationName).to.equal('stop')
      })
  })
})
