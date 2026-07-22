/**
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import storeOptions from '@/store/options'
import Toolbar from '@/components/cylc/Toolbar.vue'
import WorkflowState from '@/model/WorkflowState.model'

import CommandMenuPlugin from '@/components/cylc/commandMenu/plugin'
import sinon from 'sinon'
import WorkflowService from '@/services/workflow.service'
import { useDrawer } from '@/utils/toolbar'
import { vuetifyOptions } from '@/plugins/vuetify'
import { mdiViewList, mdiBackburger } from '@mdi/js'

const vuetify = createVuetify(vuetifyOptions)

describe('Toolbar component', () => {
  let store
  let $workflowService
  const { drawer: drawerState } = useDrawer()

  beforeEach(() => {
    store = createStore(storeOptions)
    store.commit('user/SET_USER', {
      owner: 'rincewind',
      permissions: ['play', 'pause', 'resume', 'stop', 'setGraphWindowExtent'],
      initials: 'RW',
      username: 'rincewind',
    })
    drawerState.value = false
    $workflowService = sinon.createStubInstance(WorkflowService)
    store.state.workflows.workflows = [
      {
        id: 'user/id',
        name: 'test',
        status: WorkflowState.RUNNING.name
      }
    ]
  })

  it('shows backburger icon when drawer is open and list icon when closed', async () => {
    const wrapper = mount(Toolbar, {
      global: {
        plugins: [store, vuetify, CommandMenuPlugin],
        mocks: { $workflowService },
        provide: { versionInfo: null },
      },
      props: {
        views: new Map(),
        workflowName: 'strewth',
      },
    })
    // Drawer closed -> list icon
    drawerState.value = false
    await wrapper.vm.$nextTick()
    const btn = wrapper.find('#toggle-drawer')
    expect(btn.find('svg path').attributes('d')).to.equal(mdiViewList)
    // Drawer open -> backburger icon
    drawerState.value = true
    await wrapper.vm.$nextTick()
    expect(btn.find('svg path').attributes('d')).to.equal(mdiBackburger)
  })

  it('toggles drawer on button click', async () => {
    const wrapper = mount(Toolbar, {
      global: {
        plugins: [store, vuetify, CommandMenuPlugin],
        mocks: { $workflowService },
        provide: { versionInfo: null },
      },
      props: {
        views: new Map(),
        workflowName: 'strewth',
      },
    })
    expect(drawerState.value).to.equal(false)
    await wrapper.find('#toggle-drawer').trigger('click')
    expect(drawerState.value).to.equal(true)
    await wrapper.find('#toggle-drawer').trigger('click')
    expect(drawerState.value).to.equal(false)
  })

  it('displays the title from the store', async () => {
    store.commit('app/setTitle', "I'm your pain when you can't feel")
    const wrapper = mount(Toolbar, {
      global: {
        plugins: [store, vuetify, CommandMenuPlugin],
        mocks: { $workflowService },
        provide: { versionInfo: null },
      },
      props: {
        views: new Map(),
      },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.c-toolbar-title').text()).to.include("I'm your pain when you can't feel")
  })
})
