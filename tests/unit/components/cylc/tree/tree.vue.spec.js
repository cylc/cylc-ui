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

const localVue = createLocalVue()

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
   * @returns {Tree}
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
    expect(wrapper.contains('div')).to.equal(true)
  })
  describe('activable', () => {
    it('should not activate by default', () => {
      const wrapper = mountFunction({
        propsData: {
          workflows: simpleWorkflowTree4Nodes[0].children
        }
      })
      const treeItems = wrapper.findAll({ name: 'TreeItem' })
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
      const treeItems = wrapper.findAll({ name: 'TreeItem' })
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
  describe('filter tree', () => {
    describe('filter by name', () => {
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
    describe('filter by state', () => {
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
    describe('enable filters', () => {
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
    describe('filter tree items', () => {
      it('should not filter the tree items by default', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows: simpleWorkflowTree4Nodes[0].children
          }
        })
        expect(wrapper.vm.$children.length).to.equal(4)
        const taskProxy = wrapper.vm.$children.find((child) => child.$options._componentTag === 'tree-item')
        expect(taskProxy).to.not.equal(null)
        // cycle point is displayed (list.filter(() => return filtered=true means OK, filtered=false means remove me)
        expect(taskProxy.filtered).to.equal(true)
        // task proxy is displayed
        expect(taskProxy.$children[0].filtered).to.equal(true)
      })
      it('should filter tree items by name', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows: simpleWorkflowTree4Nodes[0].children
          },
          data () {
            return {
              tasksFilter: {
                name: 'bar'
              }
            }
          }
        })
        // the task proxy in our test data is "foo", so "bar" filter should have removed it
        wrapper.vm.filterTasks()
        expect(wrapper.vm.$children.length).to.equal(4)
        const taskProxy = wrapper.vm.$children.find((child) => child.$options._componentTag === 'tree-item')
        expect(taskProxy).to.not.equal(null)
        // cycle point is displayed (list.filter(() => return filtered=true means OK, filtered=false means remove me)
        expect(taskProxy.filtered).to.equal(false)
        // task proxy is displayed
        expect(taskProxy.$children[0].filtered).to.equal(false)
      })
      it('should remove all filters', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows: simpleWorkflowTree4Nodes[0].children
          },
          data () {
            return {
              tasksFilter: {
                name: 'bar'
              }
            }
          }
        })
        // the task proxy in our test data is "foo", so "bar" filter should have removed it
        wrapper.vm.filterTasks()
        expect(wrapper.vm.$children.length).to.equal(4)
        const taskProxy = wrapper.vm.$children.find((child) => child.$options._componentTag === 'tree-item')
        expect(taskProxy).to.not.equal(null)
        // cycle point is displayed (list.filter(() => return filtered=true means OK, filtered=false means remove me)
        expect(taskProxy.filtered).to.equal(false)
        // task proxy is displayed
        expect(taskProxy.$children[0].filtered).to.equal(false)
        wrapper.vm.removeAllFilters()
        // cycle point is displayed (list.filter(() => return filtered=true means OK, filtered=false means remove me)
        expect(taskProxy.filtered).to.equal(true)
        // task proxy is displayed
        expect(taskProxy.$children[0].filtered).to.equal(true)
      })
    })
  })
})
