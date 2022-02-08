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
  it('should not be displayed initially on load', () => {
    cy.visit('/#/workflows/one')
    cy.get('.c-interactive:first') // wait for view to load
      .get('.c-mutation-menu:first')
      .should('not.exist')
  })

  it('is displayed when a Cylc object is clicked on', () => {
    cy
      // click on the first interactive thing
      .get('.c-interactive:first')
      .click()
      // the menu should now be open
      .get('.c-mutation-menu-list:first')
      .should('be.visible')
      // length is 5, as 4 plus show more
      .children()
      .should('have.length', 5)
      .get('.c-mutation-menu')
      .should('be.visible')
  })
})
