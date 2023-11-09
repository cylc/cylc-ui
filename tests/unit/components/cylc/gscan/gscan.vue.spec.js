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
import { createVuetify } from 'vuetify'
import storeOptions from '@/store/options'
import GScan from '@/components/cylc/gscan/GScan.vue'
import CylcObjectPlugin from '@/components/cylc/cylcObject/plugin'
import {
  WorkflowState,
  WorkflowStateOrder
} from '@/model/WorkflowState.model'
import TaskState from '@/model/TaskState.model'
import {
  getWorkflowTreeSortValue,
  sortedWorkflowTree
} from '@/components/cylc/gscan/sort.js'

import {
  TEST_TREE,
  listTree
} from './utils'

const vuetify = createVuetify()

describe('GScan component', () => {
  const store = createStore(storeOptions)
  const resetState = () => {
    store.commit('workflows/SET_WORKFLOW_NAME', null)
  }
  beforeEach(resetState)

  describe('Sorting', () => {
    it('sets workflow sort order by status', () => {
      // for each worflow state ...
      for (const workflowState of WorkflowState) {
        // ... except ERROR
        if (workflowState === WorkflowState.ERROR) { continue }

        // it should associate a workflow with the correct sort order
        expect(
          getWorkflowTreeSortValue({
            type: 'workflow',
            node: { status: workflowState.name },
            children: []
          })
        ).to.equal(WorkflowStateOrder.get(workflowState.name))

        // it should associate a nested workflow with the correct sort order
        expect(
          getWorkflowTreeSortValue({
            type: 'workflow-part',
            node: {},
            children: [
              {
                type: 'workflow',
                node: { status: workflowState.name },
                children: []
              },
              {
                // a workflow with no state shouldn't mess with the sort order
                type: 'workflow',
                node: { status: undefined },
                children: []
              }
            ]
          })
        ).to.equal(WorkflowStateOrder.get(workflowState.name))
      }
    })

    it('sorts workflows', () => {
      // it should sort by status then name
      expect(
        listTree(sortedWorkflowTree(TEST_TREE))
      ).to.deep.equal([
        '~u/b', '~u/c', '~u/a/x1', '~u/a/x2'
      ])
    })
  })

  describe('Filters', () => {
    const mountFunction = (options) => mount(GScan, {
      global: {
        plugins: [vuetify, CylcObjectPlugin],
      },
      props: {
        workflowTree: TEST_TREE,
        isLoading: false,
      },
      ...options
    })

    it("shouldn't filter out workflows incorrectly", () => {
      const wrapper = mountFunction()
      // filter for all workflow states
      wrapper.vm.filters['workflow state'] = WorkflowStateOrder.keys()
      expect(
        listTree(wrapper.vm.$refs.tree.rootChildren, true)
      ).to.deep.equal(['~u/b', '~u/c', '~u/a/x1', '~u/a/x2'])
    })

    it('filters by workflow state', () => {
      const wrapper = mountFunction()
      wrapper.vm.filters['workflow state'] = [WorkflowState.RUNNING.name]
      expect(
        listTree(wrapper.vm.$refs.tree.rootChildren, true)
      ).to.deep.equal(['~u/c'])
      wrapper.vm.filters['workflow state'] = [WorkflowState.STOPPING.name]
      expect(
        listTree(wrapper.vm.$refs.tree.rootChildren, true)
      ).to.deep.equal(['~u/b'])
      wrapper.vm.filters['workflow state'] = [WorkflowState.STOPPED.name]
      expect(
        listTree(wrapper.vm.$refs.tree.rootChildren, true)
      ).to.deep.equal(['~u/a/x1', '~u/a/x2'])
    })

    it('filters by workflow name', () => {
      const wrapper = mountFunction()
      wrapper.vm.searchWorkflows = 'x'
      expect(
        listTree(wrapper.vm.$refs.tree.rootChildren, true)
      ).to.deep.equal(['~u/a/x1', '~u/a/x2'])
      wrapper.vm.searchWorkflows = 'u'
      expect(
        listTree(wrapper.vm.$refs.tree.rootChildren, true)
      ).to.deep.equal([])
    })

    it('filters by workflow state totals', () => {
      const wrapper = mountFunction()
      wrapper.vm.filters['workflow state'] = WorkflowStateOrder.keys()
      wrapper.vm.filters['task state'] = [TaskState.RUNNING.name]
      expect(
        listTree(wrapper.vm.$refs.tree.rootChildren, true)
      ).to.deep.equal(['~u/b'])
      wrapper.vm.filters['task state'] = [TaskState.SUBMITTED.name]
      expect(
        listTree(wrapper.vm.$refs.tree.rootChildren, true)
      ).to.deep.equal(['~u/c'])
    })
  })
})
