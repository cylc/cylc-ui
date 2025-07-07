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
      // click on task
      .get('.node-data-task [data-c-interactive]:first')
      .click({ force: true })

      // from the menu select the "Info" psudo-mutation
      .get('.v-list-item')
      .contains('Info')
      .click({ force: true })

      // the info view should open
      .get('.c-info').should('be.visible')

      // the metadata panel should be expanded by default
      .find('.metadata-panel')
      .should('have.length', 1)
      .should('have.class', 'metadata-panel')

      // other panels should expand when clicked
      .get('.run-mode-panel')
      .find('button')
      .click({ force: true })
      .get('.run-mode-panel')
      .should('have.length', 1)
      .and('contain', 'Live')

      .get('.xtriggers-panel')
      .find('button')
      .click({ force: true })
      .get('.xtriggers-panel')
      .get('table')
      .should('contain', 'xtrigger')
      .and('contain', 'myxt(foo=42)')
      .should('contain', 'another xtrigger')
      .and('contain', 'myxt(foo=41)')

      .get('.prerequisites-panel')
      .find('button')
      .click({ force: true })
      .get('.prerequisites-panel')
      .should('contain', '0 & 1')

      .get('.outputs-panel')
      .find('button')
      .click({ force: true })
      // Outputs panel should have three satisfied outputs:
      .get('.outputs-panel')
      .find('li .satisfied')
      .should('contain', 'submitted')
      .and('contain', 'started')
      .and('contain', 'failed')
      // and two unsatisfied outputs:
      .get('.outputs-panel')
      .find('li')
      .should('have.length', 5)

      .get('.completion-panel')
      .find('button')
      .click({ force: true })
      .get('.completion-panel')
      .should('have.length', 1)
  })
})
