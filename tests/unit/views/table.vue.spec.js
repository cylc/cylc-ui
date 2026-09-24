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

import { nextTick, ref } from 'vue'
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import sinon from 'sinon'
import storeOptions from '@/store/options'
import Table from '@/views/Table.vue'
import { WorkflowService } from '@/services/workflow.service'
import { simpleTableWorkflows } from '@/../tests/unit/components/cylc/table/table.data'
import TaskState from '@/model/TaskState.model'
import { mockRoute } from '$tests/util'
import { merge } from 'lodash-es'
import * as wv from '@/mixins/graphql'
import CommandMenuPlugin from '@/components/cylc/commandMenu/plugin'

chai.config.truncateThreshold = 0

const fooJobs = [
  {
    id: '~user/one//1/foo/3',
    children: [],
  },
  {
    id: '~user/one//1/foo/2',
    children: [],
  },
  {
    id: '~user/one//1/foo/1',
    children: [],
  },
]
const barJobs = [
  {
    id: '~user/one//1/bar/1',
    children: [],
  },
]

const workflows = [
  {
    id: '~user/one',
    children: [
      {
        id: '~user/one//1',
        children: [
          {
            id: '~user/one//1/foo',
            children: fooJobs,
          },
          {
            id: '~user/one//1/bar',
            children: barJobs,
          },
        ],
      },
    ],
  },
]

describe('Table view', () => {
  mockRoute({ params: { workflowName: 'one' } })
  let store

  beforeEach(() => {
    store = createStore(storeOptions)
    store.commit('workflows/CREATE')
  })

  function mountFunc (options = {}) {
    return mount(Table, merge(
      {
        shallow: true,
        global: {
          plugins: [store, CommandMenuPlugin],
          mocks: {
            $workflowService: sinon.createStubInstance(WorkflowService),
          },
        },
      },
      options
    ))
  }

  it('computes tasks', async () => {
    vi.spyOn(wv, 'useWorkflowVariables').mockReturnValue({
      workflows: ref(workflows),
    })
    const wrapper = mountFunc()
    expect(wrapper.vm.filteredTasks).toEqual([
      {
        id: '~user/one//1/foo',
        children: fooJobs,
      },
      {
        id: '~user/one//1/bar',
        children: barJobs,
      },
    ])
  })

  describe('Filter', () => {
    let wrapper
    beforeEach(async () => {
      vi.spyOn(wv, 'useWorkflowVariables').mockReturnValue({
        workflows: ref(simpleTableWorkflows),
      })
      wrapper = mountFunc()
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
