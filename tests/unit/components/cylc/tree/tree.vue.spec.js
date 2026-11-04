/**
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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
import { nextTick, reactive } from 'vue'
import { cloneDeep } from 'lodash'
import Tree from '@/components/cylc/tree/Tree.vue'
import { simpleWorkflowTree4Nodes } from './tree.data'
import { createVuetify } from 'vuetify'
import { vuetifyOptions } from '@/plugins/vuetify'

const vuetify = createVuetify(vuetifyOptions)

describe('Tree component', () => {
  const mountFunction = (props) => mount(Tree, {
    global: {
      plugins: [vuetify],
    },
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
    it('does not traverse the tree nodes when no filter is active', async () => {
      // The filter watcher is deep; if it watched the nodes while no filter
      // was active it would read every property of every node in the store
      // on every delta, which kills performance for large workflows.
      const workflows = cloneDeep(simpleWorkflowTree4Nodes)
      const node = workflows[0].children[0].node
      const state = node.state
      const getter = vi.fn(() => state)
      Object.defineProperty(node, 'state', { get: getter, enumerable: true })
      const reactiveWorkflows = reactive(workflows)
      const wrapper = mountFunction({
        workflows: reactiveWorkflows,
        nodeFilterFunc: vi.fn(),
        filterState: null,
      })
      await nextTick()
      // (ignore any reads made by test-utils when mounting)
      getter.mockClear()
      // simulate a delta updating a different property of the node
      reactiveWorkflows[0].children[0].node.isHeld = true
      await nextTick()
      expect(getter).not.toHaveBeenCalled()
      // ...but the nodes should be watched once a filter is applied
      await wrapper.setProps({ filterState: {} })
      expect(getter).toHaveBeenCalled()
    })
    it('re-runs filtering on deep changes to the nodes while a filter is active', async () => {
      const nodeFilter = vi.fn()
      const workflows = reactive(cloneDeep(simpleWorkflowTree4Nodes))
      mountFunction({
        workflows,
        nodeFilterFunc: nodeFilter,
        filterState: {},
      })
      await nextTick()
      nodeFilter.mockClear()
      // mutate a nested property in place (as the data store does)
      workflows[0].children[0].node.state = 'frobnicated'
      await nextTick()
      expect(nodeFilter).toHaveBeenCalledTimes(1)
    })
  })
})
