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
  const collapsedWorkflowMenuLength = 5 // (4 mutations + "show more" btn)
  const expandedWorkflowMenuLength = 20

  it('should not be displayed initially on load', () => {
    cy.visit('/#/workflows/one')
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

  it('expands when "show more" is clicked', () => {
    cy.get('#less-more-button')
      .click()
      .get('.c-mutation-menu-list')
      .should('be.visible')
      .children()
      .should('have.length', expandedWorkflowMenuLength)
  })

  it('closes when clicking outside of the menu', () => {
    // Click on hidden element to avoid clicking on anything unexpected
    cy.get('noscript')
      .click({ force: true })
      .get('.c-mutation-menu-list:first')
      .should('not.be.visible')
  })

  it('should be collapsed next time it is opened', () => {
    cy.get('#workflow-mutate-button')
      .click()
      .get('.c-mutation-menu-list')
      .should('be.visible')
      .children()
      .should('have.length', collapsedWorkflowMenuLength)
  })

  it('updates when clicking on a different Cylc object', () => {
    let firstID
    cy.visit('/#/workflows/one')
      .get('.node-data-cycle:first')
      .find('.c-interactive:first')
      .click()
      .get('.c-mutation-menu')
      .should('be.visible')
      .find('.v-card__title')
      .then(($el) => {
        firstID = $el.text().trim()
      })
      // Now click on other Cylc object
      .get('.node-data-task:first')
      .find('.c-interactive:first')
      .click({ force: true }) // force in case underneath menu
      .get('.c-mutation-menu')
      .should('be.visible')
      .find('.v-card__title')
      .should(($el) => {
        expect($el.text().trim()).not.to.equal(firstID)
      })
  })

  it('should not close when clicking inside menu', () => {
    cy.get('.v-card__title')
      .click()
      .get('.c-mutation-menu')
      .should('be.visible')
  })

  it('closes when clicking on task mutation', () => {
    cy.get('.c-mutation-menu-list')
      .find('.c-mutation:not([aria-disabled]):first')
      .click()
      .get('.c-mutation-menu')
      .should('not.be.visible')
  })
})
