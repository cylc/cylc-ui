/*
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

import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { mount } from '@vue/test-utils'
import storeOptions from '@/store/options'
import Toolbar from '@/components/cylc/workspace/Toolbar.vue'
import CommandMenuPlugin from '@/components/cylc/commandMenu/plugin'
import sinon from 'sinon'
import WorkflowService from '@/services/workflow.service'
import { useDrawer } from '@/utils/toolbar'

const $workflowService = sinon.createStubInstance(WorkflowService)

describe('Workspace toolbar component', () => {
  let store
  const { drawer: drawerState } = useDrawer()

  beforeEach(() => {
    store = createStore(storeOptions)
    store.commit('user/SET_USER', { owner: 'rincewind' })
    drawerState.value = false
  })

  it('hides/shows nav button according to viewport size & whether drawer is collapsed', async () => {
    // TODO: actually just show nav btn at all times?
    const wrapper = mount(Toolbar, {
      global: {
        plugins: [store, createVuetify(), CommandMenuPlugin],
        mocks: { $workflowService },
      },
      props: {
        views: new Map(),
        workflowName: 'strewth',
      },
    })
    // Btn should show when drawer is collapsed
    wrapper.vm.$vuetify.display.mobile = false
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#toggle-drawer').exists()).to.equal(true)
    // Btn should not show when drawer is visible on large viewport
    drawerState.value = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#toggle-drawer').exists()).to.equal(false)
    // Btn should show when drawer is visible on small viewport
    wrapper.vm.$vuetify.display.mobile = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#toggle-drawer').exists()).to.equal(true)
  })
})
