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

import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import { expect } from 'chai'
import Toolbar from '@/components/cylc/Toolbar'
import TaskState from '@/model/TaskState.model'
import store from '@/store/index'
import Vuetify from 'vuetify/lib'

const mockedWorkflowService = {
  releaseWorkflow: function () {
    return new Promise((resolve) => {
      if (store.state.workflows.workflows[0].status === TaskState.HELD.name.toLowerCase()) {
        store.state.workflows.workflows[0].status = TaskState.RUNNING.name.toLowerCase()
      } else {
        store.state.workflows.workflows[0].status = TaskState.HELD.name.toLowerCase()
      }
      return resolve(true)
    })
  },
  holdWorkflow: function () {
    return new Promise((resolve) => {
      if (store.state.workflows.workflows[0].status === TaskState.HELD.name.toLowerCase()) {
        store.state.workflows.workflows[0].status = TaskState.RUNNING.name.toLowerCase()
      } else {
        store.state.workflows.workflows[0].status = TaskState.HELD.name.toLowerCase()
      }
      return resolve(true)
    })
  },
  stopWorkflow: function () {
    return new Promise((resolve) => {
      return resolve(true)
    })
  }
}

const localVue = createLocalVue()

describe('Toolbar component', () => {
  let vuetify
  let $route
  beforeEach(() => {
    vuetify = new Vuetify({
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
        status: TaskState.RUNNING.name.toLowerCase()
      }
    ]
    store.state.workflows.workflowName = 'test'
  })
  it('should initialize props', () => {
    const wrapper = shallowMount(Toolbar, {
      localVue,
      vuetify,
      store,
      mocks: {
        $route
      }
    })
    expect(wrapper.element.children[0].className).to.equal('c-toolbar')
  })
  it('should hide and display drawer according to screen viewport size', async () => {
    const wrapper = mount(Toolbar, {
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
      }
    })
    expect(store.state.app.drawer).to.equal(null)
    // empty wrapper before responsive is set to true
    expect(wrapper.find('button.default').exists()).to.equal(false)
    // let's make it responsive, so that the burger menu is visible
    wrapper.vm.$data.responsive = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button.default').exists()).to.equal(true)
    wrapper.find('button.default').trigger('click')
    expect(store.state.app.drawer).to.equal(true)
  })
  it('should stop the workflow', async () => {
    const wrapper = shallowMount(Toolbar, {
      store,
      mocks: {
        $route
      }
    })

    // mock service
    wrapper.vm.$workflowService = mockedWorkflowService

    const stopLink = wrapper.find('#workflow-stop-button')
    expect(wrapper.vm.$data.isStopped).to.equal(false)
    stopLink.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.isStopped).to.equal(true)
  })
  it('should stop/release the workflow', async () => {
    const wrapper = shallowMount(Toolbar, {
      store,
      mocks: {
        $route
      }
    })
    wrapper.vm.$data.responsive = true
    await wrapper.vm.$nextTick()

    // mock service
    wrapper.vm.$workflowService = mockedWorkflowService

    const toggleLink = wrapper.find('#workflow-release-hold-button')
    toggleLink.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isHeld).to.equal(true)
    toggleLink.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isHeld).to.equal(false)
  })
})
