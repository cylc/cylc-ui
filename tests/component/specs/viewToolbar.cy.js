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

import {
  mdiCog,
  mdiGestureTap,
  mdiToggleSwitch
} from '@mdi/js'
import ViewToolbar from '@/components/cylc/ViewToolbar.vue'

describe('View Toolbar Component', () => {
  const mountToolbar = (groups) => {
    cy.vmount(
      ViewToolbar,
      {
        props: { groups }
      }
    ).as('wrapper')
    // add the classes Vuetify requires
    cy.addVuetifyStyles(cy)
  }

  it('loads, toggles and runs callbacks ', () => {
    // set up a handler for callback events
    const callbacks = []
    function myCallback () {
      callbacks.push(true)
    }

    // mount the toolbar with a couple of controls
    mountToolbar([
      {
        title: 'Group 1',
        controls: [
          {
            title: 'Toggle',
            icon: mdiToggleSwitch,
            action: 'toggle',
            value: true,
            key: 'toggle'
          },
          {
            title: 'Callback',
            icon: mdiGestureTap,
            action: 'callback',
            callback: myCallback,
            key: 'callback'
          }
        ]
      }
    ])

    // test all controls rendered
    cy
      .get('.group')
      .should('have.length', 1)
      .get('.control')
      .should('have.length', 2)
      .should('be.visible')

    // test action=toggle
    cy
      // the toggle should be blue because it's active (default true)
      .get('[data-cy=control-toggle] .v-btn')
      .should('have.class', 'text-blue')
      // clicking the toggle should emit a "setOption" event with the
      // controls key (toggle) and new value (false)
      .click({ force: true })
      .get('@wrapper').then(({ wrapper }) => {
        expect(
          wrapper.emitted().setOption.at(-1)
        ).to.deep.equal(['toggle', false])
      })
      // it should not be grey because it's inactive (false)
      .get('[data-cy=control-toggle] .v-btn')
      .not('.text-blue')
      // click it again and it should become active again
      .click({ force: true })
      .get('@wrapper').then(({ wrapper }) => {
        expect(
          wrapper.emitted().setOption.at(-1)
        ).to.deep.equal(['toggle', true])
      })
      .get('[data-cy=control-toggle] .v-btn')
      .should('have.class', 'text-blue')

    // test action=callback
    expect(callbacks).to.have.length(0)
    cy
      .get('[data-cy=control-callback] .v-btn')
      // clicking the icon should fire the callback
      .click({ force: true })
      .then(() => {
        expect(callbacks).to.have.length(1)
      })

    // TODO: visual regression test
    // https://github.com/cylc/cylc-ui/issues/178
  })

  it('enables and disables if', () => {
    // mount the toolbar with a couple of controls
    mountToolbar([
      {
        title: 'Group 1',
        controls: [
          {
            title: 'Foo',
            icon: mdiCog,
            action: 'toggle',
            value: true,
            key: 'foo',
            enableIf: ['bar'],
            disableIf: ['baz']
          },
          {
            title: 'Bar',
            icon: mdiCog,
            action: 'toggle',
            value: true,
            key: 'bar'
          },
          {
            title: 'Baz',
            icon: mdiCog,
            action: 'toggle',
            value: false,
            key: 'baz'
          }
        ]
      }
    ])

    cy
      // foo should start enabled (bar=true, baz=false)
      .get('[data-cy=control-foo] .v-btn')
      .not('.v-btn--disabled')

      // toggle bar
      .get('[data-cy=control-bar] .v-btn')
      .click({ force: true })

      // foo should be disabled (bar=false, baz=false)
      .get('[data-cy=control-foo] .v-btn')
      .should('have.class', 'v-btn--disabled')

      // toggle bar & baz
      .get('[data-cy=control-bar] .v-btn')
      .click({ force: true })
      .get('[data-cy=control-baz] .v-btn')
      .click({ force: true })

      // foo should be disabled (bar=true, baz=true)
      .get('[data-cy=control-foo] .v-btn')
      .should('have.class', 'v-btn--disabled')

      // toggle baz
      .get('[data-cy=control-baz] .v-btn')
      .click({ force: true })

      // foo should be enabled (bar=true, baz=false)
      .get('[data-cy=control-foo] .v-btn')
      .not('.v-btn--disabled')
  })

  it('groups', () => {
    mountToolbar([
      {
        title: 'Group 1',
        controls: [
          {
            title: 'Foo',
            icon: mdiCog,
            action: 'toggle',
            value: true,
            key: 'foo'
          },
          {
            title: 'Bar',
            icon: mdiCog,
            action: 'toggle',
            value: false,
            key: 'bar'
          }
        ]
      },
      {
        title: 'Group 2',
        controls: [
          {
            title: 'Baz',
            icon: mdiCog,
            action: 'toggle',
            value: true,
            key: 'baz'
          },
          {
            title: 'Pub',
            icon: mdiCog,
            action: 'toggle',
            value: false,
            key: 'pub'
          }
        ]
      }
    ])
    // TODO: visual regression test
    // https://github.com/cylc/cylc-ui/issues/178
  })
})
