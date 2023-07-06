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

import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { createVuetify, useDisplay } from 'vuetify'
import { useNavBtn, useToolbar } from '@/utils/toolbar'
import storeOptions from '@/store/options'

describe('Toolbar utils', () => {
  let store

  beforeEach(() => {
    store = createStore(storeOptions)
  })

  describe('useNavBtn()', () => {
    it.each([
      { mobile: true, drawer: true, expected: true },
      { mobile: true, drawer: false, expected: true },
      { mobile: false, drawer: true, expected: false },
      { mobile: false, drawer: false, expected: true },
    ])('returns whether to show nav button %o', ({ mobile, drawer, expected }) => {
      const wrapper = mount(
        {
          setup () {
            const { mobile: displayMobile } = useDisplay()
            displayMobile.value = mobile
            const { showNavBtn } = useNavBtn()
            return { showNavBtn }
          },
          render () {},
        },
        {
          global: {
            plugins: [store, createVuetify()]
          },
        }
      )
      store.commit('app/setDrawer', drawer)
      expect(wrapper.vm.showNavBtn).to.equal(expected)
    })
  })

  describe('useToolbar()', () => {
    const mountFunction = (vuetify) => mount(
      {
        setup () {
          const { toggleDrawer } = useToolbar()
          return { toggleDrawer }
        },
        render () {}
      },
      {
        global: {
          plugins: [store, vuetify]
        }
      }
    )

    it('sets drawer on mount', () => {
      const vuetify = createVuetify({
        display: {
          mobileBreakpoint: 10e3, // bigger than test viewport -> mobile = true
        }
      })
      store.commit('app/setDrawer', true)
      const wrapper = mountFunction(vuetify)
      expect(wrapper.vm.$vuetify.display.mobile).to.be.true
      expect(store.state.app.drawer).to.be.false
    })

    it('toggles the drawer', () => {
      const wrapper = mountFunction(createVuetify())
      const initialState = store.state.app.drawer
      wrapper.vm.toggleDrawer()
      expect(store.state.app.drawer).to.equal(!initialState)
    })
  })
})
