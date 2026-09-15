/**
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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

import { initialWidth, minWidth } from '@/components/cylc/Drawer.vue'

/**
 * Helper to resize the drawer in the test
 *
 * @param {number} width - width to resize to
 */
const resize = (width) => cy
  .get('#c-sidebar .resize-bar')
  .trigger('mousedown')
  .trigger('mousemove', { clientX: width, clientY: 500 })
  .trigger('mouseup', { force: true })

// Cypress 16 deprecated the original visibility strategy so it no longer includes checking
// that the element has not been transformed off-screen
// https://docs.cypress.io/app/core-concepts/interacting-with-elements#Visibility-Strategy
Cypress.Commands.addQuery('isOnScreen', () => {
  return ($els) => Array.from($els).every(
    (el) => Cypress.dom.isVisible(el) && el.getBoundingClientRect().right > 0
  )
})

describe('Drawer component', () => {
  it('is displayed when mode is desktop', () => {
    cy.visit('/#/')
    cy.get('#c-sidebar')
      .isOnScreen()
      .should('be.true')
    cy.get('#toggle-drawer')
      .click()
    cy.get('#c-sidebar')
      .isOnScreen()
      .should('not.be.true')
  })

  it('is NOT displayed when viewport is narrow', () => {
    // when the window dimension is below a mobile-threshold, the app sets state.app.drawer as false
    // and then the drawer is hidden
    cy.viewport(320, 480)
    cy.visit('/#/')
    cy.get('#c-sidebar')
      .isOnScreen()
      .should('not.be.true')
    cy.get('#toggle-drawer')
      .click()
    cy.get('#c-sidebar')
      .isOnScreen()
      .should('be.true')
  })

  it('should drag to trigger resize', () => {
    cy.visit('/#/')
    cy.get('#c-sidebar')
      .invoke('innerWidth')
      .should('be.eq', initialWidth)
    resize(200)
    cy.get('#c-sidebar')
      .invoke('innerWidth')
      .should('be.closeTo', 200, 5)
    // Resizing to less than min width should hide it
    resize(minWidth - 5)
    cy.get('#c-sidebar')
      .isOnScreen()
      .should('not.be.true')
    // Click hamburger btn to bring it back
    cy.get('#toggle-drawer')
      .should('be.visible')
      .click()
    cy.get('#c-sidebar')
      .isOnScreen()
      .should('be.true')
    cy.get('#c-sidebar')
      .invoke('innerWidth')
      .should('be.closeTo', 200, 5)
  })

  it('has Cylc version info', () => {
    cy.visit('/#/')
    cy.get('#version-chip')
      .trigger('mouseenter')
      .get('[data-cy=version-tooltip]')
      .should('be.visible')
      .invoke('text').then((text) => {
        expect(text).to.contain('cylc-flow ')
        expect(text).to.contain('cylc-uiserver ')
        expect(text).to.contain('cylc-ui ')
      })
  })
})
