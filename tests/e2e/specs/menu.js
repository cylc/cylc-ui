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
  it('Is displayed when a Cylc object is clicked on', () => {
    cy.visit('/#/workflows/one')

    cy
      // it should not by displayed on load
      .get('.c-mutation-menu:first')
      .children()
      .should('have.length', 0)

      // click on the first interactive thing
      .get('.c-interactive:first')
      .click()
      .then(() => {
        // the menu should now be open
        cy
          .get('.c-mutation-menu-list:first')
          .should('be.visible')
          .children()
          .should('have.length', 2)
          .get('.v-menu__content:first')
          .should('be.visible')
      })
  })
})
