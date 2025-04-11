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

import { createStore } from 'vuex'
import { createVuetify } from 'vuetify'
import { merge } from 'lodash'
import storeOptions from '@/store/options'
import { vuetifyOptions } from '@/plugins/vuetify'
import GanttChart from '@/components/cylc/gantt/GanttChart.vue'

const jobs = {
  test_job: [{
    name: 'test_job',
    id: '~cbennett/analysis_view_test/run1//1/a/01',
    submittedTime: '2023-02-23T11:10:09Z',
    startedTime: '2023-02-23T11:10:13Z',
    finishedTime: '2023-02-23T11:10:20Z',
    platform: 'localhost',
  }],
  yet_another_test_job: [{
    name: 'yet_another_test_job',
    id: '~cbennett/analysis_view_test/run1//1/b/01',
    submittedTime: '2023-02-23T11:10:21Z',
    startedTime: '2023-02-23T11:10:24Z',
    finishedTime: '2023-02-23T11:10:26Z',
    platform: 'localhost',
  }],
}

const mountOpts = {
  global: {
    plugins: [
      createStore(storeOptions),
      createVuetify(vuetifyOptions),
    ],
  },
  props: {
    timingOption: 'total',
    animate: false,
  },
}
describe('GanttChart correctly', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(GanttChart, merge(mountOpts, {
      props: {
        jobs,
      },
    }))
    cy.get('.vue-apexcharts')
      .should('be.visible')
      .contains('test_job')
      .get('.vue-apexcharts')
      .contains('yet_another_test_job')
    cy.get('.apexcharts-rangebar-area')
      .first()
      .click({ force: true })
    cy.get('.apexcharts-tooltip-candlestick')
      .should('exist')
      .should('be.visible')
    cy.get('[data-test="v-pagination-item"]')
      .should('have.length', 1)
  })
  it('paginates correctly', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(GanttChart, merge(mountOpts, {
      props: {
        tasksPerPage: 1,
        jobs,
      },
    }))
    cy.get('[data-test="v-pagination-item"]')
      .should('have.length', 2)
    cy.get('.vue-apexcharts')
      .should('be.visible')
      .contains('test_job')
    cy.contains('yet_another_test_job')
      .should('not.exist')
  })
})
