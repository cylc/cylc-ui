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

describe('Drawer component', () => {
  it('Is displayed when mode is desktop', () => {
    cy.visit('/#/')
    cy
      .get('.v-navigation-drawer')
      .should('be.visible')
  })
  it('Is NOT displayed when mode is mobile', () => {
    // when the window dimension is below a mobile-threshold, the app sets state.app.drawer as false
    // and then the drawer is hidden
    cy.viewport(320, 480)
    cy.visit('/#/')
    cy
      .get('.v-navigation-drawer')
      .should('not.be.visible')
    // besides the above, now the user should see a link to display the drawer
    cy
      .get('#toggle-drawer')
      .should('be.visible')
  })
})
