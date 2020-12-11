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
import Toolbar from '@/components/cylc/workflow/Toolbar'
import WorkflowState from '@/model/WorkflowState.model'
import store from '@/store/index'
import Vuetify from 'vuetify/lib'

const localVue = createLocalVue()

describe('Workflow Toolbar component', () => {
  let vuetify
  let $route
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
        $t: () => {} // vue-i18n
      }
    })
  }
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
        status: WorkflowState.RUNNING.name
      }
    ]
    store.state.workflows.workflowName = 'test'
  })
  it('should mount the component', async () => {
    const wrapper = mountFunction()
    expect(wrapper.vm.$el).to.not.equal(null)
  })
  it('should stop the workflow', async () => {
    const wrapper = mountFunction()

    // mock service
    // wrapper.vm.$workflowService = mockedWorkflowService
    wrapper.vm.$workflowService = {
      mutate: () => {}
    }

    const stopLink = wrapper.find('#workflow-stop-button')
    expect(wrapper.vm.$data.isStopped).to.equal(false)
    stopLink.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.isStopped).to.equal(true)
  })
  // TODO: the workflow status is not updating correctly
  //       with hold/release changes
  // it('should stop/release the workflow', async () => {
  //   const wrapper = shallowMount(Toolbar, {
  //     store,
  //     mocks: {
  //       $route
  //     }
  //   })
  //   await wrapper.setData({
  //     responsive: true
  //   })

  //   // mock service
  //   // wrapper.vm.$workflowService = mockedWorkflowService
  //   wrapper.vm.$workflowService = {
  //     mutate: () => {}
  //   }

  //   const toggleLink = wrapper.find('#workflow-release-hold-button')
  //   toggleLink.trigger('click')
  //   await wrapper.vm.$nextTick()
  //   expect(wrapper.vm.isHeld).to.equal(true)
  //   toggleLink.trigger('click')
  //   await wrapper.vm.$nextTick()
  //   expect(wrapper.vm.isHeld).to.equal(false)
  // })
})
