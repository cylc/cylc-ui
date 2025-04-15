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

import {
  sortedIndexBy,
} from '@/components/cylc/common/sort'
import { WorkflowState, WorkflowStateOrder } from '@/model/WorkflowState.model'

/**
 * Return an integer suitable for alphabetical sorting of workflow states.
 *
 * This looks at all workflows contained in this tree and returns a status
 * value for it as defined in WORKFLOW_STATE_ORDER.
 */
export function getWorkflowTreeSortValue (node) {
  if (node.type === 'workflow') {
    return WorkflowStateOrder.get(node.node.status)
  }
  let ret = 9
  let temp = 9
  let item
  const stack = [...node.children]
  while (
    ret > WorkflowStateOrder.get(WorkflowState.RUNNING.name) &&
    stack.length
  ) {
    // NOTE: if one workflow is running (top sort order) then we don't
    // need to keep searching as nothing can elevate the sort order further
    item = stack.pop()
    if (item.type === 'workflow-part') {
      stack.push(...item.children)
    } else if (item.type === 'workflow') {
      temp = WorkflowStateOrder.get(item.node.status)
      if (temp < ret) {
        ret = temp
      }
    }
  }
  return ret
}

/**
 * Return a string suitable for alphabetical sorting of workflows
 *
 * Sorts workflows by:
 * 1) State
 * 2) ID
 */
function gscanWorkflowCompValue (node) {
  return `${getWorkflowTreeSortValue(node)}_${node.id}`
}

/**
 * Returns a sorted list of top-level workflows / workflow-parts.
 *
 * Sorts according to getWorkflowTreeSortValue.
 */
export function sortedWorkflowTree (cylcTree) {
  const tree = []
  for (let node of cylcTree.children[0].children) {
    node = flattenWorkflowParts(node)
    if (node) {
      // insert this workflow / workflow-part in sort order
      tree.splice(
        sortedIndexBy(tree, node, gscanWorkflowCompValue),
        0,
        node
      )
    }
  }
  return tree
}

/**
 * Flatten workflow-parts nodes that only have 1 child.
 *
 * E.g. foo, containing only run1, becomes foo/run1
 *
 * @param {Object} node
 * @returns {Object=} flattened node, or the original node if it has multiple children.
 *   Warning: can be undefined if a workflow-part has no children (this can happen sometimes but should be transitory).
 */
export function flattenWorkflowParts (node) {
  if (node.type !== 'workflow-part') {
    return node
  }
  if (node.children.length === 1) {
    const child = node.children[0]
    return flattenWorkflowParts({
      ...child,
      name: child.id.substring(node.parent.length + 1), // (parent ID doesn't include slash so add 1)
      parent: node.parent,
    })
  } else if (node.children.length > 1) {
    return {
      ...node,
      children: node.children.map((n) => flattenWorkflowParts(n)),
    }
  }
}
