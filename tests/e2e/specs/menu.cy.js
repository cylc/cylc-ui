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

describe('CylcObject Menu component', () => {
  const collapsedWorkflowMenuLength = 7 // (6 mutations + "show more" btn)
  const expandedWorkflowMenuLength = 21

  beforeEach(() => {
    cy.visit('/#/workspace/one')
  })

  it('should not be displayed initially on load', () => {
    cy.get('.c-interactive:first') // wait for view to load
      .get('.c-mutation-menu:first')
      .should('not.exist')
  })

  it('is displayed when a Cylc object is clicked on', () => {
    cy.get('#workflow-mutate-button.c-interactive')
      .click()
      // the menu should now be open
      .get('.c-mutation-menu-list:first')
      .should('be.visible')
      .children()
      .should('have.length', collapsedWorkflowMenuLength)
      .get('.c-mutation-menu')
      .should('be.visible')
  })

  it('expands and collapses', () => {
    cy.get('#workflow-mutate-button.c-interactive')
      .click()
      .get('#less-more-button')
      .click()
      .get('.c-mutation-menu-list')
      .should('be.visible')
      .children()
      .should('have.length', expandedWorkflowMenuLength)
    // Should close when clicking outside of the menu
    // (click on hidden element to avoid clicking on anything unexpected)
    cy.get('noscript')
      .click({ force: true })
      .get('.c-mutation-menu-list:first')
      .should('not.be.visible')
    // Should be collapsed next time it is opened
    cy.get('#workflow-mutate-button')
      .click()
      .get('.c-mutation-menu-list')
      .should('be.visible')
      .children()
      .should('have.length', collapsedWorkflowMenuLength)
  })

  it('updates when clicking on a different Cylc object', () => {
    let firstID
    cy.get('.node-data-cycle:first')
      .find('.c-interactive:first')
      .click()
      .get('.c-mutation-menu')
      .should('be.visible')
      .find('.v-card-title')
      .then(($el) => {
        firstID = $el.text().trim()
      })
      // Expand menu & check for the presence of edit-runtime at family level:
      .get('#less-more-button')
      .click()
      .get('.c-mutation')
      .contains('Edit Runtime')
      // Now click on other Cylc object
      .get('.node-data-task:first')
      .find('.c-interactive:first')
      .click({ force: true }) // force in case underneath menu
      .get('.c-mutation-menu')
      .should('be.visible')
      .find('.v-card-title')
      .should(($el) => {
        expect($el.text().trim()).not.to.equal(firstID)
      })
  })

  it('only closes when appropriate if clicking inside menu', () => {
    cy.get('#workflow-mutate-button.c-interactive')
      .click()
    // Should not close when clicking on non-interactive thing inside menu
    cy.get('.v-card-title')
      .click()
      .get('.c-mutation-menu')
      .should('be.visible')
    // Should close when clicking on task mutation
    cy.get('.c-mutation-menu-list')
      .find('.c-mutation:not([aria-disabled]):first')
      .click()
      .get('.c-mutation-menu')
      .should('not.be.visible')
  })
})
