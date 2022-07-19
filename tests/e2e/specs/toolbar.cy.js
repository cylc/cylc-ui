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

describe('Toolbar component', () => {
  it('Is displayed when we are looking at a workflow', () => {
    cy.visit('/#/workflows/one')
    cy
      .get('#core-app-bar')
      .should('exist')
  })
  it('Is NOT displayed when looking at the dashboard', () => {
    cy.visit('/#/')
    cy
      .get('#core-app-bar')
      .should('not.exist')
  })
})
