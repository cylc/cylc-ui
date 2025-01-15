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

describe('Tree view', () => {
  it('Should display cycle points for the mocked workflow', () => {
    cy.visit('/#/workspace/one')
    cy
      .get('.node-data-cycle')
      .should(($div) => {
        // by default, in our expected viewport size for tests, both cycle points exist and are visible
        expect($div.get(0)).to.contain('20000102T0000Z')
      })
    cy
      .get('.node-data-cycle')
      .should('be.visible')
  })
  it('Renders jobs when expanding tasks', () => {
    cy.visit('/#/tree/one')
      .get('.node-data-task:first')
    // Jobs should not be rendered to begin with
    cy.get('.node-data-job:first')
      .should('not.exist')
    // Expand the first task
    cy.get('[data-node-type=task]:first')
      .find('.node-expand-collapse-button')
      .click()
    // Now the first job should be visible
    cy.get('.node-data-job:first')
      .should('be.visible')
    // Expansion should be remembered if parents are collapsed & re-expanded
    cy.get('.node-data-cycle:first')
      .parents('.node')
      .find('.node-expand-collapse-button').as('cycleBtn')
      .click()
      .get('.node-data-job:first')
      .should('not.be.visible')
      .get('@cycleBtn')
      .click()
      .get('.node-data-job:first')
      .should('be.visible')
  })
  it('Displays job details when expanded', () => {
    // this is testing that there is a margin, not necessarily that the leaf node's triangle is exactly under the node
    cy.visit('/#/tree/one')
    cy.get('[data-node-name=eventually_succeeded]')
      .find('.node-expand-collapse-button')
      .click()
    // no jobs, and no leaves are visible initially
    cy.get('.leaf:first')
      .should('not.exist')
    // but clicking on a visible job should display its leaf node
    cy.get('.node-data-job:visible:first')
      .prev()
      .click()
    cy.get('.leaf:visible:first')
    const patterns = [
      /Platform\s*\w+/,
      /Job ID\s*\d+/,
      /Job runner\s*\w+/,
      /Submitted\s*\d{4}-\d{2}-\d{2}T.+/,
      /Started\s*\d{4}-\d{2}-\d{2}T.+/,
      /Finished\s*\d{4}-\d{2}-\d{2}T.+/,
      /Mean run time\s*\d{2}:\d{2}:\d{2}/,
      /Platform\s*\w+/,
      /foo\s*foo message/
    ]
    for (const pattern of patterns) {
      cy.get('.leaf:visible:first .leaf-entry')
        .contains(pattern)
    }
    // The leaf node has a triangle pointing to the job icon - check the margin
    // is applied (node is 5 levels deep):
    cy.get('.leaf:visible:first > .arrow-up')
      .should('have.css', 'margin-left', `${5 * 24}px`)
  })
  it('Updates view correctly', () => {
    cy.visit('/#/tree/one')
      .get('.node-data-cycle')
      .should('have.length', 1)
    cy.visit('/#/tree/anynamewillstillopenone')
      .get('.node-data')
      .should('have.length', 0)
    cy.window().its('app.$workflowService.subscriptions').then(subscriptions => {
      // 'workflow' subscription used by the Tree view
      expect(Object.keys(subscriptions).length).to.equal(1)
      expect(subscriptions.workflow.observable.closed).to.equal(false)
    })
  })
  it('Removes subscriptions correctly when leaving the view', () => {
    cy.visit('/#/tree/one')
      .get('.node-data-cycle')
      .should('be.visible')
      .get('.node-data-job:first')
      .should('not.exist')
      .window()
      .its('app.$workflowService.subscriptions').then(subscriptions => {
        // * the 'workflow' subscription is used by the Tree view
        expect(Object.keys(subscriptions).length).to.equal(1)
        expect(subscriptions.workflow.observable.closed).to.equal(false)
      })

    cy
      .visit('/#/')
      .get('.c-dashboard')
      .should('be.visible')
      .window()
      .its('app.$workflowService.subscriptions')
      .then(subscriptions => {
        // * the 'root' subscription used by the Dashboard & GScan
        // * the 'workflow' subscription is gone since it's no longer used
        expect(Object.keys(subscriptions).length).to.equal(1)
        expect(subscriptions).to.not.equal(undefined)
        expect(subscriptions.root.observable.closed).to.equal(false)
      })
  })
  it('Should display message triggers', () => {
    cy.visit('/#/tree/one')

    // find the task proxy
    cy.get('[data-node-name=eventually_succeeded]').as('task')
      // expand the job nodes
      .find('.node-expand-collapse-button')
      .click({ force: true })
      // the jobs should be visible
    cy.get('@task')
      .find('.node-data-job')
      .should('be.visible')

      // the first job should have 5 outputs (the maximum number we display)
      .first()
      .find('.message-output')
      .should('have.length', 5)

      // the remainder should be referenced in an overflow counter +2
      .parent()
      .contains('+2')

    // expand the job details node
    cy.get('@task')
      .find('[data-node-type=job]:first').as('job')
      .find('.node-expand-collapse-button')
      .click({ force: true })

    // all 7 outputs/messages should be listed in the job-details
    cy.get('@job')
      .find('.job-details .output')
      .should('have.length', 7)
  })

  describe('filters', () => {
    const initialNumTasks = 7

    it('Should filter by ID', () => {
      cy.visit('/#/tree/one')
      // Should not filter by default
      cy.get('.node-data-task:visible')
        .should('have.length', initialNumTasks)
        .contains('waiting')
      for (const id of ['eed', '/suc', 'GOOD', 'SUC']) {
        cy.get('[data-cy=filter-id] input')
          .clear()
          .type(id)
        cy.get('.node-data-task:visible')
          .should('have.length.lessThan', initialNumTasks)
          .contains('succeeded')
        cy.get('[data-node-name=waiting]')
          .should('not.be.visible')
      }
      // It should stop filtering when input is cleared
      cy.get('[data-cy=filter-id] input')
        .clear()
        .get('.node-data-task:visible')
        .should('have.length', initialNumTasks)
      // It should filter by cycle point
      cy.get('[data-cy=filter-id] input')
        .type('2000') // (matches all tasks)
        .get('.node-data-task:visible')
        .should('have.length', initialNumTasks)
    })

    it('Should filter by task states', () => {
      cy.visit('/#/tree/one')
      for (const name of [/^succeeded$/, /^failed$/, /^retrying$/]) {
        cy.get('.node-data-task')
          .contains(name)
          .should('be.visible')
      }
      cy.get('[data-cy="filter task state"]')
        .click()
        .get('.v-list-item')
        .contains(new RegExp(`^${TaskState.FAILED.name}$`))
        .click()
      for (const name of [/^succeeded$/, /^retrying$/]) {
        cy.get('.node-data-task')
          .contains(name)
          .should('not.be.visible')
      }
      cy.get('.node-data-task')
        .contains(/^failed$/)
        .should('be.visible')
      cy.get('.node-data-task:visible')
        .should('have.length', 1)
    })

    it('Should filter by ID and states', () => {
      cy.visit('/#/tree/one')
      cy
        .get('.node-data-task')
        .contains('failed')
        .should('be.visible')
      cy
        .get('[data-cy=filter-id]')
        .type('i')
      cy
        .get('[data-cy="filter task state"]')
        .click()
        .get('.v-list-item')
        .contains(TaskState.WAITING.name)
        .click({ force: true })
      cy
        .get('.node-data-task:visible')
        .should('have.length', 2)
        .contains('retrying')
    })

    it('remembers job ID and file when switching between workflows', () => {
      cy.visit('/#/workspace/one')
      cy
        .get('.node-data-task')
        .contains('failed')
        .should('be.visible')
      cy
        .get('[data-cy=filter-id]')
        .type('i')
      cy
        .get('[data-cy="filter task state"]')
        .click()
        .get('.v-list-item')
        .contains(TaskState.WAITING.name)
        .click({ force: true })
      // Navigate away
      cy.visit('/#/')
      cy.get('.c-dashboard')
      // Navigate back
      cy.visit('/#/workspace/one')
        .get('.node-data-task:visible')
        .should('have.length', 2)
        .contains('retrying')
    })

    it('Provides a select all functionality', () => {
      cy.visit('/#/tree/one')
      cy
        .get('[data-cy="filter task state"]')
        .get('.v-list-item--active')
        .should('have.length', 0)
      cy
        .get('[data-cy="filter task state"]')
        .click()
        .get('.v-list-item')
        .contains('Select All')
        .click({ force: true })
      cy
        .get('[data-cy="filter task state"]')
        .get('.v-list-item--active')
        .should('have.length', 8)
    })
  })

  describe('Expand/collapse all buttons', () => {
    it('Collapses and expands as expected', () => {
      cy.visit('/#/tree/one')
      cy.get('.node-data-task')
        .contains('sleepy')
        .as('sleepyTask')
        .should('be.visible')
      cy.get('[data-cy=collapse-all]')
        .click()
        .get('@sleepyTask')
        .should('not.be.visible')
        .get('[data-cy=expand-all]')
        .click()
        .get('@sleepyTask')
        .should('be.visible')
    })

    it('Does not expand jobs but can collapse them', () => {
      cy.visit('/#/tree/one')
        .get('[data-cy=expand-all]')
        .click()
        .get('.node-data-job:first')
        .should('not.exist')
      cy.get('[data-node-name=failed]')
        .find('.node-expand-collapse-button')
        .click()
        .get('.node-data-job:first')
        .should('be.visible')
      cy.get('[data-cy=expand-all]')
        .click()
        // The job should remain expanded
        .get('.node-data-job:first')
        .should('be.visible')
      cy.get('[data-cy=collapse-all]')
        .click()
        .get('[data-cy=expand-all]')
        .click()
        // The job should be collapsed now
        .get('.node-data-job:first')
        .should('not.be.visible')
    })

    it('Works when tasks are being filtered', () => {
      cy.visit('/#/tree/one')
      cy.get('.node-data-task')
        .contains('sleepy')
        .as('sleepyTask')
        .should('be.visible')
      cy.get('[data-cy=filter-id]')
        .type('sleep')
      cy.get('[data-cy=collapse-all]')
        .click()
        .get('@sleepyTask')
        .should('not.be.visible')
        .get('[data-cy=expand-all]')
        .click()
        .get('@sleepyTask')
        .should('be.visible')
    })
  })

  it('should show a summary of tasks if the number of selected items is greater than the maximum limit', () => {
    cy.visit('/#/tree/one')
    cy.get('[data-cy="filter task state"]')
      .click()
    // eslint-disable-next-line no-lone-blocks
    TaskState.enumValues.forEach(state => {
      cy.get('.v-list-item')
        .contains(state.name)
        .click({ force: true })
    })
    // Click outside to close dropdown
    cy.get('noscript')
      .click({ force: true })
    cy.get('[data-cy="filter task state"]')
      .contains('.v-select__selection', '(+')
  })

  describe('Toggle families', () => {
    it('Toggles between flat and hierarchical modes', () => {
      cy.visit('/#/tree/one')
      cy.get('.node-data-family').should('have.length', 3)
      cy.get('[data-cy=toggle-families]').click()
      cy.get('.node-data-family').should('have.length', 0)
    })
  })

  describe('Flow nums', () => {
    it('Only shows flow nums when not 1, and flow=None is dimmed', () => {
      cy.visit('/#/tree/one')
      cy.get('[data-node-name=failed]')
        .find('[data-cy=flow-num-chip]')
        .contains('1, 2')
      cy.get('[data-node-name=checkpoint]')
        .find('[data-cy=flow-num-chip]')
        .should('not.exist')
      cy.get('[data-node-name=sleepy] .flow-none')
        .should('have.css', 'opacity')
        .then((opacity) => {
          expect(parseFloat(opacity)).to.be.closeTo(0.6, 0.2)
        })
      cy.get('[data-node-name=sleepy] .node-expand-collapse-button').click()
        // node expand/collapse button should not be dimmed
        .parents('.flow-none')
        .should('not.exist')
        // task icon should be dimmed
        .get('[data-node-name=sleepy] .c-task')
        .parents('.flow-none')
        // children should not be dimmed
        .get('[data-node-name=sleepy] .c-treeitem')
        .parents('.flow-none')
        .should('not.exist')
    })
  })
})
