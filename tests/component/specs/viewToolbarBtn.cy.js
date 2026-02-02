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
} from '@mdi/js'
import ViewToolbarBtn from '@/components/cylc/viewToolbar/ViewToolbarBtn.vue'

describe('View Toolbar Button Component', () => {
  const mountFunc = (props) => {
    cy.vmount(
      ViewToolbarBtn,
      { props }
    ).then((m) => m.wrapper).as('wrapper')
    // add the classes Vuetify requires
    cy.addVuetifyStyles(cy)
  }

  it('can act as a normal button', () => {
    const onClick = cy.spy().as('onClickSpy')
    mountFunc({
      icon: mdiGestureTap,
      onClick,
    })
    cy.get('button')
      .should('be.visible')
      .should('not.have.attr', 'role', 'switch')
      .should('not.have.class', 'text-blue')
      .click()
    cy.get('@onClickSpy').should('have.been.calledOnce')
    cy.get('button')
      .should('not.have.class', 'text-blue')
    cy.get('@wrapper').then((wrapper) => {
      expect(wrapper.vm.active).to.be.false
      wrapper.setProps({ active: true })
    })
    cy.get('button')
      .should('have.class', 'text-blue')
  })

  it('can act as a toggle', () => {
    let wrapper
    mountFunc({
      icon: mdiCog,
      // v-model:active.toggle="myVar" (bit clunky to express here):
      active: false,
      activeModifiers: { toggle: true },
      'onUpdate:active': (val) => {
        wrapper.setProps({ active: val })
      }
    })
    cy.get('@wrapper').then((_wrapper) => {
      wrapper = _wrapper
    })
    cy.get('button')
      .should('have.attr', 'role', 'switch')
      .should('not.have.class', 'text-blue')
      .should('have.attr', 'aria-checked', 'false')
    cy.get('button').click()
      .should('have.class', 'text-blue')
      .should('have.attr', 'aria-checked', 'true')
      .then(() => {
        expect(wrapper.vm.active).to.be.true
      })
  })

  it('can use a different icon and color when active', () => {
    mountFunc({
      icon: mdiGestureTap,
      activeIcon: mdiCog,
      activeColor: 'red',
    })
    cy.get('button svg path')
      .should('have.attr', 'd', mdiGestureTap)
      .should('not.have.class', 'text-red')
    cy.get('@wrapper').then((wrapper) => {
      wrapper.setProps({ active: true })
    })
    cy.get('button svg path')
      .should('have.attr', 'd', mdiCog)
    cy.get('button')
      .should('have.class', 'text-red')
  })

  // TODO: visual regression test
  // https://github.com/cylc/cylc-ui/issues/178
})
