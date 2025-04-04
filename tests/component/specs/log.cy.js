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

function logLines (length) {
  return Array.from({ length }, (_, i) => `Line ${i + 1}\n`)
}

describe('Log Component', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(LogComponent, merge(mountOpts, {
      props: {
        logs: logLines(20),
      },
    }))

    cy.get('span')
      .contains('Line 1')
      .should('be.visible')
  })

  it('autoScrolls', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(LogComponent, merge(mountOpts, {
      props: {
        logs: logLines(30),
        autoScroll: false,
      },
    })).as('component')

    // should not scroll to bottom
    cy.get('span').contains('Line 30')
      .should('not.be.visible')

    // turn autoscroll on
    cy.get('@component').then(({ wrapper }) => {
      wrapper.setProps({
        autoScroll: true
      })
    })
    cy.get('span').contains('Line 30')
      .should('be.visible')

    // update the log
    cy.get('@component').then(({ wrapper }) => {
      wrapper.setProps({
        logs: logLines(50)
      })
    })
    // log file should now have scrolled to the bottom
    cy.get('span').contains('Line 50')
      .should('be.visible')
  })

  it('scroll to the top', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(LogComponent, merge(mountOpts, {
      props: {
        logs: logLines(30),
        autoScroll: true,
      },
    })).as('component')
    // should be scrolled to bottom initially with autoScroll prop set to true
    cy.get('span').contains('Line 30')
      .should('be.visible')
    cy.get('[data-cy=log-scroll-top').click()
    cy.get('span').contains('Line 1')
      .should('be.visible')
  })
})
