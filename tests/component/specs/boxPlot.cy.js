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
import BoxPlot from '@/components/cylc/analysis/BoxPlot.vue'

const task1 = {
  name: 'a_test_task',
  platform: 'localhost',
  count: 5,
  meanTotalTime: 90,
  stdDevTotalTime: 15,
  minTotalTime: 68,
  totalQuartiles: [78, 97, 101],
  maxTotalTime: 110,
  meanRunTime: 89,
  stdDevRunTime: 15,
  minRunTime: 66,
  runQuartiles: [77, 95, 99],
  maxRunTime: 108,
  meanQueueTime: 1,
  stdDevQueueTime: 0,
  minQueueTime: 1,
  queueQuartiles: [2, 2, 2],
  maxQueueTime: 2,
}

const task2 = {
  name: 'another_test_task',
  platform: 'xcf',
  count: 1,
  meanTotalTime: 135,
  stdDevTotalTime: 0.5,
  minTotalTime: 60,
  totalQuartiles: [80, 105, 135],
  maxTotalTime: 145,
  meanRunTime: 105,
  stdDevRunTime: 0.5,
  minRunTime: 60,
  runQuartiles: [80, 105, 135],
  maxRunTime: 145,
  meanQueueTime: 30,
  stdDevQueueTime: 0.5,
  minQueueTime: 60,
  queueQuartiles: [80, 105, 135],
  maxQueueTime: 145,
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
  }
}

describe('BoxPlot', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(BoxPlot, merge(mountOpts, {
      props: {
        tasks: [task1, task2],
      },
    }))
    // Make sure the chart is shown
    cy.get('.vue-apexcharts')
      .should('be.visible')
      .contains('a_test_task')
      .get('.vue-apexcharts')
      .contains('another_test_task')
  })

  it('paginates', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(BoxPlot, merge(mountOpts, {
      props: {
        tasks: Array.from(Array(7).keys(), (i) => ({
          ...task1,
          name: `task_${i}`
        })),
        itemsPerPage: 4,
      },
    }))
    cy.get('.apexcharts-yaxis title')
      .should('have.length', 4)
      .get('[data-test=v-pagination-item]')
      .should('have.length', 2)
      .get('[data-test=v-pagination-next]')
      .click()
      .get('.apexcharts-yaxis title')
      .should('have.length', 3)
  })
  it('shows tooltip', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(BoxPlot, merge(mountOpts, {
      props: {
        tasks: [task1, task2],
      },
    }))
    cy.get('.vue-apexcharts')
      .trigger('mousemove', { clientX: 100, clientY: 100 })
      .get('.apexcharts-tooltip')
      .should('be.visible')
  })
})
