import { mount, RouterLinkStub } from '@vue/test-utils'
import { expect } from 'chai'
// import vuetify here so that we do not have warnings in the console output
// eslint-disable-next-line no-unused-vars
import * as vuetify from '@/plugins/vuetify'
import GScan from '@/components/cylc/GScan'
import { simpleWorkflowGscanNodes } from './gscan.data'

describe('GScan component', () => {
  it('should display the GScan with valid data', () => {
    const wrapper = mount(GScan, {
      propsData: {
        workflows: simpleWorkflowGscanNodes
      },
      stubs: {
        RouterLink: RouterLinkStub
      }
    })
    expect(wrapper.props().workflows[0].name).to.equal('five')
    expect(wrapper.contains('div')).to.equal(true)
    expect(wrapper.html()).to.contain('<div class="flex grow">five</div>')
  })
  it('should correctly calculate the workflow summary', () => {
    const localThis = {
      workflows: simpleWorkflowGscanNodes
    }
    const summaries = GScan.computed.workflowsSummaries.call(localThis)
    expect(summaries.size).to.equal(1)
    expect(summaries.has('five')).to.equal(true)
    expect(summaries.get('five').has('succeeded')).to.equal(true)
    expect(summaries.get('five').get('succeeded').has('foo.20130829T0000Z')).to.equal(true)
    expect(summaries.get('five').get('succeeded').has('bar.20130829T0000Z')).to.equal(true)
    expect(summaries.get('five').get('succeeded').has('foo.20130829T1200Z')).to.equal(true)
    expect(summaries.get('five').has('running')).to.equal(true)
    expect(summaries.get('five').get('running').has('bar.20130829T1200Z')).to.equal(true)
    expect(summaries.get('five').get('running').has('foo.20130830T0000Z')).to.equal(true)
  })
})
