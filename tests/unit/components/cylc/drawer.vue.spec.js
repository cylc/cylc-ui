/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { expect } from 'chai'
import { createLocalVue, mount } from '@vue/test-utils'
import Drawer from '@/components/cylc/Drawer'

import Vue from 'vue'
import Vuetify, { createVuetify } from 'vuetify'
import Vuex from 'vuex'

import sinon from 'sinon'

Vue.use(Vuex)

let vuetify
let wrapper

const mountFunction = options => {
  const localVue = createLocalVue()
  localVue.prototype.$workflowService = {
    register () {},
    unregister () {},
    subscribe () {},
    startSubscriptions () {},
    introspection: Promise.resolve({
      mutations: [
        { args: [] }
      ],
      types: []
    })
  }

  // note these are truly 'mocked' because I ran into issues with the state being tainted across multiple unit-tests
  const store = new Vuex.Store({
    modules: {
      app: {
        namespaced: true,
        state: {
          drawer: {}
        },
        mutations: {
          setDrawer (state, drawer) {
            state.drawer = drawer
          }
        }
      },
      user: {
        namespaced: true,
        state: {
          user: {
            username: 'test username'
          }
        },
        mutations: {
          SET_USER (state, user) {
            state.user = user
          }
        }
      }
    }
  })

  vuetify = createVuetify()
  Vue.use(vuetify)

  return mount(Drawer, {
    localVue,
    vuetify,
    store,
    mocks: {
      $t: () => {
      }
    },
    stubs: {
      Header: true,
      GScan: true,
      RouterLink: true
    },
    ...options
  })
}

describe('Drawer', () => {
  it('should create the drawer and successfully trigger a resize', async () => {
    const createBubbledEvent = (type, props = {}) => {
      const event = new Event(type, { bubbles: true })
      Object.assign(event, props)
      return event
    }
    const sandbox = sinon.createSandbox()
    wrapper = mountFunction()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('div.d-flex.flex-column.h-100').exists()).to.equal(true)
    const spyFunction = sandbox.spy(wrapper.vm, 'resize')

    wrapper.find('div.v-navigation-drawer__border').element.dispatchEvent(
      createBubbledEvent('mousedown', { offsetX: 1 })
    )

    document.dispatchEvent(
      createBubbledEvent('mousemove', { clientX: 100, clientY: 0, offsetX: 50 })
    )

    document.dispatchEvent(
      createBubbledEvent('mouseup', { clientX: 100, clientY: 0, offsetX: 0 })
    )

    expect(spyFunction.called).to.equal(true)
  })
})
