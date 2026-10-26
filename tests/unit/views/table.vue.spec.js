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
import { createStore } from 'vuex'
import sinon from 'sinon'
import storeOptions from '@/store/options'
import Table, { getTaskRow } from '@/views/Table.vue'
import WorkflowService from '@/services/workflow.service'
import { nextTick, reactive } from 'vue'
import { cloneDeep } from 'lodash'
import { simpleTableTasks } from '@/../tests/unit/components/cylc/table/table.data'
import TaskState from '@/model/TaskState.model'
import { mockRoute } from '$tests/util'

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
  mockRoute({ params: { workflowName: 'one' } })
  let store, $workflowService
  beforeEach(() => {
    store = createStore(storeOptions)
    $workflowService = sinon.createStubInstance(WorkflowService)
  })

  it('computes tasks', async () => {
    const wrapper = mount(Table, {
      shallow: true,
      global: {
        plugins: [store],
        mocks: { $workflowService },
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

  it('creates cached rows with non-enumerable job getters', () => {
    const task = { id: '~u/w//1/a', children: [{ id: '~u/w//1/a/02' }, { id: '~u/w//1/a/01' }] }
    const row = getTaskRow(task)
    expect(getTaskRow(task)).toBe(row)
    expect(row.latestJob).toBe(task.children[0])
    expect(row.previousJob).toBe(task.children[1])
    // Vuetify spreads rows when sorting - the job getters must not be
    // enumerable, otherwise sorting would depend on every task's jobs
    expect(Object.keys(row)).toEqual(['task'])
  })

  it('does not rebuild the rows when a job is added', async () => {
    const wrapper = mount(Table, {
      shallow: true,
      global: {
        plugins: [store],
        mocks: { $workflowService },
      },
    })
    const reactiveWorkflows = reactive(cloneDeep(workflows))
    await wrapper.setData({ workflows: reactiveWorkflows })
    const rowsBefore = wrapper.vm.tasks
    expect(rowsBefore.length).to.equal(2)

    // add a new job to an existing task
    const failedTask = reactiveWorkflows[0].children[0].children[1]
    failedTask.children.unshift({ id: '~user/one//1/failed/2', children: [] })
    await nextTick()
    // the list of rows should not have been rebuilt...
    expect(wrapper.vm.tasks).toBe(rowsBefore)
    // ...but the row should reflect the new job
    expect(wrapper.vm.tasks[1]).toMatchObject({
      latestJob: { id: '~user/one//1/failed/2' },
      previousJob: { id: '~user/one//1/failed/1' },
    })

    // adding a task should rebuild the list, reusing the existing rows
    reactiveWorkflows[0].children[0].children.push({ id: '~user/one//1/new', children: [] })
    await nextTick()
    expect(wrapper.vm.tasks).not.toBe(rowsBefore)
    expect(wrapper.vm.tasks.length).to.equal(3)
    expect(wrapper.vm.tasks[0]).toBe(rowsBefore[0])
    expect(wrapper.vm.tasks[1]).toBe(rowsBefore[1])
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
