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

import { mount, createLocalVue } from '@vue/test-utils'
import { expect } from 'chai'
import Toolbar from '@/components/cylc/Toolbar'
import { createVuetify } from 'vuetify'
import WorkflowState from '@/model/WorkflowState.model'
import Vuex from 'vuex'
import Vue from 'vue'

const localVue = createLocalVue()

Vue.use(Vuex)

describe('Toolbar component', () => {
  let vuetify
  let $route
  // for some obscene reason, using the actual "options.js" store, gets contaminated data from other tests during the course of the whole test running
  // by mocking the entire store, we can decide exactly what data we want to be available within each test, without fear it will be overwritten or tainted with
  // by other tests
  const store = new Vuex.Store({
    modules: {
      app: {
        namespaced: true,
        state: {
          drawer: null
        }
      },
      workflows: {
        namespaced: true,
        state: {
          workflow: {
            tree: {},
            lookup: {}
          },
          workflowName: null,
          workflows: {}
        }
      }
    }
  })
  const mountFunction = options => {
    return mount(Toolbar, {
      localVue,
      vuetify,
      store,
      mocks: {
        $route,
        $vuetify: {
          application: {
            register: () => {}
          }
        },
        $t: () => {} // vue-i18n,
      },
      ...options
    })
  }
  beforeEach(() => {
    vuetify = createVuetify({
      theme: { disable: true },
      icons: {
        iconfont: 'mdi'
      }
    })
    $route = {
      name: 'testRoute'
    }
    store.state.workflows.workflows = [
      {
        id: 'user/id',
        name: 'test',
        status: WorkflowState.RUNNING.name
      }
    ]
    store.state.workflows.workflowName = 'test'
  })
  it('should mount the component', async () => {
    const wrapper = mountFunction()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$el).to.not.equal(null)
  })
  it('should hide and display drawer according to screen viewport size', async () => {
    const wrapper = mountFunction()
    await wrapper.vm.$nextTick()
    await wrapper.setData({
      responsive: false
    })
    expect(store.state.app.drawer).to.equal(null)
    // empty wrapper before responsive is set to true
    expect(wrapper.find('button.default').exists()).to.equal(false)
    // let's make it responsive, so that the burger menu is visible
    await wrapper.setData({
      responsive: true
    })
    expect(wrapper.find('button.default').exists()).to.equal(true)
  })
})
