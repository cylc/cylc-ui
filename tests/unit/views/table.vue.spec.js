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
import { createStore } from 'vuex'
import sinon from 'sinon'
import storeOptions from '@/store/options'
import Table from '@/views/Table.vue'
import WorkflowService from '@/services/workflow.service'
import User from '@/model/User.model'
import { nextTick } from 'vue'
import { simpleTableTasks } from '@/../tests/unit/components/cylc/table/table.data'
import TaskState from '@/model/TaskState.model'

chai.config.truncateThreshold = 0

const workflows = [
  {
    id: '~user/one',
    children: [
      {
        id: '~user/one//1',
        children: [
          {
            id: '~user/one//1/eventually_succeeded',
            children: [
              {
                id: '~user/one//1/eventually_succeeded/3',
                children: [],
              },
              {
                id: '~user/one//1/eventually_succeeded/2',
                children: [],
              },
              {
                id: '~user/one//1/eventually_succeeded/1',
                children: [],
              },
            ],
          },
          {
            id: '~user/one//1/failed',
            children: [
              {
                id: '~user/one//1/failed/1',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
]

describe('Table view', () => {
  let store, $workflowService
  beforeEach(() => {
    store = createStore(storeOptions)
    const user = new User({ username: 'cylc', permissions: [], owner: 'owner' })
    store.commit('user/SET_USER', user)
    $workflowService = sinon.createStubInstance(WorkflowService)
  })

  it('computes tasks', async () => {
    const wrapper = mount(Table, {
      shallow: true,
      global: {
        plugins: [store],
        mocks: { $workflowService },
      },
      props: {
        workflowName: 'one',
      },
    })

    await wrapper.setData({ workflows })

    expect(wrapper.vm.tasks).toMatchObject([
      {
        task: { id: '~user/one//1/eventually_succeeded' },
        latestJob: { id: '~user/one//1/eventually_succeeded/3' },
        previousJob: { id: '~user/one//1/eventually_succeeded/2' },
      },
      {
        task: { id: '~user/one//1/failed' },
        latestJob: { id: '~user/one//1/failed/1' },
      },
    ])
  })

  describe('Filter', () => {
    let wrapper
    beforeEach(async () => {
      wrapper = mount(Table, {
        shallow: true,
        global: {
          plugins: [store],
          mocks: { $workflowService },
        },
        props: {
          workflowName: 'one',
        },
      })
      await wrapper.setData({ tasks: simpleTableTasks })
    })

    it('should not filter by ID or task state by default', () => {
      expect(wrapper.vm.filteredTasks.length).to.equal(3)
    })

    it('should filter by ID', async () => {
      // plain ID
      wrapper.vm.tasksFilter = {
        id: 'taskA',
      }
      await nextTick()
      expect(wrapper.vm.filteredTasks.length).to.equal(1)

      // glob ID
      wrapper.vm.tasksFilter = {
        id: 'task[A]',
      }
      await nextTick()
      expect(wrapper.vm.filteredTasks.length).to.equal(1)
    })

    it('should filter by task state', async () => {
      wrapper.vm.tasksFilter = {
        states: [
          TaskState.WAITING.name,
        ],
      }
      await nextTick()
      expect(wrapper.vm.filteredTasks.length).to.equal(1)
    })

    it('should filter by task name and state', async () => {
      wrapper.vm.tasksFilter = {
        id: 'taskA',
        states: [
          TaskState.WAITING.name,
        ],
      }
      await nextTick()
      expect(wrapper.vm.filteredTasks.length).to.equal(0)
    })
  })
})
