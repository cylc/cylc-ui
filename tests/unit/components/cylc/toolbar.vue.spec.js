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
import Toolbar from '@/components/cylc/Toolbar.vue'
import WorkflowState from '@/model/WorkflowState.model'
import storeOptions from '@/store/options'

describe('Toolbar component', () => {
  const vuetify = createVuetify({
    display: {},
  })
  const $route = {
    name: 'testRoute',
  }
  let store
  let mountFunction

  beforeEach(() => {
    store = createStore(storeOptions)
    mountFunction = () => mount(Toolbar, {
      global: {
        plugins: [vuetify, store],
        mocks: { $route },
      },
    })

    store.state.workflows.workflows = [
      {
        id: 'user/id',
        name: 'test',
        status: WorkflowState.RUNNING.name,
      },
    ]
  })

  it('should mount the component', async () => {
    const wrapper = mountFunction()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$el).to.exist
  })
})
