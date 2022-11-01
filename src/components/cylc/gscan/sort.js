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
  sortedIndexBy
} from '@/components/cylc/common/sort'
import { WorkflowState, WorkflowStateOrder } from '@/model/WorkflowState.model'

/* Return an integer suitable for alphabetical sorting of workflow states.
 *
 * This looks at all workflows contained in this tree and returns a status
 * value for it as defined in WORKFLOW_STATE_ORDER.
 *
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
    ret !== WorkflowStateOrder.get(WorkflowState.RUNNING.name) &&
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

/* Return a string suitable for alphabetical sorting of workflows
 *
 * Sorts workflows by:
 * 1) State
 * 2) Type (i.e. sort "workflow-part" before "workflow")
 * 3) ID
 */
function gscanWorkflowCompValue (node) {
  const typeValue = node.type === 'workflow-part' ? 'a' : 'z'
  return `${getWorkflowTreeSortValue(node)}_${typeValue}_${node.id}`
}

/* Returns a sorted list of top-level workflows / workflow-parts.
 *
 * Sorts according to getWorkflowTreeSortValue.
 */
export function sortedWorkflowTree (cylcTree) {
  const tree = []
  for (const workflowTree of cylcTree.children[0].children) {
    // insert this workflow / workflow-part in sort order
    tree.splice(
      sortedIndexBy(
        tree,
        workflowTree,
        (n) => gscanWorkflowCompValue(n)
      ),
      0,
      workflowTree
    )
  }
  return tree
}
