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
import LogComponent from '@/components/cylc/log/Log.vue'

const mountOpts = {
  global: {
    plugins: [
      createStore(storeOptions),
      createVuetify(vuetifyOptions),
    ],
  },
  props: {}
}

const logs = [...Array(20).keys()].map(e => e.toString() + '\n')

describe('Log Component', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(LogComponent, merge(mountOpts, {
      props: {
        logs,
        timestamps: 'timestamps',
        'word-wrap': false,
        autoScroll: false,
        error: null
      },
    })).as('wrapper')

    cy.get('[class="log-wrapper"]')
      .should('be.visible')
      .contains('1')
  })

  it('autoScrolls', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(LogComponent, merge(mountOpts, {
      props: {
        logs,
        timestamps: 'timestamps',
        'word-wrap': false,
        autoScroll: false,
        error: null
      },
    })).as('wrapper')

    // should not scroll to bottom
    cy.window().then(($window) => {
      expect($window.scrollY).to.equal(0)
    })

    // turn autoscroll on
    cy.get('@wrapper').then(({ wrapper }) => {
      wrapper.setProps({
        autoScroll: true
      })
    })
    // update the log
    cy.get('@wrapper').then(({ wrapper }) => {
      wrapper.setProps({
        logs: [...Array(40).keys()].map(e => e.toString() + '\n')
      })
    })
    // log file should now have scrolled to the bottom
    cy.get('[class="log-wrapper"]').window().its('scrollY').should('not.equal', 0)
  })
})
