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

import { Deferred } from '$tests/util'

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
      expect(Object.keys(subscriptions)).to.deep.equal(['root'])
    })
  })

  it('-> Dashboard -> User Profile, should contain 1 subscription (GScan)', () => {
    cy.visit('/#/')
    cy.get('[href="#/user-profile"]').click({ force: true })
    cy.contains('h3', 'Your Profile')
    getSubscriptions().then(subscriptions => {
      expect(Object.keys(subscriptions)).to.deep.equal(['root'])
    })
  })

  it('-> Dashboard -> Workflows, should contain 2 subscriptions (GScan + Tree)', () => {
    cy.visit('/#/')
    cy.get('[href="#/workspace/one"]').click({ force: true })
    // <div id='main'> is used by Lumino, and its initial tab contains the text tree
    cy.get('.v-main').find('.c-tree')
    getSubscriptions().then(subscriptions => {
      // GScan subscription "root" and the subscription "workflow" used by the Tree view
      expect(Object.keys(subscriptions).sort()).to.deep.equal(['root', 'workflow'])
      expect(subscriptions.root.observable.closed).to.equal(false)
      expect(subscriptions.workflow.observable.closed).to.equal(false)
    })
  })

  it('-> Dashboard -> Workflows -> Dashboard, should contain 2 subscriptions (GScan + Dashboard)', () => {
    cy.visit('/#/')
    cy.get('[href="#/workspace/one"]').click()
    // <div id='main'> is used by Lumino, and its initial tab contains the text tree
    cy.get('.v-main').find('.c-tree')
    cy.get('[href="#/"]').click({ force: true })
    cy.get('div.c-dashboard')
    getSubscriptions().then(subscriptions => {
      expect(Object.keys(subscriptions)).to.deep.equal(['root'])
    })
  })

  it('-> Tree, should start a subscription', () => {
    cy.visit('/#/tree/one')
      .get('.c-tree') // wait for component to load
    getSubscriptions().then(subscriptions => {
      expect(Object.keys(subscriptions)).to.deep.equal(['workflow'])
      // the 'workflow' subscription should be started
      expect(subscriptions.workflow.observable.closed).to.equal(false)
      // the 'global' subscription should not be running
      expect(subscriptions.root).to.equal(undefined)
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
    cy.visit('/#/workspace/one')
    // Before mutations have loaded
    cy
      // Play/stop buttons in toolbar should wait for mutations before sending the mutation
      .get('#workflow-stop-button')
      .click()
      // Mutations menu should show skeleton loader
      .get('#workflow-mutate-button')
      .click()
      .get('.c-mutation-menu')
      .find('[data-cy=skeleton]').as('skeleton')
      .should('be.visible')
      .get('.c-mutation-menu-list')
      .should('not.exist')
      // Now load mutations
      .then(() => {
        cy.log('Now load the mutations')
        deferred.resolve()
      })
    // After mutations have loaded
    // eslint-disable-next-line
    cy.wait(200)
      // Skeleton loader should be gone, list of mutations now shown
      .get('@skeleton')
      .should('not.exist')
      .get('.c-mutation-menu-list')
      .should('be.visible')
      // Earlier click of stop button should come through
      .wait('@mutation').then(({ request }) => {
        expect(request.body.operationName).to.equal('stop')
      })
  })
})
