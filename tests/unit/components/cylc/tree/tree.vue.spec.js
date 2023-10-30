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

// we mount the tree to include the TreeItem component and other vuetify children components
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import sinon from 'sinon'
import Tree from '@/components/cylc/tree/Tree.vue'
import { simpleWorkflowTree4Nodes } from './tree.data'
import CylcObjectPlugin from '@/components/cylc/cylcObject/plugin'
import cloneDeep from 'lodash/cloneDeep'
import WorkflowService from '@/services/workflow.service'

const $eventBus = {
  emit () {}
}
const $workflowService = sinon.createStubInstance(WorkflowService)
const vuetify = createVuetify()

describe('Tree component', () => {
  /**
   * @param options
   * @returns {Wrapper<Tree>}
   */
  const mountFunction = (options) => mount(Tree, {
    global: {
      plugins: [vuetify, CylcObjectPlugin],
      mocks: {
        $eventBus,
        $workflowService
      }
    },
    ...options
  })

  it('should display the tree with valid data', () => {
    const wrapper = mountFunction({
      props: {
        workflows: simpleWorkflowTree4Nodes[0].children
      }
    })
    expect(wrapper.props().workflows[0].node.__typename).to.equal('CyclePoint')
    expect(wrapper.find('div')).to.not.equal(null)
  })
  describe('Filter', () => {
    describe('Default', () => {
      it('should not filter by name or state by default', () => {
        const wrapper = mountFunction({
          props: {
            workflows: simpleWorkflowTree4Nodes[0].children
          }
        })
        expect(wrapper.vm.tasksFilter).to.deep.equal({})
      })
    })
  })
  describe('Caches', () => {
    /**
     * Create a tree item for tests with the caches.
     * @param {string} id - node ID
     * @param {boolean} expanded - whether node is expanded or not
     * @returns {{isExpanded: *, $props: {node: {id: *}}}}
     */
    const createTreeItem = (id, expanded) => {
      return {
        isExpanded: expanded,
        $props: {
          node: {
            id
          }
        }
      }
    }
    it('should all be initialized to empty caches', () => {
      const wrapper = mountFunction({
        props: {
          workflows: []
        }
      })
      expect(Object.keys(wrapper.vm.treeItemCache).length).to.equal(0)
      expect(wrapper.vm.expandedCache.size).to.equal(0)
    })
    it('should add to the tree item cache', () => {
      const wrapper = mountFunction({
        props: {
          workflows: []
        }
      })
      const treeItem = createTreeItem('1', false)
      wrapper.vm.onTreeItemCreated(treeItem)
      expect(Object.keys(wrapper.vm.treeItemCache).length).to.equal(1)
      expect(wrapper.vm.expandedCache.size).to.equal(0)
    })
    it('should remove from the tree item cache', () => {
      const wrapper = mountFunction({
        props: {
          workflows: []
        }
      })
      const treeItem = createTreeItem('1', false)
      wrapper.vm.onTreeItemCreated(treeItem)
      expect(Object.keys(wrapper.vm.treeItemCache).length).to.equal(1)
      wrapper.vm.onTreeItemDestroyed(treeItem)
      expect(Object.keys(wrapper.vm.treeItemCache).length).to.equal(0)
    })
    it('should add to the expanded cache', () => {
      const wrapper = mountFunction({
        props: {
          workflows: []
        }
      })
      const treeItem = createTreeItem('1', true)
      wrapper.vm.onTreeItemCreated(treeItem)
      expect(Object.keys(wrapper.vm.treeItemCache).length).to.equal(1)
      expect(wrapper.vm.expandedCache.size).to.equal(1)
    })
    it('should remove from the expanded cache', () => {
      const wrapper = mountFunction({
        props: {
          workflows: []
        }
      })
      const treeItem = createTreeItem('1', true)
      wrapper.vm.onTreeItemCreated(treeItem)
      expect(Object.keys(wrapper.vm.treeItemCache).length).to.equal(1)
      expect(wrapper.vm.expandedCache.size).to.equal(1)
      wrapper.vm.onTreeItemCollapsed(treeItem)
      expect(Object.keys(wrapper.vm.treeItemCache).length).to.equal(1)
      expect(wrapper.vm.expandedCache.size).to.equal(0)
    })
  })
  describe('Expand-Collapse', () => {
    // Three collections, one with mixed (expanded/collapsed),
    // one with all items collapsed, and one with all items expanded.
    // Enough to cover the possible test scenarios for the
    // expand-collapse toggle functions.
    const mixed = {
      '~user/workflow': {
        id: '~user/workflow',
        type: 'workflow',
        isExpanded: false
      },
      '~user/workflow//1': {
        id: '~user/workflow//1',
        type: 'cyclepoint',
        isExpanded: true
      }
    }
    const allCollapsed = {
      '~user/workflow': {
        id: '~user/workflow',
        type: 'workflow',
        isExpanded: false
      },
      '~user/workflow//1': {
        id: '~user/workflow//1',
        type: 'cyclepoint',
        isExpanded: false
      }
    }
    const allExpanded = {
      '~user/workflow': {
        id: '~user/workflow',
        type: 'workflow',
        isExpanded: true
      },
      '~user/workflow//1': {
        id: '~user/workflow//1',
        type: 'cyclepoint',
        isExpanded: true
      }
    }
    const filterWorkflows = (item) => item.type === 'workflow'
    const filterCyclepoints = (item) => item.type === 'cyclepoint'
    const filterTaskProxies = (item) => item.type === 'task-proxy'

    it.each([
      // everything is expanded
      {
        filter: null,
        items: mixed,
        expectedExpandedItems: 2
      },
      {
        filter: null,
        items: allExpanded,
        expectedExpandedItems: 2
      },
      {
        filter: null,
        items: allCollapsed,
        expectedExpandedItems: 2
      },
      // will expand the collapsed workflow (found with the filter)
      {
        filter: filterWorkflows,
        items: allCollapsed,
        expectedExpandedItems: 1
      },
      // workflow will stay collapsed
      {
        filter: filterCyclepoints,
        items: allCollapsed,
        expectedExpandedItems: 1
      },
      // filter won't find any task-proxies, so everything is still collapsed
      {
        filter: filterTaskProxies,
        items: allCollapsed,
        expectedExpandedItems: 0
      },
    ])('should expand items %#', ({ filter, items, expectedExpandedItems }) => {
      // we clone the test data structures as the function mutates the objects
      const wrapper = mountFunction({
        props: {
          workflows: [],
          expandCollapseToggle: true
        },
        data () {
          return {
            treeItemCache: cloneDeep(items),
          }
        }
      })
      const { treeItemCache } = wrapper.vm

      wrapper.vm.expandAll(filter)
      expect(wrapper.vm.expanded).to.equal(true)

      const collection = filter ? Object.values(treeItemCache).filter(filter) : Object.values(treeItemCache)
      for (const item of collection) {
        expect(item.isExpanded).to.equal(true)
      }
      expect(
        Object.values(treeItemCache).filter(item => item.isExpanded).length,
        `Failed case: ${JSON.stringify(items)}`
      ).to.equal(expectedExpandedItems)
    })

    it.each([
      // everything is collapsed
      {
        filter: null,
        items: cloneDeep(mixed),
        expectedCollapsedItems: 2
      },
      {
        filter: null,
        items: cloneDeep(allExpanded),
        expectedCollapsedItems: 2
      },
      {
        filter: null,
        items: cloneDeep(allCollapsed),
        expectedCollapsedItems: 2
      },
      // will collapse the expanded workflow (found with the filter)
      {
        filter: filterWorkflows,
        items: cloneDeep(allExpanded),
        expectedCollapsedItems: 1
      },
      // workflow will stay expanded
      {
        filter: filterCyclepoints,
        items: cloneDeep(allExpanded),
        expectedCollapsedItems: 1
      },
      // filter won't find any task-proxies, so everything is still expanded
      {
        filter: filterTaskProxies,
        items: cloneDeep(allExpanded),
        expectedCollapsedItems: 0
      }
    ])('should collapse items %#', ({ filter, items, expectedCollapsedItems }) => {
      // we clone the test data structures as the function mutates the objects
      const wrapper = mountFunction({
        props: {
          workflows: [],
          expandCollapseToggle: true
        },
        data () {
          return {
            treeItemCache: items,
          }
        }
      })
      // the collapseAll rely on expandedCache being filled correctly
      Object.values(items).forEach(item => {
        if (item.isExpanded) {
          wrapper.vm.expandedCache.add(item)
        }
      })
      const treeItemCache = wrapper.vm.treeItemCache

      wrapper.vm.collapseAll(filter)
      expect(wrapper.vm.expanded).to.equal(filter !== null)

      const collection = filter ? Object.values(treeItemCache).filter(filter) : Object.values(treeItemCache)
      for (const item of collection) {
        expect(item.isExpanded).to.equal(false)
      }
      expect(
        Object.values(treeItemCache).filter(item => !item.isExpanded).length,
        `Failed case: ${JSON.stringify(items)}`
      ).to.equal(expectedCollapsedItems)
    })
  })
})
