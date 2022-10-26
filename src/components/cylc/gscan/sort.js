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

import { DEFAULT_COMPARATOR } from '@/components/cylc/common/sort'
import { WorkflowStateOrder } from '@/model/WorkflowState.model'

export const WORKFLOW_TYPES_ORDER = ['workflow-part', 'workflow']

/**
 * @typedef {SortedIndexByComparator} SortTaskProxyOrFamilyProxyComparator
 * @param {TaskProxyNode|FamilyProxyNode} leftObject
 * @param {string} leftValue
 * @param {TaskProxyNode|FamilyProxyNode} rightObject
 * @param {string} rightValue
 * @returns {boolean}
 */

/**
 * Sort workflows by type first, showing running or paused workflows first,
 * then stopped. Within each group, workflows are sorted alphabetically
 * (natural sort).
 * @param leftObject
 * @param leftValue
 * @param rightObject
 * @param rightValue
 * @returns {boolean|number}
 */
export function sortWorkflowNamePartNodeOrWorkflowNode (leftObject, leftValue, rightObject, rightValue) {
  if (leftObject.type !== rightObject.type) {
    return WORKFLOW_TYPES_ORDER.indexOf(leftObject.type) - WORKFLOW_TYPES_ORDER.indexOf(rightObject.type)
  }
  if (leftObject.node.status !== rightObject.node.status) {
    const leftStateOrder = WorkflowStateOrder.get(leftObject.node.status)
    const rightStateOrder = WorkflowStateOrder.get(rightObject.node.status)
    // Here we compare the order of states, not the states since some states
    // are grouped together, like RUNNING, PAUSED, and STOPPING.
    if (leftStateOrder !== rightStateOrder) {
      return leftStateOrder - rightStateOrder
    }
  }
  // name
  return DEFAULT_COMPARATOR(leftValue, rightValue)
}

const WORKFLOW_STATE_ORDER = {
  running: 1,
  paused: 1,
  stopping: 1,
  stopped: 2,
  undefined: 9
}

/* Return an integer suitable for alphabetical sorting of workflow states.
 *
 * This looks at all workflows contained in this tree and returns a status
 * value for it as defined in WORKFLOW_STATE_ORDER.
 *
 */
function getWorkflowTreeSortValue (node) {
  if (node.type === 'workflow') {
    return WORKFLOW_STATE_ORDER[node.node.status]
  }
  let ret = 9
  let temp = 9
  let item
  const stack = [...node.children]
  while (ret !== WORKFLOW_STATE_ORDER.running && stack.length) {
    // NOTE: if one workflow is running (top sort order) then we don't
    // need to keep searching as nothing can elevate the sort order further
    item = stack.pop()
    if (item.type === 'workflow-part') {
      stack.push(...item.children)
    } else if (item.type === 'workflow') {
      temp = WORKFLOW_STATE_ORDER[item.node.status]
      if (temp < ret) {
        ret = temp
      }
    }
  }
  return ret
}

/* Return a string suitable for alphabetical sorting of workflows
 *
 * Sorts workflows by:
 * 1) State
 * 2) ID
 */
export function gscanWorkflowCompValue (node) {
  return `${getWorkflowTreeSortValue(node)}_${node.id}`
}
