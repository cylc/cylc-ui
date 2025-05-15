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

import WarningIcon from '@/components/cylc/WarningIcon.vue'
import { defineComponent, h } from 'vue'

// component wrapper to boost size
const WarningComponent = defineComponent({
  render () {
    return h(
      'span',
      { style: 'font-size: 200px; margin: 100px;' },
      [
        h(WarningIcon, this.$attrs)
      ]
    )
  }
})

// data-store workflow node with no warnings
const workflowWithoutWarning = {
  id: '~component-test/warning-icon',
  node: {},
}

// data-store workflow node with one warning
const workflowWithWarning = {
  ...workflowWithoutWarning,
  node: {
    logRecords: [
      { level: 'INFO', message: 'Hello Warning!' }
    ],
    warningActive: true,
  }
}

describe('Warning Icon', () => {
  it('should start inactive', () => {
    cy.vmount(
      WarningComponent,
      { props: { workflow: workflowWithoutWarning } },
    )
    cy.get('.c-warn')
      // warning icon should not be illuminated
      .should('not.have.class', 'active')
  })

  it('should be dismissable', () => {
    cy.vmount(
      WarningComponent,
      { props: { workflow: workflowWithWarning } },
    )
    cy.get('.c-warn')
      // one event to warn about => icon should be illuminated
      .should('have.class', 'active')
      // dismiss the warning
      .find('svg').click({ force: true })
      // icon should not be illuminated
      .should('not.have.class', 'active')
  })

  it('should display events', () => {
    cy.vmount(
      WarningComponent,
      { props: { workflow: workflowWithWarning } },
    )
    // inspect tooltip text
    cy.get('.c-warn svg')
      .trigger('mouseenter')
      .invoke('attr', 'aria-describedby').then((tooltipID) => {
        cy.get(`#${tooltipID} .v-overlay__content`)
          .should('contain', 'INFO')
          .and('contain', 'Hello Warning')
      })
  })
})
