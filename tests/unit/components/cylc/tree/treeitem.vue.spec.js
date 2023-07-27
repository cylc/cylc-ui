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
import { Assertion } from 'chai'
import { createVuetify } from 'vuetify'
import sinon from 'sinon'
import TreeItem from '@/components/cylc/tree/TreeItem.vue'
import {
  stateTotalsTestWorkflowNodes,
  simpleWorkflowNode,
  simpleCyclepointNode,
  simpleTaskNode
} from './tree.data'
import CylcObjectPlugin from '@/components/cylc/cylcObject/plugin'
import WorkflowService from '@/services/workflow.service'

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

const $workflowService = sinon.createStubInstance(WorkflowService)
const $eventBus = {
  emit: () => {}
}

describe('TreeItem component', () => {
  const mountFunction = (options) => mount(TreeItem, {
    global: {
      plugins: [createVuetify(), CylcObjectPlugin],
      mock: { $workflowService, $eventBus }
    },
    props: {
      node: simpleWorkflowNode
    },
    ...options
  })

  it('should display the treeitem with valid data', () => {
    const wrapper = mountFunction()
    expect(wrapper.props().node.node.__typename).to.equal('Workflow')
    expect(wrapper.vm.$data.filtered).to.equal(true)
  })

  describe('expanded', () => {
    // using simpleJobNode as it has only one child so it is easier/quicker to test
    it('should expand nodes when configured', () => {
      let wrapper = mountFunction({
        props: {
          node: simpleCyclepointNode,
          autoExpandTypes: ['cycle']
        }
      })
      expect(wrapper).to.be.expanded()

      wrapper = mountFunction({
        props: {
          node: simpleTaskNode,
          autoExpandTypes: ['cycle']
        }
      })
      expect(wrapper).to.not.be.expanded()
    })
  })

  describe('expand/collapse button click', () => {
    const wrapper = mountFunction({
      props: {
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
  describe('computed properties', () => {
    const wrapper = mountFunction({
      props: {
        node: stateTotalsTestWorkflowNodes,
        initialExpanded: false,
        autoCollapse: true,
        autoExpandTypes: ['workflow-part', 'workflow']
      }
    })
    it('should combine all descendant tasks', () => {
      expect(wrapper.vm.latestDescendantTasks.submitted.length).to.equal(10)
      expect(wrapper.vm.latestDescendantTasks.running.length).to.equal(10)
    })
    it('should combine all descendant task totals', () => {
      expect(wrapper.vm.descendantTaskTotals.submitted).to.equal(5)
      expect(wrapper.vm.descendantTaskTotals.running).to.equal(12)
    })
    it('should get the lowest only-child', () => {
      expect(wrapper.vm.lastSingleDescendant.id).to.equal('~cylc/double/mid')
    })
    // note this only generates a label until the first branch it encounters when recursing
    it('should get the correct label as a parent', () => {
      expect(wrapper.vm.collapsedLabel).to.equal('double/mid')
    })
    it('should not auto collapse if the children branch', () => {
      expect(wrapper.vm.autoCollapse).to.equal(false)
    })
    it('should be initially expanded', () => {
      expect(wrapper.vm.isExpanded).to.equal(true)
    })
  })
  describe('computed properties as workflow', () => {
    const wrapper = mountFunction({
      props: {
        node: stateTotalsTestWorkflowNodes.children[0].children[0],
        initialExpanded: false,
        autoCollapse: true,
        autoExpandTypes: ['workflow-part', 'workflow']
      }
    })
    it('should get the correct label as a child', () => {
      expect(wrapper.vm.collapsedLabel).to.equal('first/run1')
    })
    it('should auto collapse if the children do not branch', () => {
      expect(wrapper.vm.autoCollapse).to.equal(true)
    })
    it('should be initially collapsed as its non-branching', () => {
      expect(wrapper.vm.isExpanded).to.equal(false)
    })
  })
  describe('children', () => {
    it('should recursively include other TreeItem components for its children', () => {
      const wrapper = mountFunction({
        props: {
          node: simpleWorkflowNode
        }
      })
      expect(
        wrapper.findAllComponents({ name: 'TreeItem' })
          .map((w) => w.props().node.node.__typename)
      ).to.deep.equal([
        'CyclePoint',
        'TaskProxy',
        'Job',
        'Job' // job details
      ])
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
