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

const $workflowService = sinon.createStubInstance(WorkflowService)
const vuetify = createVuetify(vuetifyOptions)

describe('Toolbar component', () => {
  let store
  const { drawer: drawerState } = useDrawer()

  beforeEach(() => {
    store = createStore(storeOptions)
    store.commit('user/SET_USER', { owner: 'rincewind', permissions: ['play', 'pause', 'resume', 'stop'] })
    drawerState.value = false
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

  it('does not show workflow controls without workflowName', async () => {
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
    // Burger button and title should still be present
    expect(wrapper.find('#toggle-drawer').exists()).to.equal(true)
    expect(wrapper.find('.c-toolbar-title').exists()).to.equal(true)
    // Workflow-specific controls should not be present
    expect(wrapper.find('#workflow-play-button').exists()).to.equal(false)
    expect(wrapper.find('#workflow-stop-button').exists()).to.equal(false)
    expect(wrapper.find('#workflow-mutate-button').exists()).to.equal(false)
    expect(wrapper.find('.c-workflow-controls').exists()).to.equal(false)
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

  it('shows user menu', async () => {
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
    await wrapper.find('.v-avatar').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.v-card').text()).to.include('rincewind')
    expect(wrapper.find('a[href="/user-profile"]').exists()).to.be.true
  })

  it('shows add view menu', async () => {
    const wrapper = mount(Toolbar, {
      global: {
        plugins: [store, vuetify, CommandMenuPlugin],
        mocks: {
          $workflowService,
          $route: { name: 'Workspace' }
        },
        provide: { versionInfo: null },
      },
      props: {
        views: new Map([['testView', { icon: 'mdi-help' }]]),
        workflowName: 'strewth',
      },
    })
    await wrapper.find('.add-view').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#toolbar-add-testView-view').exists()).to.be.true
  })

  it('shows workflow info tooltip', async () => {
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
    store.state.workflows.cylcTree = { $index: { 'strewth/strewth': { id: 'strewth/strewth', node: { owner: 'rincewind', host: 'localhost', cylcVersion: '8.0.0', runMode: 'live', status: 'running' } } } }
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#info-icon').exists()).to.be.true
  })

  it('interacts with workflow controls', async () => {
    $workflowService.mutate.resolves([{ status: 'SUCCEEDED' }])
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
    store.state.workflows.cylcTree = { $index: { 'strewth/strewth': { id: 'strewth/strewth', node: { status: 'stopped' } } } }
    await wrapper.vm.$nextTick()
    await wrapper.find('#workflow-play-button').trigger('click')
    expect($workflowService.mutate.calledWith('play')).to.be.true

    store.state.workflows.cylcTree = { $index: { 'strewth/strewth': { id: 'strewth/strewth', node: { status: 'running' } } } }
    await wrapper.vm.$nextTick()
    await wrapper.find('#workflow-play-pause-button').trigger('click')
    expect($workflowService.mutate.calledWith('pause')).to.be.true
    await wrapper.find('#workflow-stop-button').trigger('click')
    expect($workflowService.mutate.calledWith('stop')).to.be.true
  })
})
