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

import { flattenWorkflowParts } from '@/components/cylc/gscan/sort'

const run1 = {
  id: '~awake/dark/place/run1',
  type: 'workflow',
  name: 'dark/place/run1',
  parent: '~awake/dark/place',
  children: [
    { type: 'cycle' },
    { type: 'cycle' },
  ],
}

const run2 = {
  id: '~awake/dark/place/run2',
  type: 'workflow',
  name: 'dark/place/run2',
  parent: '~awake/dark/place',
  children: [
    { type: 'cycle' },
  ],
}

describe('flattenWorkflowParts()', () => {
  it('Flattens a workflow-part with 1 child', () => {
    const node = {
      id: '~awake/dark',
      type: 'workflow-part',
      name: 'dark',
      parent: '~awake',
      children: [
        {
          id: '~awake/dark/place',
          type: 'workflow-part',
          name: 'dark/place',
          parent: '~awake/dark',
          children: [run1, run2],
        },
      ],
    }
    expect(flattenWorkflowParts(node)).toStrictEqual({
      ...node.children[0],
      parent: '~awake',
    })
  })

  it('Flattens all workflow-parts in hierarchy with 1 child', () => {
    expect(flattenWorkflowParts({
      id: '~awake/dark',
      type: 'workflow-part',
      name: 'dark',
      parent: '~awake',
      children: [
        {
          id: '~awake/dark/place',
          type: 'workflow-part',
          name: 'dark/place',
          parent: '~awake/dark',
          children: [run1],
        },
      ],
    })).toStrictEqual({
      ...run1,
      parent: '~awake',
    })
  })

  it("Doesn't flatten workflow-parts with >1 children", () => {
    const node = {
      id: '~awake/dark',
      type: 'workflow-part',
      name: 'dark',
      parent: '~awake',
      children: [
        {
          id: '~awake/dark/place',
          type: 'workflow-part',
          name: 'dark/place',
          parent: '~awake/dark',
          children: [run1],
        },
        {
          id: '~awake/dark/presence',
          type: 'workflow-part',
          name: 'dark/presence',
          parent: '~awake/dark',
          children: [
            { type: 'workflow', id: 'barry' },
            { type: 'workflow', id: 'stucky' },
          ],
        },
      ],
    }
    const result = flattenWorkflowParts(node)
    expect(result).toStrictEqual({
      id: '~awake/dark',
      type: 'workflow-part',
      name: 'dark',
      parent: '~awake',
      children: [
        {
          ...run1,
          name: 'place/run1',
          parent: '~awake/dark',
        },
        node.children[1],
      ],
    })
  })

  it("Doesn't flatten workflows", () => {
    expect(flattenWorkflowParts(run2)).toStrictEqual(run2)
  })
})
