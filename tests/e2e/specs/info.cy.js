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

describe('Info View', () => {
  it('works', () => {
    // test opening the "Info View" from a task in the "Tree View"
    cy.visit('/#/workspace/one')
      // click on task 20000102T0000Z/failed
      .get('.c-treeitem .c-treeitem .c-treeitem:first')
      .find('.c-task')
      .click({ force: true })

      // from the menu select the "Info" psudo-mutation
      .get('.v-list > :nth-child(6)')
      .contains('Info')
      .click({ force: true })

      // the info view should open
      .get('.c-info').should('be.visible')

      // the metadata panel should be expanded by default
      .find('.v-expansion-panel--active')
      .should('have.length', 1)
      .should('have.class', 'metadata-panel')

      // other panels should expand when clicked
      .get('.c-info .v-expansion-panel:nth-child(2)')
      .find('button')
      .click({ force: true })
      .get('.v-expansion-panel--active')
      .should('have.length', 2)
  })
})
