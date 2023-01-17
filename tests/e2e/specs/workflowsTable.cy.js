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

describe('Workflows-Table view', () => {
  beforeEach(() => {
    cy.visit('/#/workflow-table')
  })

  it("Opens mutation menu when clicking on a workflow's icon", () => {
    cy.get('[data-cy=workflows-table] .c-interactive:first')
      .click()
      .get('.c-mutation-menu-list:first')
      .should('be.visible')
  })

  it('Opens workspace view when clicking on workflow', () => {
    cy.get('[data-cy=workflows-table]')
      .contains('td', 'one')
      .click()
      .get('[data-cy=workspace-view]')
  })
})
