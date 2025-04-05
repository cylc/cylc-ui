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
import GScan from '@/components/cylc/gscan/GScan.vue'
import CommandMenuPlugin from '@/components/cylc/commandMenu/plugin'
import {
  WorkflowState,
  WorkflowStateOrder,
} from '@/model/WorkflowState.model'
import TaskState from '@/model/TaskState.model'
import {
  getWorkflowTreeSortValue,
  sortedWorkflowTree,
} from '@/components/cylc/gscan/sort.js'

import {
  TEST_TREE,
  listTree,
} from './utils'
import { getIDMap } from '$tests/util'

const vuetify = createVuetify()

/**
 * Helper function to run filtering.
 */
function filterNodes (wrapper, filteredOutNodesCache) {
  for (const node of wrapper.vm.workflows) {
    wrapper.vm.filterNode(node, filteredOutNodesCache)
  }
}

describe('GScan component', () => {
  describe('Sorting', () => {
    it('sets workflow sort order by status', () => {
      // for each worflow state ...
      for (const workflowState of WorkflowState) {
        // it should associate a workflow with the correct sort order
        expect(
          getWorkflowTreeSortValue({
            type: 'workflow',
            node: { status: workflowState.name },
            children: [],
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
                children: [],
              },
              {
                // a workflow with no state shouldn't mess with the sort order
                type: 'workflow',
                node: { status: undefined },
                children: [],
              },
            ],
          })
        ).to.equal(WorkflowStateOrder.get(workflowState.name))
      }
    })

    it('sorts workflows', () => {
      // it should sort by status then name
      expect(
        listTree(sortedWorkflowTree(TEST_TREE))
      ).to.deep.equal([
        '~u/b', '~u/c', '~u/a/x1', '~u/a/x2',
      ])
    })
  })

  describe('Filters', () => {
    const mountFunction = (options) => mount(GScan, {
      global: {
        plugins: [vuetify, CommandMenuPlugin],
      },
      props: {
        workflowTree: TEST_TREE,
        isLoading: false,
      },
      ...options,
    })

    it('has null filterState when filters are empty', async () => {
      const wrapper = mountFunction()
      expect(wrapper.vm.searchWorkflows).toEqual('')
      expect(wrapper.vm.filters).toEqual({
        'workflow state': [],
        'task state': [],
      })
      await wrapper.setData({
        searchWorkflows: '  ',
        filters: {
          'workflow state': [],
          'task state': [],
        },
      })
      expect(wrapper.vm.filterState).toBeNull()
    })

    it("shouldn't filter out workflows incorrectly", async () => {
      const wrapper = mountFunction()
      const filteredOutNodesCache = new Map()
      // filter for all workflow states
      await wrapper.setData({
        filters: { 'workflow state': WorkflowStateOrder.keys() },
      })
      filterNodes(wrapper, filteredOutNodesCache)
      expect(getIDMap(filteredOutNodesCache)).toEqual({
        '~u/a': false,
        '~u/a/x1': false,
        '~u/a/x2': false,
        '~u/b': false,
        '~u/c': false,
      })
    })

    it('filters by workflow state', async () => {
      const wrapper = mountFunction()
      const filteredOutNodesCache = new Map()

      await wrapper.setData({
        filters: { 'workflow state': [WorkflowState.RUNNING.name] },
      })
      filterNodes(wrapper, filteredOutNodesCache)
      expect(getIDMap(filteredOutNodesCache)).toEqual({
        '~u/a': true,
        '~u/a/x1': true,
        '~u/a/x2': true,
        '~u/b': true,
        '~u/c': false,
      })

      await wrapper.setData({
        filters: {
          'workflow state': [
            WorkflowState.STOPPING.name,
            WorkflowState.STOPPED.name,
          ],
        },
      })
      filterNodes(wrapper, filteredOutNodesCache)
      expect(getIDMap(filteredOutNodesCache)).toEqual({
        '~u/a': false,
        '~u/a/x1': false,
        '~u/a/x2': false,
        '~u/b': false,
        '~u/c': true,
      })
    })

    it('filters by workflow name', async () => {
      const wrapper = mountFunction()
      const filteredOutNodesCache = new Map()

      await wrapper.setData({ searchWorkflows: 'x' })
      filterNodes(wrapper, filteredOutNodesCache)
      expect(getIDMap(filteredOutNodesCache)).toEqual({
        '~u/a': false,
        '~u/a/x1': false,
        '~u/a/x2': false,
        '~u/b': true,
        '~u/c': true,
      })

      await wrapper.setData({ searchWorkflows: 'u' })
      filterNodes(wrapper, filteredOutNodesCache)
      expect(getIDMap(filteredOutNodesCache)).toEqual({
        '~u/a': true,
        '~u/a/x1': true,
        '~u/a/x2': true,
        '~u/b': true,
        '~u/c': true,
      })
    })

    it('filters by task state', async () => {
      const wrapper = mountFunction()
      const filteredOutNodesCache = new Map()

      await wrapper.setData({
        filters: { 'task state': [TaskState.RUNNING.name] },
      })
      filterNodes(wrapper, filteredOutNodesCache)
      expect(getIDMap(filteredOutNodesCache)).toEqual({
        '~u/a': true,
        '~u/a/x1': true,
        '~u/a/x2': true,
        '~u/b': false,
        '~u/c': true,
      })

      await wrapper.setData({
        filters: { 'task state': [TaskState.SUBMITTED.name] },
      })
      filterNodes(wrapper, filteredOutNodesCache)
      expect(getIDMap(filteredOutNodesCache)).toEqual({
        '~u/a': true,
        '~u/a/x1': true,
        '~u/a/x2': true,
        '~u/b': true,
        '~u/c': false,
      })
    })

    it('filters by workflow name & workflow state & task state', async () => {
      const wrapper = mountFunction()
      const filteredOutNodesCache = new Map()

      await wrapper.setData({
        searchWorkflows: 'a',
        filters: {
          'workflow state': [WorkflowState.STOPPED.name],
          'task state': [TaskState.SUBMIT_FAILED.name],
        },
      })
      filterNodes(wrapper, filteredOutNodesCache)
      expect(getIDMap(filteredOutNodesCache)).toEqual({
        '~u/a': false,
        '~u/a/x1': false,
        '~u/a/x2': true,
        '~u/b': true,
        '~u/c': true,
      })
    })
  })
})
