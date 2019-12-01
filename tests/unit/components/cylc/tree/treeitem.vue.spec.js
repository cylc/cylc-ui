// we mount the tree to include the TreeItem component and other vuetify children components
import { mount } from '@vue/test-utils'
import { expect } from 'chai'
// import vuetify here so that we do not have warnings in the console output
// eslint-disable-next-line no-unused-vars
import * as vuetify from '@/plugins/vuetify'
import TreeItem from '@/components/cylc/TreeItem'
import {
  simpleWorkflowNode,
  simpleCyclepointNode,
  simpleTaskNode
} from './tree.data'

describe('TreeItem component', () => {
  it('should display the treeitem with valid data', () => {
    const wrapper = mount(TreeItem, {
      propsData: {
        node: simpleWorkflowNode
      }
    })
    expect(wrapper.props().node.__type).to.equal('workflow')
  })
  describe('expanded', () => {
    // using simpleJobNode as it has only one child so it is easier/quicker to test
    it('should display the cycle point expanded by default', () => {
      const wrapper = mount(TreeItem, {
        propsData: {
          node: simpleCyclepointNode,
          minDepth: 0,
          depth: 0
        }
      })
      expect(wrapper.props().initialExpanded).to.equal(true)
      const expandControlElement = wrapper.find('.node-expand-collapse-button')
      expect(expandControlElement.text()).to.equal('▽')
    })
    it('should not display the cycle point expanded when set expanded=true', () => {
      const wrapper = mount(TreeItem, {
        propsData: {
          node: simpleTaskNode,
          initialExpanded: false
        }
      })
      expect(wrapper.props().initialExpanded).to.equal(false)
      const expandControlElement = wrapper.find('.node-expand-collapse-button')
      expect(expandControlElement.text()).to.equal('▷')
    })
    it('should not display the task expanded by default', () => {
      const wrapper = mount(TreeItem, {
        propsData: {
          node: simpleTaskNode,
          minDepth: 0,
          depth: 0
        }
      })
      expect(wrapper.props().initialExpanded).to.equal(true)
      const expandControlElement = wrapper.find('.node-expand-collapse-button')
      expect(expandControlElement.text()).to.equal('▷')
    })
  })
  describe('children', () => {
    it('should recursively include other TreeItem components for its children', () => {
      const wrapper = mount(TreeItem, {
        propsData: {
          node: simpleWorkflowNode
        }
      })
      const task = wrapper.findAll({ name: 'TreeItem' })
      // 4 TreeItem components, 1 for workflow, 1 for cyclepoint, 1 for task, 1 for job
      expect(task.length).to.equal(4)
    })
  })
})
