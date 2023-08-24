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

import { WorkflowStateOrder } from '@/model/WorkflowState.model'

describe('Dashboard', () => {
  beforeEach(() => {
    cy.visit('/#/')
  })

  it('Displays the Dashboard link as active on the left sidebar menu', () => {
    cy
      .get('nav')
      .contains('a.v-list-item', 'Dashboard')
      .should('have.class', 'v-list-item--active')
  })

  it('Displays the icons', () => {
    cy
      .get('.c-dashboard .v-icon:first')
      .find('svg')
      .should('be.visible')
  })

  it('Displays the states in order', () => {
    cy
      .get('#dashboard-workflows table tbody tr')
      .first()
      .find('td')
      .then($tdElement => {
        return $tdElement[1].textContent.toLowerCase()
      })
      .should('equal', [...WorkflowStateOrder.entries()][0][0])
  })

  it('Disables cylc hub button in single user mode', () => {
    cy
      .get('#cylc-hub-button')
      .should('have.class', 'v-list-item--disabled')
  })

  for (const ref of ['workflow-table-link', 'user-settings-link', 'quickstart-link']) {
    it(`Visits ${ref}`, () => {
      cy.get(`[data-cy=${ref}`)
        .click()
      cy.contains('Page not found', { matchCase: false })
        .should('not.exist')
        // Ideally we should check for HTTP 404 but our 404 page returns 200!
        // https://github.com/cylc/cylc-ui/issues/334
    })
  }

  // TODO: add test that verifies the dashboard content after we have reviewed how it should look like
})
