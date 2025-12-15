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

import { __heightThreshold as heightThreshold } from '@/mixins/workflowEvents.js'

// Get cell text for a column by header name, as an array
Cypress.Commands.add('getColumnValues', (header) => {
  // Ensure table has loaded fully:
  cy.get('[data-cy=events-table]')
    .get('[data-cy=no-events]')
    .should('not.exist')

  return cy.get('[data-cy=events-table] th')
    .contains(header)
    .parents('th')
    .then(($th) => cy.get(`[data-cy=events-table] tbody tr > td:nth-child(${$th.index() + 1})`))
    .then(($cells) => Array.from($cells, (cell) => cell.innerText.trim()))
})

describe('Events table view', () => {
  beforeEach(() => {
    cy.visit('/#/events')
  })

  it('Displays log records', () => {
    cy.get('[data-cy=events-table] tbody tr')
      .should('have.length.gte', 4)

    cy.get('[data-cy=events-table] tbody tr:eq(1)')
      .should('contain', 'WARNING')
      .should('contain', 'other/multi/run2')
      .should('contain', 'Reality may go on the blink at infinite improbability')
      .contains('Reality may go on the blink at infinite improbability')

    // It should show the full messages (not truncated)
    cy.get('[data-cy=events-table] tbody')
      .invoke('height')
      .should('be.gt', heightThreshold)
  })

  it('Sorts', () => {
    const sortedLevels = ['WARNING', 'WARNING', 'ERROR', 'CRITICAL']
    cy.get('[data-cy=events-table] th')
      .contains('Level').as('levelHeader')
      .click()
      .getColumnValues('Level')
      .should('deep.equal', sortedLevels)
    cy.get('@levelHeader')
      .click()
      .getColumnValues('Level')
      .should('deep.equal', sortedLevels.toReversed())

    // It should remember the sorting
    cy.reload()
    cy.getColumnValues('Level')
      .should('deep.equal', sortedLevels.toReversed())
  })

  it('Links to the workflows', () => {
    cy.get('[data-cy=events-table] td').contains('other/multi/run2')
      .find('a:first')
      .click()
    cy.url().should('include', '/workspace/other/multi/run2')
  })
})
