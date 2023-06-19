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

import { matchID, matchNode, matchState } from '@/components/cylc/common/filter'

const taskNode = {
  id: '~user/one//20000102T0000Z/succeeded',
  tokens: {
    user: 'user',
    workflow: 'one',
    cycle: '20000102T0000Z',
    task: 'succeeded',
    id: '~user/one//20000102T0000Z/succeeded',
    workflow_id: '~user/one',
    relative_id: '20000102T0000Z/succeeded',
  },
  name: 'succeeded',
  type: 'task',
  parent: '~user/one//20000102T0000Z',
  node: {
    id: '~user/one//20000102T0000Z/succeeded',
    name: 'succeeded',
    state: 'succeeded',
    isHeld: false,
    isQueued: false,
    isRunahead: false,
    cyclePoint: '20000102T0000Z',
    firstParent: {
      id: '~user/one//20000102T0000Z/SUCCEEDED',
      name: 'SUCCEEDED',
      cyclePoint: '20000102T0000Z',
      state: 'submitted',
    },
    task: { meanElapsedTime: 0, name: 'succeeded' },
  },
  children: [/* snip */],
}

describe('task filtering', () => {
  describe('matchID', () => {
    it.each([
      { node: taskNode, id: '', expected: true },
      { node: taskNode, id: '  ', expected: true },
      { node: taskNode, id: '2000', expected: true },
      { node: taskNode, id: 'succeeded', expected: true },
      { node: taskNode, id: '20000102T0000Z/suc', expected: true },
      { node: taskNode, id: '2001', expected: false },
      { node: taskNode, id: 'darmok', expected: false },
      // Only matches relative ID:
      { node: taskNode, id: 'user/one', expected: false },
      // Case sensitive:
      { node: taskNode, id: 'SUC', expected: false },
    ])('matchID(<$node.id>, $id)', ({ node, id, expected }) => {
      expect(matchID(node, id)).toBe(expected)
    })
  })

  describe('matchState', () => {
    it.each([
      { node: taskNode, states: null, expected: true },
      { node: taskNode, states: [], expected: true },
      { node: taskNode, states: ['succeeded'], expected: true },
      { node: taskNode, states: ['succeeded', 'failed'], expected: true },
      { node: taskNode, states: ['failed'], expected: false },
    ])('matchState(<$node.node.state>, $states)', ({ node, states, expected }) => {
      expect(matchState(node, states)).toBe(expected)
    })
  })

  describe('matchNode', () => {
    it.each([
      { node: taskNode, id: '', states: [], expected: true },
      { node: taskNode, id: '2000', states: [], expected: true },
      { node: taskNode, id: '', states: ['succeeded', 'failed'], expected: true },
      { node: taskNode, id: '2000', states: ['succeeded', 'failed'], expected: true },
      { node: taskNode, id: 'darmok', states: ['succeeded', 'failed'], expected: false },
      { node: taskNode, id: '2000', states: ['failed'], expected: false },
    ])('matchNode(<$node.id>, $id, $states)', ({ node, id, states, expected }) => {
      expect(matchNode(node, id, states)).toBe(expected)
    })
  })
})
