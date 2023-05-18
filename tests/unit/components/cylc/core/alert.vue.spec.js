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
import { createVuetify } from 'vuetify'
import storeOptions from '@/store/options'
import Alert from '@/components/core/Alert.vue'

describe('Alert', () => {
  const store = createStore(storeOptions)
  /**
   * @param options
   * @returns {Wrapper<Alert>}
   */
  const mountFunction = () => {
    const vuetify = createVuetify()
    return mount(Alert, {
      global: {
        plugins: [vuetify, store]
      }
    })
  }
  it('should have the colors data', () => {
    const wrapper = mountFunction()
    expect(wrapper.colors).to.not.equal(null)
  })
  it('should retrieve colors correctly', () => {
    const wrapper = mountFunction()
    expect(wrapper.vm.getColor('error')).to.equal('red')
  })
  it('should return empty if color is not available', () => {
    const wrapper = mountFunction()
    expect(wrapper.vm.getColor('unavailable-color')).to.equal('')
  })
})
