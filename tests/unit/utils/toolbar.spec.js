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

import { unref } from 'vue'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { useDrawer, useNavBtn } from '@/utils/toolbar'

/**
 * Create a vuetify instance in mobile mode or not.
 * Mobile mode is when viewport is narrower than the mobile breakpoint.
 *
 * @param {boolean} mobile
 */
const vuetify = (mobile) => createVuetify({
  display: {
    mobileBreakpoint: mobile ? 10e3 : 0,
  },
})

describe('Toolbar/drawer utils', () => {
  const { drawer: drawerState } = useDrawer()

  beforeEach(() => {
    drawerState.value = false
  })

  describe('useNavBtn()', () => {
    it.each([
      { mobile: true, drawer: true, expected: true },
      { mobile: true, drawer: false, expected: true },
      { mobile: false, drawer: true, expected: false },
      { mobile: false, drawer: false, expected: true },
    ])('{mobile: $mobile, drawer: $drawer} -> $expected', ({ mobile, drawer, expected }) => {
      const wrapper = mount(
        {
          setup () {
            const { showNavBtn } = useNavBtn()
            return { showNavBtn }
          },
          render () {},
        },
        {
          global: {
            plugins: [vuetify(mobile)],
          },
        }
      )
      drawerState.value = drawer
      expect(wrapper.vm.showNavBtn).to.equal(expected)
    })
  })

  describe('useDrawer()', () => {
    const mountFunction = (vuetify) => mount(
      {
        setup () {
          const { drawer, toggleDrawer } = useDrawer()
          return { drawer, toggleDrawer }
        },
        render () {},
      },
      {
        global: {
          plugins: [vuetify],
        },
      }
    )

    it('toggles the drawer', () => {
      const wrapper = mountFunction(createVuetify())
      const initialState = unref(drawerState)
      expect(wrapper.vm.drawer).toEqual(initialState)
      wrapper.vm.toggleDrawer()
      expect(drawerState.value).toEqual(!initialState)
      expect(wrapper.vm.drawer).toEqual(!initialState)
    })
  })
})
