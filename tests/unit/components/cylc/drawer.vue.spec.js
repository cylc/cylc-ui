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
import Drawer from '../../../../src/components/cylc/Drawer'

import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuex from 'vuex'
import { user } from '../../../../src/store/user.module'
import { app } from '../../../../src/store/app.module'

import sinon from 'sinon'

Vue.use(Vuex)
Vue.use(Vuetify)

let localVue
let vuetify
let wrapper

const sandbox = sinon.createSandbox()

describe('Drawer', () => {
  localVue = createLocalVue() // because of vuetify, we should use a localVue instance

  const store = new Vuex.Store({
    modules: {
      user,
      app
    }
  })
  store.commit('user/SET_USER', { username: 'testusername' })
  vuetify = new Vuetify()

  beforeEach(() => {
    wrapper = mount(Drawer, {
      localVue,
      vuetify,
      store,
      mocks: {
        $t: () => {}
      },
      stubs: {
        Header: true,
        GScan: true,
        RouterLink: true
      }
    })
  })

  const createBubbledEvent = (type, props = {}) => {
    const event = new Event(type, { bubbles: true })
    Object.assign(event, props)
    return event
  }

  it('should create the drawer', async () => {
    await wrapper.vm.$nextTick() // we have to wait until vue rerender the components content
    expect(wrapper.find('div.d-flex.flex-column.h-100').exists()).to.equal(true)
    const spyFunction = sandbox.spy(wrapper.vm, 'resize')

    wrapper.find('div.v-navigation-drawer__border').element.dispatchEvent(
      createBubbledEvent('mousedown', { offsetX: 1 })
    )

    document.dispatchEvent(
      createBubbledEvent('mousemove', { clientX: 100, clientY: 0, offsetX: 50 })
    )

    expect(spyFunction.called).to.equal(true)
  })

  afterEach(() => {
    sandbox.restore()
  })
})
