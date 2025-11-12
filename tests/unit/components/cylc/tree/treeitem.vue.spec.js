/*
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
import GScanTreeItem from '@/components/cylc/tree/GScanTreeItem.vue'
import {
  stateTotalsTestWorkflowNodes,
  simpleWorkflowNode,
  simpleCyclepointNode,
  simpleTaskNode
} from './tree.data'
import CommandMenuPlugin from '@/components/cylc/commandMenu/plugin'
import WorkflowService from '@/services/workflow.service'
import { flattenWorkflowParts } from '@/components/cylc/gscan/sort'

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

describe('TreeItem component', () => {
  const mountFunction = (options) => mount(TreeItem, {
    global: {
      plugins: [createVuetify(), CommandMenuPlugin],
      mock: { $workflowService }
    },
    ...options
  })

  it('should display the treeitem with valid data', () => {
    const wrapper = mountFunction({
      props: {
        node: simpleWorkflowNode,
        filteredOutNodesCache: new WeakMap(),
      },
    })
    expect(wrapper.props().node.node.__typename).to.equal('Workflow')
  })

  describe('expanded', () => {
    it.each([
      [simpleCyclepointNode, true],
      [simpleTaskNode, false],
    ])('should expand nodes when configured %#', (node, expected) => {
      const wrapper = mountFunction({
        props: {
          node,
          filteredOutNodesCache: new WeakMap(),
          autoExpandTypes: ['cycle']
        }
      })
      expected
        ? expect(wrapper).to.be.expanded()
        : expect(wrapper).to.not.be.expanded()
    })
  })

  describe('expand/collapse button click', () => {
    const wrapper = mountFunction({
      props: {
        node: simpleTaskNode,
        filteredOutNodesCache: new WeakMap(),
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
    it.each([
      { autoExpandTypes: undefined, expected: ['CyclePoint', 'TaskProxy'] },
      { autoExpandTypes: ['workflow', 'cycle', 'family', 'task'], expected: ['CyclePoint', 'TaskProxy', 'Job', 'Job'] },
      { autoExpandTypes: ['workflow'], expected: ['CyclePoint'] },
      { autoExpandTypes: [], expected: [] },
    ])('recursively mounts child TreeItems ($autoExpandTypes)', ({ autoExpandTypes, expected }) => {
      const wrapper = mountFunction({
        props: {
          node: simpleWorkflowNode,
          filteredOutNodesCache: new WeakMap(),
          autoExpandTypes,
        },
      })
      expect(
        wrapper.findAllComponents({ name: 'TreeItem' })
          .map((vm) => vm.props().node.node.__typename)
      ).to.deep.equal(expected)
    })
  })
})

describe('GScanTreeItem', () => {
  const mountFunction = (options) => mount(GScanTreeItem, {
    global: {
      plugins: [createVuetify(), CommandMenuPlugin],
      mock: { $workflowService }
    },
    ...options
  })

  describe('computed properties', () => {
    const wrapper = mountFunction({
      props: {
        node: flattenWorkflowParts(stateTotalsTestWorkflowNodes),
        filteredOutNodesCache: new WeakMap(),
      }
    })
    it('does not combine descendant latest state tasks', () => {
      expect(wrapper.vm.statesInfo.latestTasks).to.deep.equal({})
    })
    it('combines all descendant task totals', () => {
      expect(wrapper.vm.statesInfo.stateTotals.submitted).to.equal(5)
      expect(wrapper.vm.statesInfo.stateTotals.running).to.equal(12)
    })
    it('collapses to the lowest only-child', () => {
      expect(wrapper.vm.node.id).to.equal('~cylc/double/mid')
      expect(wrapper.vm.node.name).to.equal('double/mid')
      // This should be expanded initially as it contains multiple workflows
      expect(wrapper.vm.$refs.treeItem.isExpanded).to.equal(true)
    })
  })

  describe('Workflow link', () => {
    it('should create an empty link for non-workflow nodes', () => {
      const wrapper = mountFunction({
        props: {
          node: {
            type: 'barbenheimer',
          },
          filteredOutNodesCache: new WeakMap(),
        },
        shallow: true,
      })
      expect(wrapper.vm.workflowLink).to.equal('')
    })
    it('should create a link for a workflow node', () => {
      const wrapper = mountFunction({
        props: {
          node: {
            type: 'workflow',
            tokens: { workflow: 'a/b/c' }
          },
          filteredOutNodesCache: new WeakMap(),
        },
        shallow: true,
      })
      expect(wrapper.vm.workflowLink).to.equal('/workspace/a/b/c')
    })
  })
})
