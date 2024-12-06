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

import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import { cloneDeep } from 'lodash'
import Tree from '@/components/cylc/tree/Tree.vue'
import { simpleWorkflowTree4Nodes } from './tree.data'

describe('Tree component', () => {
  const mountFunction = (props) => mount(Tree, {
    props: {
      workflows: cloneDeep(simpleWorkflowTree4Nodes),
      autoStripTypes: ['workflow'],
      filterState: null,
      ...props,
    },
    shallow: true,
  })

  it.each([
    { autoStripTypes: [], expected: simpleWorkflowTree4Nodes },
    { autoStripTypes: ['workflow'], expected: simpleWorkflowTree4Nodes[0].children },
  ])('auto strips $autoStripTypes', ({ autoStripTypes, expected }) => {
    const wrapper = mountFunction({
      autoStripTypes,
    })
    expect(wrapper.vm.rootChildren).toEqual(expected)
  })

  describe('Filter', () => {
    it('only runs filtering when applicable', async () => {
      const nodeFilter = vi.fn()
      const wrapper = mountFunction({
        nodeFilterFunc: nodeFilter,
        filterState: {},
      })
      // Does not run filtering when filterState changes & is falsy
      await wrapper.setProps({ filterState: null })
      expect(nodeFilter).not.toHaveBeenCalled()
      // Runs filtering when filterState changes & is truthy
      await wrapper.setProps({ filterState: {} })
      expect(nodeFilter.mock.calls).toEqual([
        [simpleWorkflowTree4Nodes[0].children[0], wrapper.vm.filteredOutNodesCache],
      ])
      nodeFilter.mockClear()
      // Runs filtering when tree changes
      const newWorkflows = cloneDeep(simpleWorkflowTree4Nodes)
      newWorkflows[0].children[0].node.state = 'frobnicated'
      await wrapper.setProps({
        workflows: newWorkflows,
      })
      expect(nodeFilter.mock.calls).toEqual([
        [newWorkflows[0].children[0], wrapper.vm.filteredOutNodesCache],
      ])
    })
  })
})
