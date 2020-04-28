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

import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import { expect } from 'chai'
// import vuetify here so that we do not have warnings in the console output
// eslint-disable-next-line no-unused-vars
import GScan from '@/components/cylc/gscan/GScan'
import { simpleWorkflowGscanNodes } from './gscan.data'

describe('GScan component', () => {
  it('should display the GScan with valid data', () => {
    const localVue = createLocalVue()
    localVue.prototype.$workflowService = {
      register: function () {
      },
      unregister: function () {
      },
      subscribe: function () {
      }
    }
    const wrapper = mount(GScan, {
      localVue,
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
    expect(summaries.get('five').get('succeeded').includes('foo.20130829T0000Z')).to.equal(true)
    expect(summaries.get('five').get('succeeded').includes('bar.20130829T0000Z')).to.equal(true)
    expect(summaries.get('five').get('succeeded').includes('foo.20130829T1200Z')).to.equal(true)
    expect(summaries.get('five').has('running')).to.equal(true)
    expect(summaries.get('five').get('running').includes('bar.20130829T1200Z')).to.equal(true)
    expect(summaries.get('five').get('running').includes('foo.20130830T0000Z')).to.equal(true)
  })
  it('should return elements in alphabetical order', () => {
    const localThis = {
      workflows: simpleWorkflowGscanNodes
    }
    const summaries = GScan.computed.workflowsSummaries.call(localThis)
    expect(summaries.get('five').get('succeeded').length).to.equal(3)
    expect(summaries.get('five').get('succeeded')[0]).to.equal('bar.20130829T0000Z')
    expect(summaries.get('five').get('succeeded')[1]).to.equal('foo.20130829T0000Z')
    expect(summaries.get('five').get('succeeded')[2]).to.equal('foo.20130829T1200Z')
  })
})
