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

import { createStore } from 'vuex'
import storeOptions from '@/store/options'
import {
  WorkflowState,
  WorkflowStateOrder
} from '@/model/WorkflowState.model'
import TaskState from '@/model/TaskState.model'
import GScan from '@/components/cylc/gscan/GScan.vue'
import {
  getWorkflowTreeSortValue,
  sortedWorkflowTree
} from '@/components/cylc/gscan/sort.js'
import {
  filterHierarchically
} from '@/components/cylc/gscan/filters'

import {
  TEST_TREE,
  listTree
} from './utils'

describe('GScan component', () => {
  const store = createStore(storeOptions)
  const resetState = () => {
    store.commit('workflows/SET_WORKFLOW_NAME', null)
  }
  beforeEach(resetState)

  describe('Sorting', () => {
    it('should set workflow sort order by status', () => {
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
    it('should sort workflows', () => {
      // it should sort by status then name
      expect(
        listTree(sortedWorkflowTree(TEST_TREE))
      ).to.deep.equal([
        '~u/b', '~u/c', '~u/a/x1', '~u/a/x2'
      ])
    })
  })

  describe('Filters', () => {
    it("shouldn't filter out workflows incorrectly", () => {
      expect(
        listTree(
          filterHierarchically(
            sortedWorkflowTree(TEST_TREE),
            // don't filter by name
            null,
            // filter for all workflow states
            [...WorkflowStateOrder.keys()],
            // filter for all task states
            []
          )
        )
      ).to.deep.equal(['~u/b', '~u/c', '~u/a/x1', '~u/a/x2'])
    })
    it('should filter by workflow state', () => {
      expect(
        listTree(
          filterHierarchically(
            sortedWorkflowTree(TEST_TREE),
            // don't filter by name
            null,
            [WorkflowState.RUNNING.name],
            // filter for all task states
            []
          )
        )
      ).to.deep.equal(['~u/c'])
      expect(
        listTree(
          filterHierarchically(
            sortedWorkflowTree(TEST_TREE),
            // don't filter by name
            null,
            [WorkflowState.STOPPING.name],
            // filter for all task states
            []
          )
        )
      ).to.deep.equal(['~u/b'])
      expect(
        listTree(
          filterHierarchically(
            sortedWorkflowTree(TEST_TREE),
            // don't filter by name
            null,
            [WorkflowState.STOPPED.name],
            // filter for all task states
            []
          )
        )
      ).to.deep.equal(['~u/a/x1', '~u/a/x2'])
    })
    it('should filter by workflow name', () => {
      expect(
        listTree(
          filterHierarchically(
            sortedWorkflowTree(TEST_TREE),
            'x',
            // filter for all workflow states
            [...WorkflowStateOrder.keys()],
            // filter for all task states
            []
          )
        )
      ).to.deep.equal(['~u/a/x1', '~u/a/x2'])
      // check it isn't matching the user name
      expect(
        listTree(
          filterHierarchically(
            sortedWorkflowTree(TEST_TREE),
            'u',
            // filter for all workflow states
            [...WorkflowStateOrder.keys()],
            // filter for all task states
            []
          )
        )
      ).to.deep.equal([])
    })
    it('should filter by workflow state totals', () => {
      expect(
        listTree(
          filterHierarchically(
            sortedWorkflowTree(TEST_TREE),
            null,
            // filter for all workflow states
            [...WorkflowStateOrder.keys()],
            // filter for all task states
            [TaskState.RUNNING.name]
          )
        )
      ).to.deep.equal(['~u/b'])
      expect(
        listTree(
          filterHierarchically(
            sortedWorkflowTree(TEST_TREE),
            null,
            // filter for all workflow states
            [...WorkflowStateOrder.keys()],
            // filter for all task states
            [TaskState.SUBMITTED.name]
          )
        )
      ).to.deep.equal(['~u/c'])
    })
  })

  describe('Workflow link', () => {
    it('should create an empty link for non-workflow nodes', () => {
      const link = GScan.methods.workflowLink({})
      expect(link).to.equal('')
    })
    it('should create a link for a workflow node', () => {
      const link = GScan.methods.workflowLink({
        type: 'workflow',
        tokens: { workflow: 'a/b/c' }
      })
      expect(link).to.equal('/workspace/a/b/c')
    })
  })

  describe('Toggle items values', () => {
    it('should toggle items values to true', () => {
      const items = [
        {
          model: false
        },
        {
          model: false
        }
      ]
      GScan.methods.toggleItemsValues(items)
      expect(items.every(item => item.model))
    })
    it('should toggle items values to false', () => {
      const items = [
        {
          model: true
        },
        {
          model: true
        }
      ]
      GScan.methods.toggleItemsValues(items)
      expect(!items.every(item => item.model))
    })
    it('should toggle items values to false (mixed values)', () => {
      const items = [
        {
          model: true
        },
        {
          model: false
        }
      ]
      GScan.methods.toggleItemsValues(items)
      expect(!items.every(item => item.model))
    })
  })
})
