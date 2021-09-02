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

import isArray from 'lodash/isArray'
import {
  createWorkflowNode,
  createCyclePointNode,
  createFamilyProxyNode,
  createJobNode,
  createTaskProxyNode
} from '@/components/cylc/tree/nodes'
import * as CylcTree from '@/components/cylc/tree/index'

/**
 * Helper object used to iterate added deltas data.
 */
const ADDED = {
  workflow: [createWorkflowNode, 'addWorkflow'],
  cyclePoints: [createCyclePointNode, 'addCyclePoint'],
  familyProxies: [createFamilyProxyNode, 'addFamilyProxy'],
  taskProxies: [createTaskProxyNode, 'addTaskProxy'],
  jobs: [createJobNode, 'addJob']
}

/**
 * Deltas added.
 *
 * @param {DeltasAdded|Object} added
 * @param {Workflow} workflow
 * @param {Lookup} lookup
 * @param {*} options
 * @return {Result}
 */
function applyDeltasAdded (added, workflow, lookup, options) {
  const result = {
    errors: []
  }
  Object.keys(ADDED).forEach(addedKey => {
    if (added[addedKey]) {
      const items = isArray(added[addedKey]) ? added[addedKey] : [added[addedKey]]
      items.forEach(addedData => {
        try {
          const existingData = lookup[addedData.id]
          const createNodeFunction = ADDED[addedKey][0]
          const treeFunction = ADDED[addedKey][1]
          const node = createNodeFunction(existingData)
          CylcTree[treeFunction](node, workflow, options)
        } catch (error) {
          result.errors.push([
            'Error applying Tree added-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
            error,
            addedData,
            workflow,
            lookup
          ])
        }
      })
    }
  })
  return result
}

/**
 * Helper object used to iterate updated deltas data.
 */
const UPDATED = {
  familyProxies: [createFamilyProxyNode, 'updateFamilyProxy'],
  taskProxies: [createTaskProxyNode, 'updateTaskProxy'],
  jobs: [createJobNode, 'updateJob']
}

/**
 * Deltas updated.
 *
 * @param updated {DeltasUpdated|Object} updated
 * @param {Workflow} workflow
 * @param {Lookup} lookup
 * @param {*} options
 */
function applyDeltasUpdated (updated, workflow, lookup, options) {
  const result = {
    errors: []
  }
  Object.keys(UPDATED).forEach(updatedKey => {
    if (updated[updatedKey]) {
      updated[updatedKey].forEach(updatedData => {
        try {
          const existingData = lookup[updatedData.id]
          if (!existingData) {
            result.errors.push([
              `Updated node [${updatedData.id}] not found in Tree workflow lookup`,
              updatedData,
              workflow,
              lookup
            ])
          } else {
            const updateNodeFunction = UPDATED[updatedKey][0]
            const treeFunction = UPDATED[updatedKey][1]
            const node = updateNodeFunction(existingData)
            CylcTree[treeFunction](node, workflow, options)
          }
        } catch (error) {
          result.errors.push([
            'Error applying Tree added-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
            error,
            updatedData,
            workflow,
            lookup
          ])
        }
      })
    }
  })
  return result
}

/**
 * Helper object used to iterate pruned deltas data.
 */
const PRUNED = {
  jobs: 'removeJob',
  taskProxies: 'removeTaskProxy',
  familyProxies: 'removeFamilyProxy'
}

/**
 * Deltas pruned.
 *
 * @param {DeltasPruned|Object} pruned - deltas pruned
 * @param {Workflow} workflow
 * @param {Lookup} lookup
 * @param {*} options
 */
function applyDeltasPruned (pruned, workflow, lookup, options) {
  const result = {
    errors: []
  }
  Object.keys(PRUNED).forEach(prunedKey => {
    if (pruned[prunedKey]) {
      for (const id of pruned[prunedKey]) {
        try {
          CylcTree[PRUNED[prunedKey]](id, workflow, options)
        } catch (error) {
          result.errors.push([
            'Error applying Tree pruned-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
            error,
            prunedKey,
            workflow,
            lookup
          ])
        }
      }
    }
  })
  return result
}

export {
  applyDeltasAdded,
  applyDeltasUpdated,
  applyDeltasPruned
}
