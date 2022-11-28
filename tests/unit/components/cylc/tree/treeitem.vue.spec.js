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
import { Assertion, expect } from 'chai'
import Vuetify from 'vuetify/lib'
// import vuetify here so that we do not have warnings in the console output
// eslint-disable-next-line no-unused-vars
import * as vuetify from '@/plugins/vuetify'
import TreeItem from '@/components/cylc/tree/TreeItem'
import {
  simpleWorkflowNode,
  simpleCyclepointNode,
  simpleTaskNode
} from './tree.data'
import CylcObjectPlugin from '@/components/cylc/cylcObject/plugin'

/**
 * Helper function for expecting TreeItem to be expanded.
 * Usage:
 *   expect(wrapper).to.be.expanded()
 *   // or expect it to be collapsed:
 *   expect(wrapper).to.not.be.expanded()
 */
Assertion.addMethod('expanded', function () {
  // this._obj is the TreeItem Wrapper
  const wrapper = this._obj
  this.assert(
    wrapper.vm.isExpanded === true,
    'expected the isExpanded data property to be true',
    'expected the isExpanded data property to be false'
  )
  const nodeDiv = wrapper.find('.node')
  this.assert(
    nodeDiv.classes('expanded') === true,
    'expected the .node DOM element to have the "expanded" class',
    'expected the .node DOM element not to have the "expanded" class'
  )
})

const localVue = createLocalVue()
// load cylc-object directive
localVue.prototype.$workflowService = {
  mutationsAndTypes: Promise.resolve({
    mutations: [],
    types: []
  })
}
localVue.prototype.$eventBus = {
  emit: () => {}
}
localVue.use(CylcObjectPlugin)

describe('TreeItem component', () => {
  const mountFunction = options => {
    return mount(TreeItem, {
      localVue,
      vuetify: new Vuetify(),
      propsData: {
        node: simpleWorkflowNode
      },
      listeners: {
        'tree-item-created': () => {},
        'tree-item-destroyed': () => {},
        'tree-item-expanded': () => {},
        'tree-item-collapsed': () => {},
        'tree-item-clicked': () => {}
      },
      ...options
    })
  }
  it('should display the treeitem with valid data', () => {
    const wrapper = mountFunction()
    expect(wrapper.props().node.node.__typename).to.equal('Workflow')
    expect(wrapper.vm.$data.filtered).to.equal(true)
  })

  describe('expanded', () => {
    // using simpleJobNode as it has only one child so it is easier/quicker to test
    it('should expand nodes when configured', () => {
      let wrapper = mountFunction({
        propsData: {
          node: simpleCyclepointNode,
          autoExpandTypes: ['cycle']
        }
      })
      expect(wrapper).to.be.expanded()

      wrapper = mountFunction({
        propsData: {
          node: simpleTaskNode,
          autoExpandTypes: ['cycle']
        }
      })
      expect(wrapper).to.not.be.expanded()
    })
  })

  describe('expand/collapse button click', () => {
    const wrapper = mountFunction({
      propsData: {
        node: simpleTaskNode,
        initialExpanded: false
      }
    })
    expect(wrapper).to.not.be.expanded()
    const expandCollapseBtn = wrapper.find('.node-expand-collapse-button')
    it('should expand if currently collapsed', async () => {
      await expandCollapseBtn.trigger('click')
      expect(wrapper).to.be.expanded()
    })
    it('should collapse if currently expanded', async () => {
      await expandCollapseBtn.trigger('click')
      expect(wrapper).to.not.be.expanded()
    })
  })

  describe('children', () => {
    it('should recursively include other TreeItem components for its children', () => {
      const wrapper = mountFunction({
        propsData: {
          node: simpleWorkflowNode
        }
      })
      const task = wrapper.findAllComponents({ name: 'TreeItem' })
      // 5 TreeItem components, 1 for workflow, 1 for cyclepoint, 1 for task, 1 for job, 1 for job-details
      expect(task.length).to.equal(5)
    })
  // })
  // describe('mixin', () => {
  //   const sortTestsData = [
  //     // invalid values
  //     {
  //       args: {
  //         type: '',
  //         children: []
  //       },
  //       expected: []
  //     },
  //     {
  //       args: {
  //         type: null,
  //         children: null
  //       },
  //       expected: null
  //     },
  //     // workflow children (cycle points) are sorted by ID in descending order
  //     {
  //       args: {
  //         type: 'workflow',
  //         children: [
  //           { id: 'workflow//1' },
  //           { id: 'workflow//2' }
  //         ]
  //       },
  //       expected: [
  //         { id: 'workflow//2' },
  //         { id: 'workflow//1' }
  //       ]
  //     },
  //     // cycle point children (family proxies and task proxies) are sorted by type in ascending order, and then name in ascending order
  //     {
  //       args: {
  //         type: 'cyclepoint',
  //         children: [
  //           { node: { name: 'foo' }, type: 'task-proxy' },
  //           { node: { name: 'FAM1' }, type: 'family-proxy' },
  //           { node: { name: 'bar' }, type: 'task-proxy' }
  //         ]
  //       },
  //       expected: [
  //         { node: { name: 'FAM1' }, type: 'family-proxy' },
  //         { node: { name: 'bar' }, type: 'task-proxy' },
  //         { node: { name: 'foo' }, type: 'task-proxy' }
  //       ]
  //     },
  //     // family proxy children (family proxies and task proxies) are sorted by type in ascending order, and then name in ascending order
  //     {
  //       args: {
  //         type: 'family-proxy',
  //         children: [
  //           { node: { name: 'foo' }, type: 'task-proxy' },
  //           { node: { name: 'FAM1' }, type: 'family-proxy' },
  //           { node: { name: 'bar' }, type: 'task-proxy' }
  //         ]
  //       },
  //       expected: [
  //         { node: { name: 'FAM1' }, type: 'family-proxy' },
  //         { node: { name: 'bar' }, type: 'task-proxy' },
  //         { node: { name: 'foo' }, type: 'task-proxy' }
  //       ]
  //     },
  //     {
  //       args: {
  //         type: 'family-proxy',
  //         children: [
  //           { node: { name: 'f01' }, type: 'task-proxy' },
  //           { node: { name: 'f1' }, type: 'task-proxy' },
  //           { node: { name: 'f10' }, type: 'task-proxy' },
  //           { node: { name: 'f0' }, type: 'task-proxy' },
  //           { node: { name: 'f2' }, type: 'task-proxy' }
  //         ]
  //       },
  //       expected: [
  //         { node: { name: 'f0' }, type: 'task-proxy' },
  //         { node: { name: 'f01' }, type: 'task-proxy' },
  //         { node: { name: 'f1' }, type: 'task-proxy' },
  //         { node: { name: 'f2' }, type: 'task-proxy' },
  //         { node: { name: 'f10' }, type: 'task-proxy' }
  //       ]
  //     },
  //     // task proxy children (jobs) are sorted by job submit number in descending order
  //     {
  //       args: {
  //         type: 'task-proxy',
  //         children: [
  //           { node: { submitNum: '2' } },
  //           { node: { submitNum: '1' } },
  //           { node: { submitNum: '3' } }
  //         ]
  //       },
  //       expected: [
  //         { node: { submitNum: '3' } },
  //         { node: { submitNum: '2' } },
  //         { node: { submitNum: '1' } }
  //       ]
  //     }
  //   ]
  //   sortTestsData.forEach((test) => {
  //     it('should order elements correctly', () => {
  //       const sorted = treeitem.methods.sortedChildren(test.args.type, test.args.children)
  //       expect(sorted).to.deep.equal(test.expected)
  //     })
  //   })
  })
})
