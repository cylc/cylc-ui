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

describe('Command Menu component', () => {
  const collapsedWorkflowMenuLength = 4
  const expandedWorkflowMenuLength = 21

  beforeEach(() => {
    cy.visit('/#/workspace/one')
  })

  it('is displayed when a Cylc object is clicked on', () => {
    // should not be displayed initially on load
    cy.get('[data-c-interactive]:first') // wait for stuff to load
      .get('.c-mutation-menu')
      .should('not.exist')

    cy.get('#workflow-mutate-button')
      .click()
      // the menu should now be open
      .get('.c-mutation-menu-list:first')
      .should('be.visible')
      .children('.c-mutation')
      .should('have.length', collapsedWorkflowMenuLength)
      .get('.c-mutation-menu')
      .should('be.visible')
      // should close on Esc key
    cy.get('body').type('{esc}')
      .get('.c-mutation-menu')
      .should('not.exist')
  })

  it('expands and collapses', () => {
    cy.get('#workflow-mutate-button')
      .click()
      .get('#less-more-button')
      .click()
      .get('.c-mutation-menu-list')
      .should('be.visible')
      .children('.c-mutation')
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
      .children('.c-mutation')
      .should('have.length', collapsedWorkflowMenuLength)
  })

  it('updates when clicking on a different Cylc object', () => {
    let firstID
    cy.get('.node-data-cycle:first')
      .find('[data-c-interactive]:first')
      .click()
      .get('.c-mutation-menu')
      .should('be.visible')
      .find('.v-card-title')
      .then(($el) => {
        firstID = $el.text().trim()
      })
      // Now click on other Cylc object
      .get('.node-data-task:first')
      .find('[data-c-interactive]:first')
      .click({ force: true }) // force in case underneath menu
      .get('.c-mutation-menu')
      .should('be.visible')
      .find('.v-card-title')
      .should(($el) => {
        expect($el.text().trim()).not.to.equal(firstID)
      })
  })

  it('works when clicking on different Cylc objects representing the same node', () => {
    cy.get('.c-gscan .node').contains('one')
      .parents('.node').find('[data-c-interactive]')
      .click()
      .get('.c-mutation-menu .v-card-title')
      .should('be.visible')
      .contains('one')
    cy.get('#workflow-mutate-button')
      .click({ force: true })
      .get('.c-mutation-menu .v-card-title')
      .should('be.visible')
      .contains('one')
  })

  it('only closes when appropriate if clicking inside menu', () => {
    cy.get('#workflow-mutate-button')
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
      .should('not.exist')
  })

  it("copies the object's name to the clipboard", { browser: 'electron' }, () => {
    // (Access to the clipboard in Cypress only reliably works in Electron)
    cy.get('.node-data-task:first [data-c-interactive]:first')
      .click()
      .get('.c-mutation-menu')
      .find('[data-cy=copy-to-clipboard]')
      .click()
    // clipboard should contain the object's name:
    cy.window().its('navigator.clipboard')
      .then((clip) => clip.readText())
      .should('equal', 'one//20000102T0000Z/failed')
  })
})
