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

import TaskState from '@/model/TaskState.model'

describe('Tree component', () => {
  it('Should display cycle points for the mocked workflow', () => {
    cy.visit('/#/workflows/one')
    cy
      .get('.node-data-cyclepoint', { timeout: 10000 })
      .should(($div) => {
        // by default, in our expected viewport size for tests, both cycle points exist and are visible
        expect($div.get(0)).to.contain('20000102T0000Z')
      })
    cy
      .get('.node-data-cyclepoint')
      .should('be.visible')
  })
  it('Should hide jobs by default', () => {
    cy.visit('/#/workflows/one')
    cy
      .get('.node-data-cyclepoint')
      .should('be.visible')
    cy
      .get('.node-data-job')
      .should('not.be.visible')
  })
  it('Should make jobs visible when clicking on tasks', () => {
    cy.visit('/#/workflows/one')
    cy
      .get('.node-data-job:first')
      .should('not.be.visible')
    // expand the first task proxy we have
    cy
      .get('.node-data-task-proxy:first')
      .prev()
      .click()
    // now, consequentially, the first job that we have should also be visible
    cy
      .get('.node-data-job:first')
      .should('be.visible')
  })
  it('Should display leaf node triangle with margin', () => {
    // this is testing that there is a margin, not necessarily that the leaf node's triangle is exactly under the node
    cy.visit('/#/workflows/one')
    cy
      .get('.node-data-task-proxy:first')
      .prev()
      .click()
    // no jobs, and no leaves are visible initially
    cy
      .get('.leaf:first')
      .should('not.be.visible')
    // but clicking on a visible job should display its leaf node
    cy
      .get('.node-data-job:first')
      .prev()
      .click()
    cy
      .get('.leaf:first')
      .should('be.visible')
    // and, important, the leaf node has a triangle, as a helper to quickly point the user to its parent
    // job in the tree - i.e. the leaf has a left margin... as the leaves are not root nodes, we
    // **always** have a margin > 0, unless a bug broke it (which happened before due to a wrong variable name).
    cy
      .get('.leaf:first > .arrow-up')
      .should(($div) => {
        const marginLeft = $div.get(0).style.marginLeft
        if (
          marginLeft === undefined ||
          marginLeft === '' ||
          marginLeft === '0' ||
          marginLeft === '0px'
        ) {
          throw new Error(`Invalid leaf node margin-left: "${marginLeft}"`)
        }
      })
  })
  it('Should update view correctly', () => {
    cy.visit('/#/tree/one')
    cy
      .get('.node-data-cyclepoint')
      .should('be.visible')
    cy
      .get('.node-data-job:first')
      .should('not.be.visible')
    cy
      .visit('/#/tree/anynamewillstillopenone')
      .then(() => {
        cy
          .get('.node-data-job:first')
          .should('not.be.visible')
        cy
          .get('.node-data-cyclepoint')
          .should('be.visible')
        cy.window().its('app.$workflowService.subscriptions').then(subscriptions => {
          // FIXME: likely wrong, but to be fixed later in a follow-up PR to housekeep subscriptions
          expect(subscriptions.length).to.equal(3)
        })
      })
  })
  it('Should remove subscriptions correctly when leaving the view', () => {
    cy.visit('/#/tree/one')
    cy
      .get('.node-data-cyclepoint')
      .should('be.visible')
    cy
      .get('.node-data-job:first')
      .should('not.be.visible')
    cy.window().its('app.$workflowService.subscriptions').then(subscriptions => {
      expect(subscriptions.length).to.equal(2)
    })
    cy
      .visit('/')
      .then(() => {
        cy.window().its('app.$workflowService.subscriptions').then(subscriptions => {
          // It will have 2, GScan + Dashboard, while the /tree/one view has 1 Delta + 1 subscription
          // (the delta is a different subscription).
          expect(subscriptions.length).to.equal(2)
        })
      })
  })
  describe('filters', () => {
    it('Should not filter by default', () => {
      cy.visit('/#/tree/one')
      cy
        .get('.node-data-task-proxy')
        .contains('sleepy')
        .should('be.visible')
      cy
        .get('.node-data-task-proxy')
        .contains('succeeded')
        .should('be.visible')
    })
    it('Should filter by task name', () => {
      cy.visit('/#/tree/one')
      cy
        .get('.node-data-task-proxy')
        .contains('sleepy')
        .should('be.visible')
      cy
        .get('.node-data-task-proxy')
        .contains('succeeded')
        .should('be.visible')
      // eep should filter sleepy
      cy
        .get('#c-tree-filter-task-name')
        .type('eep')
      cy
        .get('#c-tree-filter-btn')
        .click()
      cy
        .get('.node-data-task-proxy')
        .contains('sleepy')
        .should('be.visible')
      cy
        .get('.node-data-task-proxy')
        .contains('succeeded')
        .should('not.be.visible')
    })
    it('Should filter by task states', () => {
      cy.visit('/#/tree/one')
      cy
        .get('.node-data-task-proxy')
        .contains('sleepy')
        .should('be.visible')
      cy
        .get('#c-tree-filter-task-states')
        .click({ force: true })
      // click on succeeded and waiting
      cy
        .get('.v-list-item')
        .contains('submitted')
        .click({ force: true })
      cy
        .get('#c-tree-filter-btn')
        .click()
      cy
        .get('.node-data-task-proxy')
        .contains('sleepy')
        .should('be.not.visible')
      cy
        .get('.node-data-task-proxy')
        .contains('failed')
        .should('be.visible')
    })
    it('Should filter by task name and states', () => {
      cy.visit('/#/tree/one')
      cy
        .get('.node-data-task-proxy')
        .contains('sleepy')
        .should('be.visible')
      // eep should filter sleepy
      cy
        .get('#c-tree-filter-task-name')
        .type('fail')
      cy
        .get('#c-tree-filter-task-states')
        .click({ force: true })
      // click on waiting, the other sleepy is succeeded, but we don't want to see it
      cy
        .get('.v-list-item')
        .contains('submitted')
        .click({ force: true })
      cy
        .get('#c-tree-filter-btn')
        .click()
      cy
        .get('.node-data-task-proxy:visible')
        .should('have.length', 1)
    })

    it('should show a summary of tasks if the number of selected items is greater than the maximum limit', () => {
      cy.visit('/#/tree/one')
      cy
        .get('#c-tree-filter-task-states')
        .click({ force: true })
      // eslint-disable-next-line no-lone-blocks
      TaskState.enumValues.forEach(state => {
        cy
          .get('.v-list-item')
          .contains(state.name)
          .click({ force: true })
      })
      cy
        .get('.v-select__slot')
        .should($select => {
          expect($select).to.contain('(+')
        })
    })
  })
})
