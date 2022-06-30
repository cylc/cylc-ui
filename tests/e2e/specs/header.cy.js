/// <reference types="Cypress" />
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
describe('Header Component', () => {
  it('test username@host', () => {
    cy
      .visit('/#/')
      .get('.c-environment-info')
      .should('exist')
      .should('be.visible')
      .get('#username > .v-chip__content')
      .should('exist')
      .should('be.visible')
      .contains('cylc')
      .get('#host > .v-chip__content')
      .should('exist')
      .should('be.visible')
      .contains('localhost:8080')
  })
})
