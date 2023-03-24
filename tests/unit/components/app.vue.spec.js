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
import App from '@/App.vue'
import Empty from '@/layouts/Empty.vue'
import storeOptions from '@/store/options'
import { createVuetify } from 'vuetify'

describe('App', () => {
  const store = createStore(storeOptions)
  let vuetify
  let $route

  const mountFunction = () => {
    return mount(App, {
      global: {
        plugins: [
          vuetify,
          store
        ],
        components: {
          'empty-layout': Empty
        },
        stubs: ['router-link', 'router-view'],
        mocks: {
          $route
        }
      }
    })
  }

  beforeEach(() => {
    $route = {
      name: 'app',
      meta: {
        layout: 'empty'
      }
    }
    vuetify = createVuetify()
    global.localStorage = window.localStorage
  })

  it('should create the App with the correct theme', () => {
    const wrapper = mountFunction()
    expect(wrapper.vm.jobTheme).to.equal('default')
    expect(wrapper.vm.jobThemeClass).to.equal('job_theme--default')
  })

  it('should create the App with the correct layout', () => {
    const wrapper = mountFunction()
    // default is empty, unless the route specifies another layout
    expect(wrapper.vm.layout).to.equal('empty-layout')
  })
})
