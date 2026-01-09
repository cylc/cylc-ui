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
  globToRegex,
  matchID,
  matchNode,
  matchState,
} from '@/components/cylc/common/filter'

const taskNode = {
  id: '~user/one//20000102T0000Z/succeeded',
  tokens: {
    user: 'user',
    workflow: 'one',
    cycle: '20000102T0000Z',
    task: 'succeeded',
    id: '~user/one//20000102T0000Z/succeeded',
    workflowID: '~user/one',
    relativeID: '20000102T0000Z/succeeded',
  },
  name: 'succeeded',
  type: 'task',
  parent: '~user/one//20000102T0000Z',
  node: {
    id: '~user/one//20000102T0000Z/succeeded',
    name: 'succeeded',
    state: 'succeeded',
    isHeld: true,
    isQueued: false,
    isRunahead: false,
    isRetry: true,
    isWallclock: false,
    isXtriggered: false,
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
      { node: taskNode, regex: null, expected: true },
      { node: taskNode, regex: /2000/, expected: true },
      { node: taskNode, regex: /succeeded/, expected: true },
      { node: taskNode, regex: /20000102T0000Z\/suc/, expected: true },
      { node: taskNode, regex: /2001/, expected: false },
      { node: taskNode, regex: globToRegex('*'), expected: true },
      { node: taskNode, regex: globToRegex('suc*'), expected: true },
      { node: taskNode, regex: /darmok/, expected: false },
      { node: taskNode, regex: globToRegex('darmok*'), expected: false },
      // Only matches relative ID:
      { node: taskNode, regex: /user\/one/, expected: false },
      // Case sensitive:
      { node: taskNode, regex: /SUC/, expected: false },
    ])('matchID(<$node.id>, $regex)', ({ node, regex, expected }) => {
      expect(matchID(node, regex)).toBe(expected)
    })
  })

  describe('matchState', () => {
    it.each([
      { node: taskNode, states: null, expected: true },
      { node: taskNode, states: [], expected: true },
      { node: taskNode, states: ['succeeded'], expected: true },
      { node: taskNode, states: ['succeeded', 'failed'], expected: true },
      { node: taskNode, states: ['failed'], expected: false },
      { node: taskNode, states: ['waiting'], waitingStateModifiers: ['isRetry'], expected: false },
      { node: taskNode, genericModifiers: ['isHeld'], expected: true },
      { node: taskNode, genericModifiers: ['isHeld', 'isRunahead'], expected: true },
      { node: taskNode, genericModifiers: ['isRunahead'], expected: false },
      { node: taskNode, states: ['succeeded'], genericModifiers: ['isHeld'], expected: true },
      { node: taskNode, states: ['waiting'], genericModifiers: ['isHeld'], expected: false },
    ])('matchState(<$node.node.state>, $states)', ({
      node,
      states,
      waitingStateModifiers,
      genericModifiers,
      expected,
    }) => {
      expect(matchState(
        node,
        states,
        waitingStateModifiers,
        genericModifiers,
      )).toBe(expected)
    })
  })

  describe('matchNode', () => {
    it.each([
      { node: taskNode, regex: null, states: [], expected: true },
      { node: taskNode, regex: /2000/, states: [], expected: true },
      { node: taskNode, regex: /2000/, states: ['succeeded', 'failed'], expected: true },
      { node: taskNode, regex: /darmok/, states: ['succeeded', 'failed'], expected: false },
      { node: taskNode, regex: /2000/, states: ['failed'], expected: false },
    ])('matchNode(<$node.id>, $regex, $states)', ({ node, regex, states, expected }) => {
      expect(matchNode(node, regex, states)).toBe(expected)
    })
  })

  describe('globToRegex', () => {
    it.each([
      // no pattern specified
      { glob: '', regex: null },
      { glob: '  ', regex: null },

      // plain text
      { glob: 'foo', regex: /foo/ },

      // globs
      { glob: 'f*o', regex: /f.*o/ },
      { glob: 'f*o*o', regex: /f.*o.*o/ },
      { glob: 'f?o', regex: /f.o/ },
      { glob: 'f?o?o', regex: /f.o.o/ },
      { glob: 'f[o]o', regex: /f[o]o/ },
      { glob: 'f[o]o[o]l', regex: /f[o]o[o]l/ },
      { glob: 'f[!o]o', regex: /f[^o]o/ },
      { glob: 'f[!o]o[!o]l', regex: /f[^o]o[^o]l/ },

      // regex escapes
      { glob: '.*', regex: /\..*/ },
      { glob: '.*.*.*', regex: /\..*\..*\..*/ },
      { glob: '(x)', regex: /\(x\)/ },
      { glob: '\\w\\d\\s', regex: /\\w\\d\\s/ },

      // nasty
      { glob: 'a*[bc]d[!ef]*g?h.*i(j)', regex: /a.*[bc]d[^ef].*g.h\..*i\(j\)/ }
    ])('globToRegex($glob) => $regex', ({ glob, regex }) => {
      expect(String(globToRegex(glob))).toBe(String(regex))
    })
  })
})
