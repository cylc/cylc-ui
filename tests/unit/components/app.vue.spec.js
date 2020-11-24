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
import store from '@/store/index'
import Vuetify from 'vuetify/lib'
import App from '@/App'
import Empty from '@/layouts/Empty'

const localVue = createLocalVue()

describe('App', () => {
  let vuetify
  let $route
  const mountFunction = options => {
    return mount(App, {
      localVue,
      vuetify,
      store,
      components: {
        'empty-layout': Empty
      },
      stubs: ['router-link', 'router-view'],
      mocks: {
        $route,
        $vuetify: {
          application: {
            register: () => {}
          },
          theme: {
            dark: false,
            isDark: function () {
              return this.dark
            }
          }
        },
        $t: () => {} // vue-i18n
      },
      ...options
    })
  }
  beforeEach(() => {
    $route = {
      name: 'app',
      meta: {
        layout: 'empty'
      }
    }
    vuetify = new Vuetify({
      theme: { disable: true },
      icons: {
        iconfont: 'mdi'
      }
    })
    global.localStorage = window.localStorage
  })
  it('should create the App with the correct base URL', () => {
    const wrapper = mountFunction({
      propsData: {
        baseUrl: 'home'
      }
    })
    expect(wrapper.props().baseUrl).to.equal('home')
  })
})
