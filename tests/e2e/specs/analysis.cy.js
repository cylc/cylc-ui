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

describe('Analysis view', () => {
  it('Should display the mocked workflow', () => {
    cy.visit('/#/analysis/one')
    cy
      .get('.c-analysis table  > tbody > tr')
      .should('have.length', 3)
      .should('be.visible')
  })
  describe('Filters', () => {
    it('Should display total times and not filter by default', () => {
      cy.visit('/#/analysis/one')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 3)
        .should('be.visible')
      cy
        .get('#c-analysis-filter-task-name')
        .should('be.empty')
      cy
        .get('#c-analysis-filter-task-platforms')
        .parent()
        .parent()
        .find('input[type="hidden"]')
        .should('have.value', '')
      cy
        .get('#c-analysis-filter-task-timings')
        .parent()
        .parent()
        .find('input[type="hidden"]')
        .should('have.value', 'totalTimes')
    })
  })
})
