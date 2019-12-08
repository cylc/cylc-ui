import { shallowMount } from '@vue/test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import Vue from 'vue'
// eslint-disable-next-line no-unused-vars
import * as vuetify from '@/plugins/vuetify'
import Workflow from '@/components/cylc/workflow/Workflow'
import { simpleWorkflowTree4Nodes } from '../tree/tree.data'
import { EventBus } from '@/components/cylc/workflow'

describe('Workflow component', () => {
  // TODO: Lumino is warning about "Host is not attached"
  it('should display the workflow with valid data', async () => {
    const wrapper = shallowMount(Workflow, {
      propsData: {
        workflowTree: simpleWorkflowTree4Nodes
      }
    })
    await Vue.nextTick()
    expect(wrapper.props().workflowTree[0].__type).to.equal('workflow')
    expect(wrapper.contains('div')).to.equal(true)
  })
  it('should add new tree widget ids', async () => {
    const wrapper = shallowMount(Workflow, {
      propsData: {
        workflowTree: simpleWorkflowTree4Nodes
      }
    })
    await Vue.nextTick()
    expect(wrapper.vm.$data.treeWidgetIds.length).to.equal(0)
    EventBus.$emit('add:tree')
    expect(wrapper.vm.$data.treeWidgetIds.length).to.equal(1)
  })
  it('should add new graph widget ids', async () => {
    const wrapper = shallowMount(Workflow, {
      propsData: {
        workflowTree: simpleWorkflowTree4Nodes
      }
    })
    await Vue.nextTick()
    expect(wrapper.vm.$data.graphWidgetIds.length).to.equal(0)
    EventBus.$emit('add:graph')
    expect(wrapper.vm.$data.graphWidgetIds.length).to.equal(1)
  })
  it('should remove event listeners', async () => {
    const spy = sinon.stub()
    // eslint-disable-next-line no-unused-vars
    const wrapper = shallowMount(Workflow, {
      propsData: {
        workflowTree: simpleWorkflowTree4Nodes
      },
      destroyed () {
        spy()
      }
    })
    await Vue.nextTick()
    expect(EventBus._events['add:tree']).to.not.equal(null)
    expect(EventBus._events['add:graph']).to.not.equal(null)
    wrapper.vm.$destroy()
    expect(spy.calledOnce)
    expect(EventBus._events['add:tree']).to.equal(null)
    expect(EventBus._events['add:graph']).to.equal(null)
  })
})
