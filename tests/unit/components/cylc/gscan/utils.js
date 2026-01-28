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
import { Tokens } from '@/utils/uid'

const RUNNING_STATE_TOTALS = {
  [TaskState.RUNNING.name]: 1,
  [TaskState.SUBMITTED.name]: 0,
}

const SUBMITTED_STATE_TOTALS = {
  [TaskState.RUNNING.name]: 0,
  [TaskState.SUBMITTED.name]: 1,
}

const SUBMIT_FAILED_STATE_TOTALS = {
  [TaskState.SUBMIT_FAILED.name]: 1,
}

export const TEST_TREE = {
  children: [
    {
      id: '~u',
      type: 'user',
      tokens: new Tokens('u'),
      children: [
        {
          id: '~u/a',
          name: 'a',
          type: 'workflow-part',
          tokens: new Tokens('~u/a'),
          node: {},
          children: [
            {
              id: '~u/a/x1',
              name: 'x1',
              type: 'workflow',
              tokens: new Tokens('~u/a/x1'),
              node: {
                status: WorkflowState.STOPPED.name,
                stateTotals: SUBMIT_FAILED_STATE_TOTALS,
                latestStateTasks: [],
              },
            },
            {
              id: '~u/a/x2',
              name: 'x2',
              type: 'workflow',
              tokens: new Tokens('~u/a/x2'),
              node: {
                status: WorkflowState.STOPPED.name,
                latestStateTasks: [],
              },
            },
          ],
        },
        {
          id: '~u/b',
          name: 'b',
          type: 'workflow',
          tokens: new Tokens('~u/b'),
          node: {
            status: WorkflowState.STOPPING.name,
            stateTotals: RUNNING_STATE_TOTALS,
            latestStateTasks: [],
          },
        },
        {
          id: '~u/c',
          name: 'c',
          type: 'workflow',
          tokens: new Tokens('~u/c'),
          node: {
            status: WorkflowState.RUNNING.name,
            stateTotals: SUBMITTED_STATE_TOTALS,
            latestStateTasks: [],
          },
        },
      ],
    },
  ],
}

/**
 * Return a flat list of workflow ids for all workflow nodes in the
 * tree, preserving sort order
 *
 * @param {Object} tree
 * @param {boolean} filter - whether to remove items that have been filtered out
 */
export function listTree (tree, filter = false) {
  const ret = []
  const stack = [...tree]
  let item
  while (stack.length) {
    item = stack.splice(0, 1)[0]
    if (!filter || !item.filteredOut) {
      if (['workflow-part', 'user'].includes(item.type)) {
        stack.push(...item.children)
      } else if (item.type === 'workflow') {
        ret.push(item.id)
      }
    }
  }
  return ret
}
