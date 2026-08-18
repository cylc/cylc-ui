/**
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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
import { useDrawer, __drawer as drawerState } from '@/utils/toolbar'
import { vuetifyOptions } from '@/plugins/vuetify'
import { mockRoute } from '$tests/util'

describe('Toolbar/drawer utils', () => {
  beforeEach(() => {
    mockRoute()
    drawerState.value = false
  })

  describe('useDrawer()', () => {
    const vuetify = createVuetify(vuetifyOptions)
    const mountFunction = () => mount(
      {
        setup () {
          return useDrawer()
        },
        render () {}
      },
      {
        global: {
          plugins: [vuetify]
        }
      }
    )

    it('toggles the drawer', () => {
      const wrapper = mountFunction()
      const initialState = unref(drawerState)
      expect(wrapper.vm.drawer).toEqual(initialState)
      wrapper.vm.toggleDrawer()
      expect(drawerState.value).toEqual(!initialState)
      expect(wrapper.vm.drawer).toEqual(!initialState)
    })

    it.each([
      { route: {}, expected: true },
      { route: { meta: { showSidebar: false } }, expected: false },
    ])('enables/disables drawer based on route $route', ({ route, expected }) => {
      mockRoute(route)
      const wrapper = mountFunction()
      expect(wrapper.vm.drawerEnabled).toBe(expected)
    })
  })
})
