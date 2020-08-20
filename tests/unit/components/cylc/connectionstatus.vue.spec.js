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

import { createLocalVue, mount } from '@vue/test-utils'
import { expect } from 'chai'
import ConnectionStatus from '@/components/cylc/ConnectionStatus'
import Vuetify from 'vuetify/lib'
import Vue from 'vue'

// global as per Vuetify docs https://vuetifyjs.com/en/getting-started/unit-testing/#bootstrapping-vuetify
Vue.use(Vuetify)
// but also create the local vue as per Vuetify docs-example https://vuetifyjs.com/en/getting-started/unit-testing/#spec-tests
const localVue = createLocalVue()

describe('ConnectionStatus component', () => {
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify()
  })
  // args: isOffline
  const tests = [
    {
      args: [false], expected: false
    },
    {
      args: [true], expected: true
    }
  ]
  tests.forEach(test => {
    it('correctly hides or displays the connection status alert', () => {
      const wrapper = mount(ConnectionStatus, {
        localVue,
        vuetify,
        propsData: {
          isOffline: test.args[0]
        }
      })
      expect(wrapper.props().isOffline).to.equal(test.args[0], `Wrong props value, expected ${test.args[0]}`)
      const isVisible = wrapper.find('.v-snack__content').isVisible()
      expect(isVisible).to.equal(test.expected, `Incorrect component visibility: ${isVisible}`)
    })
  })
})
