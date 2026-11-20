/*
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

// we mount the tree to include the TreeItem component and other vuetify children components
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import TreeItem from '@/components/cylc/tree/TreeItem.vue'
import GScanTreeItem from '@/components/cylc/tree/GScanTreeItem.vue'
import {
  stateTotalsTestWorkflowNodes,
  simpleWorkflowNode,
  simpleCyclepointNode,
  simpleTaskNode,
} from './tree.data'
import CommandMenuPlugin from '@/components/cylc/commandMenu/plugin'
import { flattenWorkflowParts } from '@/components/cylc/gscan/sort'
import TaskState from '@/model/TaskState.model'
import { vuetifyOptions } from '@/plugins/vuetify'
import { merge } from 'lodash-es'

const vuetify = createVuetify(vuetifyOptions)

/**
 * Matcher for expecting a TreeItem wrapper to be expanded.
 * Usage:
 *   expect(wrapper).toBeExpanded()
 *   // or expect it to be collapsed:
 *   expect(wrapper).not.toBeExpanded()
 */
expect.extend({
  toBeExpanded (wrapper) {
    // Extract primitive values only; never hand the wrapper/vm proxy itself
    // to the message/diff machinery or it will trip Vue's ownKeys warning.
    const { isExpanded } = wrapper.vm
    const hasExpandedClass = wrapper.find('.node').classes('expanded')
    const pass = isExpanded === true && hasExpandedClass === true
    return {
      pass,
      message: () =>
        `expected isExpanded to be ${this.isNot ? 'false' : 'true'} (got ${isExpanded}) ` +
        `and the .node element ${this.isNot ? 'not ' : ''}to have the "expanded" class (got ${hasExpandedClass})`,
    }
  },
})

describe('TreeItem component', () => {
  const mountFunction = (options) => mount(TreeItem, {
    global: {
      plugins: [vuetify, CommandMenuPlugin],
    },
    ...options,
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
          autoExpandTypes: ['cycle'],
        },
      })
      expected
        ? expect(wrapper).toBeExpanded()
        : expect(wrapper).not.toBeExpanded()
    })
  })

  describe('expand/collapse button', () => {
    it('expands/collapses', async () => {
      const wrapper = mountFunction({
        props: {
          node: simpleTaskNode,
          filteredOutNodesCache: new WeakMap(),
        },
      })
      expect(wrapper).not.toBeExpanded()
      const expandCollapseBtn = wrapper.find('.node-expand-collapse-button')
      await expandCollapseBtn.trigger('click')
      expect(wrapper).toBeExpanded()
      await expandCollapseBtn.trigger('click')
      expect(wrapper).not.toBeExpanded()
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
  const mountFunction = (options) => mount(GScanTreeItem, merge(
    {
      global: {
        plugins: [vuetify, CommandMenuPlugin],
      },
      props: {
        filteredOutNodesCache: new WeakMap(),
      },
    },
    options
  ))

  describe('computed properties', () => {
    it('has statesInfo', () => {
      const wrapper = mountFunction({
        props: {
          node: flattenWorkflowParts(stateTotalsTestWorkflowNodes),
        },
        shallow: true,
      })
      // does not combine descendant latest state tasks:
      expect(wrapper.vm.statesInfo.latestTasks).toStrictEqual({})
      // combines all descendant task totals in the correct order:
      expect(Object.entries(wrapper.vm.statesInfo.stateTotals)).toStrictEqual([
        [TaskState.FAILED.name, 0],
        [TaskState.SUBMIT_FAILED.name, 0],
        [TaskState.SUBMITTED.name, 5],
        [TaskState.RUNNING.name, 12],
      ])
    })

    it('collapses to the lowest only-child', () => {
      const wrapper = mountFunction({
        props: {
          node: flattenWorkflowParts(stateTotalsTestWorkflowNodes),
        },
      })
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
            tokens: { workflow: 'a/b/c' },
          },
        },
        shallow: true,
      })
      expect(wrapper.vm.workflowLink).to.equal('/workspace/a/b/c')
    })
  })
})
