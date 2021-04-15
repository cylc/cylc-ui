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

describe('Mutations component', () => {
  /**
   * @param {string} nodeName - the tree node name, to search for and open the mutations form
   */
  const openMutationsForm = (nodeName) => {
    cy
      .get('span')
      .contains(nodeName)
      .parent()
      .find('.c-task')
      .click({ force: true })
    cy
      .get('.c-mutation-menu-list')
      .find('.v-list-item__action')
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
        // we should now have a c-task icon
        cy
          .get('.c-task')
          .should('be.visible')
      })
  }
  it('should submit a mutation form', () => {
    submitMutationForms()
  })
  it.only('should not remember data after submitting a mutation form', () => {
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
})
