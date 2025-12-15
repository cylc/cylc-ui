/*
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

import { WorkflowStateOrder } from '@/model/WorkflowState.model'
import { __heightThreshold as heightThreshold } from '@/mixins/workflowEvents.js'

describe('Dashboard', () => {
  beforeEach(() => {
    cy.visit('/#/')
    cy.title().should('eq', 'Cylc UI | Dashboard')
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

  it('Disables Jupyter Lab button when not installed', () => {
    cy
      .get('#jupyter-lab-button')
      .should('have.class', 'v-list-item--disabled')
  })

  it('Lists workflow events', () => {
    // NOTE: Log events may be duplicated in offline-mode due to the way the
    // mock data is loaded. This does not apply to production.
    cy.get('[data-cy=events-table] tr:eq(1)')
      .should('contain', 'WARNING')
      .should('contain', 'other/multi/run2')
      .should('contain', 'Reality may go on the blink at infinite improbability')

    // Table should not take up too much height (long messages should be truncated)
    cy.get('[data-cy=events-table] tbody')
      .invoke('height')
      .should('be.lt', heightThreshold)
  })

  for (const [ref, url] of [
    ['workflow-table-link', '/workflow-table'],
    ['workflow-table-link-2', '/workflow-table'],
    ['events-table-view-all', '/events'],
    ['user-settings-link', '/user-profile'],
    ['quickstart-link', '/guide'],
  ]) {
    it(`${ref} links to ${url}`, () => {
      cy.get(`[data-cy=${ref}]`)
        .click()
      cy.url()
        .should('match', new RegExp(`${url}$`))
      cy.contains('Page not found', { matchCase: false })
        .should('not.exist')
    })
  }
})
