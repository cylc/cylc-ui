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

import MessageChip from '@/components/cylc/MessageChip.vue'

describe('View MessageChip Component', () => {
  const mountMessageChip = (props) => {
    cy.vmount(
      MessageChip,
      {
        props
      }
    ).as('wrapper')
    // add the classes Vuetify requires
    cy.addVuetifyStyles(cy)
  }

  it('checks messageChip colors', () => {
    // mount the toolbar with a couple of controls
    mountMessageChip(
      {
        level: 'this is a debug message',
        message: 'Task Message :this is a debug message',
        isMessage: true
      }
    )

    // are the messages the correct colours?
    cy
      .get('.v-chip')
      .should('have.class', 'bg-blue')
      .contains('this is a debug message')
  })
})
