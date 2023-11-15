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
import App from '@/App.vue'
import Empty from '@/layouts/Empty.vue'
import storeOptions from '@/store/options'
import { vuetifyOptions } from '@/plugins/vuetify'

describe('App', () => {
  const mountFunction = () => {
    return mount(App, {
      global: {
        plugins: [
          createVuetify(vuetifyOptions),
          createStore(storeOptions),
        ],
        components: {
          'empty-layout': Empty
        },
        stubs: ['router-view'],
        mocks: {
          $route: {
            name: 'app',
            meta: {
              layout: 'empty'
            }
          }
        }
      }
    })
  }

  it('should create the App with the correct theme', () => {
    const wrapper = mountFunction()
    expect(wrapper.vm.jobThemeClass).to.equal('job_theme--default')
  })

  it('should create the App with the correct layout', () => {
    const wrapper = mountFunction()
    // default is empty, unless the route specifies another layout
    expect(wrapper.vm.layout).to.equal('empty-layout')
  })

  it.each([
    { value: true, expected: { vuetify: false } },
    { value: false, expected: { vuetify: null } },
  ])('applies reduced animation = $value from localStorage', ({ value, expected }) => {
    localStorage.setItem('reducedAnimation', value)
    const wrapper = mountFunction()
    expect(wrapper.vm.$vuetify.defaults.global.transition).to.equal(expected.vuetify)
  })
})
