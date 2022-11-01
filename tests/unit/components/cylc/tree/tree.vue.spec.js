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
import { createLocalVue, mount } from '@vue/test-utils'
import { expect } from 'chai'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import Tree from '@/components/cylc/tree/Tree'
import { simpleWorkflowTree4Nodes } from './tree.data'
import TaskState from '@/model/TaskState.model'
import CylcObjectPlugin from '@/components/cylc/cylcObject/plugin'
import cloneDeep from 'lodash/cloneDeep'

const localVue = createLocalVue()
localVue.prototype.$eventBus = {
  emit () {}
}
localVue.prototype.$workflowService = {
  register () {},
  unregister () {},
  subscribe () {},
  mutationsAndTypes: Promise.resolve({
    mutations: [
      { args: [] }
    ],
    types: []
  })
}
localVue.use(CylcObjectPlugin)

describe('Tree component', () => {
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify({
      theme: { disable: true },
      icons: {
        iconfont: 'mdi'
      }
    })
  })
  // mount function from Vuetify docs https://vuetifyjs.com/ru/getting-started/unit-testing/
  /**
   * @param options
   * @returns {Wrapper<Tree>}
   */
  const mountFunction = options => {
    // the mocks.$vuetify is for https://github.com/vuetifyjs/vuetify/issues/9923
    return mount(Tree, {
      localVue,
      mocks: {
        $vuetify: {
          lang: {
            t: (val) => val
          }
        }
      },
      vuetify,
      ...options
    })
  }
  global.requestAnimationFrame = cb => cb()
  it('should display the tree with valid data', () => {
    const wrapper = mountFunction({
      propsData: {
        workflows: simpleWorkflowTree4Nodes[0].children
      }
    })
    expect(wrapper.props().workflows[0].node.__typename).to.equal('CyclePoint')
    expect(wrapper.find('div')).to.not.equal(null)
  })
  describe('Activable', () => {
    it('should not activate by default', () => {
      const wrapper = mountFunction({
        propsData: {
          workflows: simpleWorkflowTree4Nodes[0].children,
          filterable: false
        }
      })
      const treeItems = wrapper.findAllComponents({ name: 'TreeItem' })
      const workflowTreeItem = treeItems.wrappers[0]
      // the workflow tree item node must not be active
      const workflowTreeItemNode = workflowTreeItem.find('div.node')
      expect(workflowTreeItemNode.classes('node--active')).to.equal(false)
      const workflowTreeItemNodeActivableSpan = workflowTreeItemNode.find('.node-data > span')
      workflowTreeItemNodeActivableSpan.trigger('click')
      expect(workflowTreeItemNode.classes('node--active')).to.equal(false)
    })
    it('should activate correctly', async () => {
      const wrapper = mountFunction({
        propsData: {
          workflows: simpleWorkflowTree4Nodes[0].children,
          activable: true
        }
      })
      const treeItems = wrapper.findAllComponents({ name: 'TreeItem' })
      const workflowTreeItem = treeItems.wrappers[0]
      // the workflow tree item node must not be active
      const workflowTreeItemNode = workflowTreeItem.find('div.node')
      expect(workflowTreeItemNode.classes('node--active')).to.equal(false)
      const workflowTreeItemNodeActivableSpan = workflowTreeItemNode.find('.node-data > span')
      workflowTreeItemNodeActivableSpan.trigger('click')
      await Vue.nextTick()
      expect(workflowTreeItemNode.classes('node--active')).to.equal(true)
    })
  })
  describe('Filter', () => {
    describe('Filter by name', () => {
      it('should not filter by name by default', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows: simpleWorkflowTree4Nodes[0].children
          }
        })
        expect(wrapper.vm.activeFilters).to.equal(null)
      })
      it('should filter by name', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows: simpleWorkflowTree4Nodes[0].children
          },
          data () {
            return {
              tasksFilter: {
                name: 'foo'
              }
            }
          }
        })
        expect(wrapper.vm.tasksFilter.name).to.equal('foo')
        expect(wrapper.vm.activeFilters).to.equal(null)
      })
    })
    describe('Filter by state', () => {
      it('should not filter by state by default', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows: simpleWorkflowTree4Nodes[0].children
          }
        })
        expect(wrapper.vm.activeFilters).to.equal(null)
      })
      it('should filter by name', () => {
        const states = [
          {
            value: TaskState.EXPIRED.name
          },
          {
            value: TaskState.SUBMIT_FAILED.name
          }]
        const wrapper = mountFunction({
          propsData: {
            workflows: simpleWorkflowTree4Nodes[0].children
          },
          data () {
            return {
              activeFilters: {
                states
              }
            }
          }
        })
        expect(wrapper.vm.activeFilters.states).to.equal(states)
      })
    })
    describe('Enable filters', () => {
      it('should not have any filters enabled by default', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows: simpleWorkflowTree4Nodes[0].children
          }
        })
        expect(wrapper.vm.activeFilters).to.equal(null)
      })
      it('should indicate filters are enabled if filtering by task name', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows: simpleWorkflowTree4Nodes[0].children
          },
          data () {
            return {
              tasksFilter: {
                name: 'foo'
              }
            }
          }
        })
        wrapper.vm.filterTasks()
        expect(wrapper.vm.activeFilters.name).to.equal('foo')
      })
      it('should indicate filters are enabled if filtering by task states', () => {
        const states = [
          TaskState.EXPIRED.name,
          TaskState.SUBMIT_FAILED.name
        ]
        const wrapper = mountFunction({
          propsData: {
            workflows: simpleWorkflowTree4Nodes[0].children
          },
          data () {
            return {
              tasksFilter: {
                states
              }
            }
          }
        })
        wrapper.vm.filterTasks()
        expect(wrapper.vm.activeFilters.states).to.deep.equal(states)
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
        propsData: {
          workflows: []
        }
      })
      expect(Object.keys(wrapper.vm.treeItemCache).length).to.equal(0)
      expect(wrapper.vm.activeCache.size).to.equal(0)
      expect(wrapper.vm.expandedCache.size).to.equal(0)
    })
    it('should add to the tree item cache', () => {
      const wrapper = mountFunction({
        propsData: {
          workflows: []
        }
      })
      const treeItem = createTreeItem('1', false)
      wrapper.vm.onTreeItemCreated(treeItem)
      expect(Object.keys(wrapper.vm.treeItemCache).length).to.equal(1)
      expect(wrapper.vm.activeCache.size).to.equal(0)
      expect(wrapper.vm.expandedCache.size).to.equal(0)
    })
    it('should remove from the tree item cache', () => {
      const wrapper = mountFunction({
        propsData: {
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
        propsData: {
          workflows: []
        }
      })
      const treeItem = createTreeItem('1', true)
      wrapper.vm.onTreeItemCreated(treeItem)
      expect(Object.keys(wrapper.vm.treeItemCache).length).to.equal(1)
      expect(wrapper.vm.activeCache.size).to.equal(0)
      expect(wrapper.vm.expandedCache.size).to.equal(1)
    })
    it('should remove from the expanded cache', () => {
      const wrapper = mountFunction({
        propsData: {
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
    // eslint-disable-next-line no-unused-vars
    const filterWorkflows = (item) => item.type === 'workflow'
    // eslint-disable-next-line no-unused-vars
    const filterCyclepoints = (item) => item.type === 'cyclepoint'
    // eslint-disable-next-line no-unused-vars
    const filterTaskProxies = (item) => item.type === 'task-proxy'
    it('should expand items', () => {
      // we clone the test data structures as the function mutates the objects
      const tests = [
        // everything is expanded
        {
          filterFunction: null,
          items: cloneDeep(mixed),
          expectedExpandedItems: 2
        },
        {
          filterFunction: null,
          items: cloneDeep(allExpanded),
          expectedExpandedItems: 2
        },
        {
          filterFunction: null,
          items: cloneDeep(allCollapsed),
          expectedExpandedItems: 2
        },
        // will expand the collapsed workflow (found with the filter)
        {
          filterFunction: filterWorkflows,
          items: cloneDeep(allCollapsed),
          expectedExpandedItems: 1
        },
        // workflow will stay collapsed
        {
          filterFunction: filterCyclepoints,
          items: cloneDeep(allCollapsed),
          expectedExpandedItems: 1
        },
        // filter won't find any task-proxies, so everything is still collapsed
        {
          filterFunction: filterTaskProxies,
          items: cloneDeep(allCollapsed),
          expectedExpandedItems: 0
        }
      ]
      tests.forEach(test => {
        const wrapper = mountFunction({
          propsData: {
            workflows: [],
            expandCollapseToggle: true
          },
          data () {
            return {
              treeItemCache: test.items
            }
          }
        })
        const filter = test.filterFunction
        const treeItemCache = wrapper.vm.treeItemCache

        wrapper.vm.expandAll(filter)
        expect(wrapper.vm.expanded).to.equal(true)

        const collection = filter ? [...Object.values(treeItemCache)].filter(filter) : Object.values(treeItemCache)
        for (const item of collection) {
          expect(item.isExpanded).to.equal(true)
        }
        expect([...Object.values(treeItemCache)].filter(
          item => item.isExpanded).length,
          `Failed case: ${JSON.stringify(test.items)}`)
          .to.equal(test.expectedExpandedItems)
      })
    })
    it('should collapse items', () => {
      // we clone the test data structures as the function mutates the objects
      const tests = [
        // everything is collapsed
        {
          filterFunction: null,
          items: cloneDeep(mixed),
          expectedCollapsedItems: 2
        },
        {
          filterFunction: null,
          items: cloneDeep(allExpanded),
          expectedCollapsedItems: 2
        },
        {
          filterFunction: null,
          items: cloneDeep(allCollapsed),
          expectedCollapsedItems: 2
        },
        // will collapse the expanded workflow (found with the filter)
        {
          filterFunction: filterWorkflows,
          items: cloneDeep(allExpanded),
          expectedCollapsedItems: 1
        },
        // workflow will stay expanded
        {
          filterFunction: filterCyclepoints,
          items: cloneDeep(allExpanded),
          expectedCollapsedItems: 1
        },
        // filter won't find any task-proxies, so everything is still expanded
        {
          filterFunction: filterTaskProxies,
          items: cloneDeep(allExpanded),
          expectedCollapsedItems: 0
        }
      ]
      tests.forEach(test => {
        const wrapper = mountFunction({
          propsData: {
            workflows: [],
            expandCollapseToggle: true
          },
          data () {
            return {
              treeItemCache: test.items
            }
          }
        })
        // the collapseAll rely on expandedCache being filled correctly
        Object.values(test.items).forEach(item => {
          if (item.isExpanded) {
            wrapper.vm.expandedCache.add(item)
          }
        })
        const filter = test.filterFunction
        const treeItemCache = wrapper.vm.treeItemCache

        wrapper.vm.collapseAll(filter)
        expect(wrapper.vm.expanded).to.equal(test.filterFunction !== null)

        const collection = filter ? [...Object.values(treeItemCache)].filter(filter) : Object.values(treeItemCache)
        for (const item of collection) {
          expect(item.isExpanded).to.equal(false)
        }
        expect([...Object.values(treeItemCache)].filter(
          item => !item.isExpanded).length,
          `Failed case: ${JSON.stringify(test.items)}`)
          .to.equal(test.expectedCollapsedItems)
      })
    })
  })
})
