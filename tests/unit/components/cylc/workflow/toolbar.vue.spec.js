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
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify/lib'
import Toolbar from '@/components/cylc/workflow/Toolbar'
import storeOptions from '@/store/options'
import WorkflowState from '@/model/WorkflowState.model'

const localVue = createLocalVue()

Vue.use(Vuetify)
Vue.use(Vuex)

describe('Workflow component', () => {
  let $route
  const store = new Vuex.Store(storeOptions)
  let vuetify
  const mountFunction = options => {
    return mount(Toolbar, {
      localVue,
      vuetify,
      store,
      mocks: {
        $route,
        $t: () => {} // vue-i18n
      },
      ...options
    })
  }
  const resetState = () => {
    store.commit('app/setTitle', 'test workflow toolbar')
    store.commit('workflows/SET_WORKFLOW_NAME', null)
    store.commit('workflows/SET_WORKFLOWS', null)
  }
  beforeEach(() => {
    vuetify = new Vuetify({
      theme: { disable: true },
      icons: {
        iconfont: 'mdi'
      }
    })
    $route = {
      name: 'workflow',
      meta: {
        layout: 'default'
      }
    }
    resetState()
  })
  afterEach(resetState)
  describe('workflow/toolbar', () => {
    it('should compute the right workflow status', () => {
      const tests = [
        {
          status: WorkflowState.INSTALLED.name,
          expected: {
            isInstalled: true,
            isPaused: false,
            isStopped: false
          }
        },
        {
          status: WorkflowState.PAUSED.name,
          expected: {
            isInstalled: false,
            isPaused: true,
            isStopped: false
          }
        },
        {
          status: WorkflowState.STOPPED.name,
          expected: {
            isInstalled: false,
            isPaused: false,
            isStopped: true
          }
        },
        {
          status: WorkflowState.RUNNING.name,
          expected: {
            isInstalled: false,
            isPaused: false,
            isStopped: false
          }
        }
      ]
      for (const test of tests) {
        store.commit('workflows/SET_WORKFLOW_NAME', 'a')
        store.commit('workflows/SET_WORKFLOWS', {
          a: {
            name: 'a',
            status: test.status
          }
        })
        const wrapper = mountFunction({
          propsData: {
            views: []
          }
        })
        for (const key of Object.keys(test.expected)) {
          expect(wrapper.vm[key]).to.equal(test.expected[key])
        }
      }
    })
    it('should have pause/stop disabled for an installed workflow', () => {
      store.commit('workflows/SET_WORKFLOW_NAME', 'b')
      store.commit('workflows/SET_WORKFLOWS', {
        a: {
          name: 'a',
          status: WorkflowState.INSTALLED.name
        },
        b: {
          name: 'b',
          status: WorkflowState.INSTALLED.name
        }
      })
      const wrapper = mountFunction({
        propsData: {
          views: []
        }
      })
      expect(wrapper.vm.enabled.pauseToggle).to.equal(false)
      expect(wrapper.vm.enabled.stopToggle).to.equal(false)
    })
  })
})
