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

import { processMutations } from '@/utils/aotf'
import { cloneDeep, upperFirst } from 'lodash'
import {
  MUTATIONS
} from '$tests/e2e/support/graphql'
import { Deferred } from '$tests/util'

describe('Mutations component', () => {
  beforeEach(() => {
    cy.visit('/#/tree/one')
  })

  /**
   * @param {string} nodeName - the tree node name, to search for and open the mutations form
   */
  const openMutationsForm = (nodeName) => {
    cy.get('[data-cy=tree-view]').as('treeView')
      .find('.c-treeitem')
      .find('.c-task')
      .should('be.visible')
    cy.get('@treeView')
      .find('span')
      .contains(nodeName)
      .parent()
      .find('.c-task')
      .click()
    cy
      .get('.c-mutation-menu-list:first')
      .find('[data-cy=mutation-edit]:first')
      .should('exist')
      .should('be.visible')
      .click()
  }

  /** Patch the list of available mutations */
  const mockMutations = () => {
    cy.window().its('app.$workflowService').then(service => {
      const mutations = cloneDeep(MUTATIONS)
      processMutations(mutations, [])
      service.introspection = Promise.resolve({
        mutations,
        types: [],
        queries: []
      })
      service.primaryMutations = {
        workflow: ['workflowMutation']
      }
    })
  }

  describe('Successful submission', () => {
    beforeEach(() => {
      mockMutations()
      // Patch graphql responses
      cy.intercept('/graphql', (req) => {
        const { query } = req.body
        if (query.startsWith('mutation')) {
          console.log(req)
          req.reply({
            data: {
              [req.body.operationName]: {
                result: [true, {}],
                __typename: upperFirst(req.body.operationName)
              }
            }
          })
        }
      })
    })

    it('should submit a mutation form', () => {
      openMutationsForm('BAD')
      // fill mocked mutation form with any data
      cy.get('.v-dialog')
        .within(() => {
          // type anything in the text inputs
          cy.get('input[type="text"]')
            .each(($el) => {
              cy.wrap($el).clear()
              cy.wrap($el).type('ABC')
            })
        })
        // click on the submit button
        .get('[data-cy="submit"]')
        .click()
        // form should close on successfull submission
        .get('.c-mutation-dialog')
        .should('not.exist')

      // It should not remember data after submission
      openMutationsForm('BAD')
      cy.get('.v-dialog')
        .within(() => {
          cy.get('input[type="text"]')
            .each(($el) => {
              cy.wrap($el).should('not.contain.value', 'ABC')
            })
        })
    })

    it('should stay open while submitting', () => {
      const deferred = new Deferred()
      cy.intercept('/graphql', req => {
        if (req.body.query.startsWith('mutation')) {
          // Cypress will await promise before continuing with the request
          return deferred.promise
        }
      })
      openMutationsForm('BAD')
      cy.get('[data-cy="submit"]')
        .click()
        .should('have.class', 'v-btn--loading')
      // Wait half a sec in case dialog closes
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500)
        .get('.c-mutation-dialog')
        .should('be.visible')
        // Now let mutation response through
        .then(() => {
          cy.log('Resolve mutation')
          deferred.resolve()
        })
        // Now the form should close
        .get('.c-mutation-dialog')
        .should('not.exist')
    })
  })

  describe('Failed submission', () => {
    // Note: in offline mode, mutations currently fail by default without patching graphql
    it('should stay open if failed', () => {
      openMutationsForm('GOOD')
      cy.get('[data-cy="submit"]')
        .click()
        // Error snackbar should appear
        .get('[data-cy="alert-snack"] .v-snackbar__content')
        .as('snackbar')
        .should('be.visible')
        .get('[data-cy="snack-close"]')
        .click()
        .get('@snackbar')
        .should('not.exist')
        // Form should stay open
        .get('.c-mutation-dialog')
        .should('be.visible')
        // Clicking cancel should close form
        .get('[data-cy="cancel"]')
        .click()
        .get('.c-mutation-dialog')
        .should('not.exist')
    })
  })

  it('should validate the form', () => {
    mockMutations()
    openMutationsForm('checkpoint')
    // Form should be valid initially
    cy.get('[data-cy=submit]').as('submit')
      .should('not.be.disabled')
      .should('not.have.class', 'text-error')
      .trigger('mouseenter')
      .invoke('attr', 'aria-describedby').then((tooltipID) => {
        cy.get(`#${tooltipID} .v-overlay__content`).as('errTooltip')
          // NOTE: .should('not.be.visible') doesn't work - get Cypress error
          // "not visible because it has CSS property: position: fixed and it's being covered by another element"
          .should('have.css', 'display', 'none')
      })
    // Now type invalid input
    cy.get('.c-mutation-dialog')
      .find('.v-list-item-title')
      .contains('Workflow')
      .parent()
      .find('.v-input.v-text-field:first').as('textField')
      .find('input[type="text"]')
      .type(' ') // (spaces should not be allowed)
      .get('@textField')
      .should('have.class', 'v-input--error')
      .get('@submit')
      .should('have.class', 'text-error')
      .trigger('mouseenter')
      .should('not.be.disabled') // user can still submit if they really want to
      .get('@errTooltip')
      .should('not.have.css', 'display', 'none')
  })
  it('has actions buttons pinned to bottom of form', () => {
    cy.get('[data-c-interactive]:first')
      .click()
      .get('#less-more-button')
      .click()
      .get('.c-mutation-menu-list')
      // choose mutation with long form so it overflows
      .contains('Play')
      .parents('.v-list-item')
      .find('[data-cy=mutation-edit]')
      .click()
      .get('.v-card-actions')
      .should('be.visible')
  })
})
