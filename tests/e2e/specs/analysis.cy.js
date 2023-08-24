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

import { analysisQuery } from '@/services/mock/json/index.cjs'
import { clone } from 'lodash'

const sortedTasks = analysisQuery.data.tasks.map(({ name }) => name).sort()

describe('Analysis view', () => {
  const numTasks = sortedTasks.length

  beforeEach(() => {
    cy.visit('/#/analysis/one')
  })

  describe('Table view', () => {
    it('Should display the mocked workflow', () => {
      cy
        .get('.c-analysis table  > tbody > tr')
        .should('have.length', numTasks)
        .should('be.visible')
    })

    describe('Filters', () => {
      it('Should display total times and not filter by default', () => {
        cy
          .get('.c-analysis table > tbody > tr')
          .should('have.length', numTasks)
          .should('be.visible')
        cy
          .get('#c-analysis-filter-task-name')
          .should('be.empty')
        cy
          .get('input#c-analysis-filter-task-platforms')
          .should('have.value', '-1')
        cy
          .get('input#c-analysis-filter-task-timings')
          .should('have.value', 'totalTimes')
      })

      it('Should filter by task name', () => {
        cy
          .get('.c-analysis table > tbody > tr')
          .should('have.length', numTasks)
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
        cy
          .get('.c-analysis table > tbody > tr')
          .should('have.length', numTasks)
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
        cy
          .get('.c-analysis table > tbody > tr')
          .should('have.length', numTasks)
        cy
          .get('td')
          .contains('00:00:30')
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
        cy
          .get('.c-analysis table > tbody > tr')
          .should('have.length', numTasks)
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
        cy
          .get('.c-analysis table > tbody > tr')
          .should('have.length', numTasks)
      })

      it('Should filter by task name, platform and timings', () => {
        cy
          .get('.c-analysis table > tbody > tr')
          .should('have.length', numTasks)
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

  describe('Box & whiskers view', () => {
    beforeEach(() => {
      cy.get('.c-analysis [data-cy=box-plot-toggle]')
        .click()
        .get('.vue-apexcharts')
        .should('be.visible')
    })

    it('switches view', () => {
      // Check for y-axis labels - should be one for each task
      cy.get('.apexcharts-yaxis-label')
        .should('have.length', numTasks)
      cy.get('.c-analysis .c-table')
        .should('not.exist')
      // Switch back to table
      cy.get('.c-analysis [data-cy=table-toggle]')
        .click()
        .get('.c-analysis .c-table')
        .should('be.visible')
        .get('.vue-apexcharts')
        .should('not.exist')
    })

    it('refreshes without getting bogus apexcharts error', () => {
      // https://github.com/apexcharts/vue3-apexcharts/issues/79
      cy.get('[data-cy=analysis-refresh-btn]')
        .click()
        .get('[data-cy=alert-snack')
        .should('not.exist')
        .get('.apexcharts-yaxis-label')
        .should('have.length', numTasks)
    })

    it('sorts the chart entries', () => {
      cy.get('.apexcharts-yaxis-label title').as('taskLabels')
        .should('have.length', numTasks)
        .then((els) => {
          expect(
            Array.from(els, (i) => i.textContent)
          ).to.deep.equal(sortedTasks)
        })
      cy.get('[data-cy=box-plot-sort]')
        .click()
        .get('@taskLabels')
        .then((els) => {
          expect(
            Array.from(els, (i) => i.textContent)
          ).to.deep.equal(clone(sortedTasks).reverse())
        })
    })
  })
})
