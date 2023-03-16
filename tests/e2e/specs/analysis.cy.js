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
    it('Should filter by task name', () => {
      cy.visit('/#/analysis/one')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 3)
        .should('be.visible')
      cy
        .get('td')
        .contains('eventually')
        .should('be.visible')
      cy
        .get('#c-analysis-filter-task-name')
        .type('wait')
      cy
        .get('td')
        .contains('waiting')
        .should('be.visible')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 1)
        .should('be.visible')
    })
    it('Should filter by task platform', () => {
      cy.visit('/#/analysis/one')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 3)
        .should('be.visible')
      cy
        .get('td')
        .contains('platform_1')
        .should('be.visible')
      cy
        .get('#c-analysis-filter-task-platforms')
        .click({ force: true })
      cy
        .get('.v-list-item')
        .contains('platform_2')
        .click({ force: true })
      cy
        .get('td')
        .contains('eventually')
        .should('be.visible')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 1)
        .should('be.visible')
    })
    it('Should display the correct timings', () => {
      cy.visit('/#/analysis/one')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 3)
        .should('be.visible')
      cy
        .get('td')
        .contains('00:00:30')
        .should('be.visible')
      // Show run times
      cy
        .get('#c-analysis-filter-task-timings')
        .click({ force: true })
      cy
        .get('.v-list-item')
        .contains('Run')
        .click({ force: true })
      cy
        .get('td')
        .contains('00:00:21')
        .should('be.visible')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 3)
        .should('be.visible')
      // Show queue times
      cy
        .get('#c-analysis-filter-task-timings')
        .click({ force: true })
      cy
        .get('.v-list-item')
        .contains('Queue')
        .click({ force: true })
      cy
        .get('td')
        .contains('00:00:12')
        .should('be.visible')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 3)
        .should('be.visible')
    })
    it('Should filter by task name, platform and timings', () => {
      cy.visit('/#/analysis/one')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 3)
        .should('be.visible')
      cy
        .get('td')
        .contains('30')
        .should('be.visible')
      // Show only task on platform_1
      cy
        .get('#c-analysis-filter-task-platforms')
        .click({ force: true })
      cy
        .get('.v-list-item')
        .contains('platform_1')
        .click({ force: true })
      cy
        .get('td')
        .contains('waiting')
        .should('be.visible')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 2)
        .should('be.visible')
      // Show run times
      cy
        .get('#c-analysis-filter-task-timings')
        .click({ force: true })
      cy
        .get('.v-list-item')
        .contains('Run')
        .click({ force: true })
      cy
        .get('td')
        .contains('00:00:21')
        .should('be.visible')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 2)
        .should('be.visible')
      // Show task names containing 'wait'
      cy
        .get('#c-analysis-filter-task-name')
        .type('wait')
      cy
        .get('td')
        .contains('waiting')
        .should('be.visible')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 1)
        .should('be.visible')
      // Show queue times
      cy
        .get('#c-analysis-filter-task-timings')
        .click({ force: true })
      cy
        .get('.v-list-item')
        .contains('Queue')
        .click({ force: true })
      cy
        .get('td')
        .contains('00:00:12')
        .should('be.visible')
      cy
        .get('.c-analysis table > tbody > tr')
        .should('have.length', 1)
        .should('be.visible')
    })
  })
})
