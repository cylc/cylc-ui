import { shallowMount } from '@vue/test-utils'
import { expect } from 'chai'
import Vue from 'vue'
// eslint-disable-next-line no-unused-vars
import * as vuetify from '@/plugins/vuetify'
import Workflow from '@/components/cylc/workflow/Workflow'
import { simpleWorkflowTree4Nodes } from '../tree/tree.data'

describe('Workflow component', () => {
  // TODO: Lumino is warning about "Host is not attached"
  it('should display the workflow with valid data', async () => {
    const wrapper = shallowMount(Workflow, {
      propsData: {
        workflowTree: simpleWorkflowTree4Nodes
      }
    })
    await Vue.nextTick()
    expect(wrapper.props().workflowTree[0].node.__typename).to.equal('Workflow')
    expect(wrapper.contains('div')).to.equal(true)
  })
})
