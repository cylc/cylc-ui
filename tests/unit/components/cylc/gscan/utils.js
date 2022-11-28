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

import { WorkflowState } from '@/model/WorkflowState.model'
import TaskState from '@/model/TaskState.model'

const RUNNING_STATE_TOTALS = {}
RUNNING_STATE_TOTALS[TaskState.RUNNING.name] = 1
RUNNING_STATE_TOTALS[TaskState.SUBMITTED.name] = 0

const SUBMITTED_STATE_TOTALS = {}
SUBMITTED_STATE_TOTALS[TaskState.RUNNING.name] = 0
SUBMITTED_STATE_TOTALS[TaskState.SUBMITTED.name] = 1

export const TEST_TREE = {
  children: [
    {
      id: '~u',
      type: 'user',
      children: [
        {
          id: '~u/a',
          name: 'a',
          type: 'workflow-part',
          children: [
            {
              id: '~u/a/x1',
              name: 'x1',
              type: 'workflow',
              node: { status: WorkflowState.STOPPED.name }
            },
            {
              id: '~u/a/x2',
              name: 'x2',
              type: 'workflow',
              node: { status: WorkflowState.STOPPED.name }
            }
          ]
        },
        {
          id: '~u/b',
          name: 'b',
          type: 'workflow',
          node: {
            status: WorkflowState.STOPPING.name,
            stateTotals: RUNNING_STATE_TOTALS
          }
        },
        {
          id: '~u/c',
          name: 'c',
          type: 'workflow',
          node: {
            status: WorkflowState.RUNNING.name,
            stateTotals: SUBMITTED_STATE_TOTALS
          }
        }
      ]
    }
  ]
}

export function listTree (gscanTree) {
  // return a flat list of workflow ids for all workflow nodes in the
  // tree, preserving sort order
  const ret = []
  const stack = [...gscanTree]
  let item
  while (stack.length) {
    item = stack.splice(0, 1)[0]
    if (['workflow-part', 'user'].includes(item.type)) {
      stack.push(...item.children)
    } else if (item.type === 'workflow') {
      ret.push(item.id)
    }
  }
  return ret
}
