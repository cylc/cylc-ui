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

describe('Tree component', () => {
  it('should display the tree with valid data', () => {
    const wrapper = mount(Tree, {
      propsData: {
        workflows: simpleWorkflowTree4Nodes,
        cycles: cycles
      }
    })
    expect(wrapper.props().workflows[0].node.__typename).to.equal('Workflow')
    expect(wrapper.contains('div')).to.equal(true)
  })
  describe('activable', () => {
    it('should not activate by default', () => {
      const wrapper = mount(Tree, {
        propsData: {
          workflows: simpleWorkflowTree4Nodes,
          cycles: cycles
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
          workflows: simpleWorkflowTree4Nodes,
          cycles: cycles,
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
