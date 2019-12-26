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
import { expect } from 'chai'
import Vue from 'vue'
// import vuetify here so that we do not have warnings in the console output
// eslint-disable-next-line no-unused-vars
import * as vuetify from '@/plugins/vuetify'
import Tree from '@/components/cylc/tree/Tree'
import { simpleWorkflowTree4Nodes } from './tree.data'

const cycles = new Map([
  [
    'user/workflow1',
    new Set([
      '20100101T0000Z'
    ])
  ]
])

describe.skip('Tree component', () => {
  it('should display the tree with valid data', () => {
    const wrapper = mount(Tree, {
      propsData: {
        workflows: simpleWorkflowTree4Nodes[0].children
      }
    })
    expect(wrapper.props().workflows[0].node.__typename).to.equal('CyclePoint')
    expect(wrapper.contains('div')).to.equal(true)
  })
  describe('activable', () => {
    it('should not activate by default', () => {
      const wrapper = mount(Tree, {
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
      const wrapper = mount(Tree, {
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
})
