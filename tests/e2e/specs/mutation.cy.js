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

import { upperFirst } from 'lodash'
import {
  MUTATIONS
} from '../support/graphql'

describe('Mutations component', () => {
  beforeEach(() => {
    // Patch graphql responses
    cy
      .intercept('/graphql', (req) => {
        const query = req.body.query
        if (query.includes('__schema')) { // query that loads mutations
          req.reply({
            data: {
              __schema: {
                mutationType: {
                  fields: MUTATIONS
                },
                types: []
              }
            }
          })
        } else { // mutation
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
      .as('HoldMutationQuery')
  })

  /**
   * @param {string} nodeName - the tree node name, to search for and open the mutations form
   */
  const openMutationsForm = (nodeName) => {
    cy.window().its('app.$workflowService').then(service => {
      // mock the apollo client's mutate method to catch low-level calls
      service.primaryMutations = {
        workflow: ['workflowMutation']
      }
    })
    cy.get('[data-cy=tree-view]').as('treeView')
      .find('.treeitem')
      .find('.c-task')
      .should('be.visible')
    // cy.wait(['@HoldMutationQuery'])
    cy.get('@treeView')
      .find('span')
      .contains(nodeName)
      .parent()
      .find('.c-task')
      .click()
    cy
      .get('.c-mutation-menu-list:first')
      .find('[data-cy=mutation-edit]')
      .should('exist')
      .should('be.visible')
      .click()
  }

  const submitMutationForms = () => {
    cy.visit('/#/workflows/one')
    openMutationsForm('BAD')
    // fill mocked mutation form with any data
    cy
      .get('.v-dialog')
      .within(() => {
        // type anything in the text inputs
        cy
          .get('input[type="text"]')
          .each(($el) => {
            cy.wrap($el).clear()
            cy.wrap($el).type('ABC')
          })
        // click on the submit button
        cy
          .get('span')
          .contains('Submit')
          .parent()
          .click()
      })
  }

  it('should submit a mutation form', () => {
    submitMutationForms()
  })

  it('should not remember data after submitting a mutation form', () => {
    submitMutationForms()
    // close submit form (not clicking on cancel, as it appears to clear the form, but outside the dialog)
    cy
      .get('.v-overlay')
      .click({ force: true })
    // click on the GOOD family proxy now
    openMutationsForm('GOOD')
    cy
      .get('.v-dialog')
      .within(() => {
        // type anything in the text inputs
        cy
          .get('input[type="text"]')
          .each(($el) => {
            cy.wrap($el).should('not.contain.value', 'ABC')
          })
      })
  })

  it('should validate the form', () => {
    cy.visit('/#/workflows/one')
    openMutationsForm('checkpoint')
    // Form should be valid initially
    cy.get('[data-cy=submit]').as('submit')
      .should('not.be.disabled')
      .should('not.have.class', 'error--text')
      // Indirect test for "form invalid" tooltip by checking aria-expanded attribute
      // (not ideal but it's way too troublesome to test visibility of .v-tooltip__content)
      .trigger('mouseenter')
      .should('have.attr', 'aria-expanded', 'false') // should not be visible
    // Now type invalid input
    cy.get('.c-mutation-form')
      .find('.v-list-item__title')
      .contains('workflow')
      .parent()
      .find('.v-input.v-text-field:first').as('textField')
      .find('input[type="text"]')
      .type(' ') // (spaces should not be allowed)
      .get('@textField')
      .should('have.class', 'error--text')
      .get('@submit')
      .should('have.class', 'error--text')
      .trigger('mouseenter')
      .should('have.attr', 'aria-expanded', 'true') // tooltip should be visible
      .should('not.be.disabled') // user can still submit if they really want to
  })
})
