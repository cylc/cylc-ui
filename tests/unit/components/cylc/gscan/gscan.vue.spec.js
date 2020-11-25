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

const localVue = createLocalVue()
localVue.prototype.$workflowService = {
  register: function () {
  },
  unregister: function () {
  },
  subscribe: function () {
  }
}

describe('GScan component', () => {
  const mountFunction = options => {
    return mount(GScan, {
      localVue,
      stubs: {
        RouterLink: RouterLinkStub
      },
      ...options
    })
  }
  it('should display a skeleton loader if loading data', () => {
    const wrapper = mountFunction({
      propsData: {
        workflows: simpleWorkflowGscanNodes
      },
      data () {
        return {
          isLoading: true
        }
      }
    })
    const skeletonLoader = wrapper.find('.v-skeleton-loader')
    const isBusy = skeletonLoader.element.getAttribute('aria-busy')
    expect(isBusy).to.equal('true')
  })
  it('should display the GScan with valid data', () => {
    const wrapper = mountFunction({
      propsData: {
        workflows: simpleWorkflowGscanNodes
      },
      data () {
        return {
          isLoading: false
        }
      }
    })
    expect(wrapper.props().workflows[0].name).to.equal('five')
    expect(wrapper.find('div')).to.not.equal(null)
    expect(wrapper.html()).to.contain('five')
  })
  describe('Sorting', () => {
    it('should display workflows in alphabetical order', () => {
      const wrapper = mountFunction({
        propsData: {
          workflows: [
            { id: '1', name: 'a', status: 'running' },
            { id: '5', name: 'e', status: 'running' },
            { id: '3', name: 'c', status: 'running' },
            { id: '2', name: 'b', status: 'running' },
            { id: '4', name: 'd', status: 'running' }
          ]
        },
        data () {
          return {
            isLoading: false
          }
        }
      })
      const workflowsElements = wrapper.findAll('.c-gscan-workflow')
      expect(workflowsElements.length).to.equal(5)
      expect(workflowsElements.at(0).element.textContent).to.equal('a')
      expect(workflowsElements.at(1).element.textContent).to.equal('b')
      expect(workflowsElements.at(2).element.textContent).to.equal('c')
      expect(workflowsElements.at(3).element.textContent).to.equal('d')
      expect(workflowsElements.at(4).element.textContent).to.equal('e')
    })
    it('should display running workflows first, then held, then stopped', () => {
      const wrapper = mountFunction({
        propsData: {
          workflows: [
            { id: '1', name: 'a', status: 'held' },
            { id: '5', name: 'e', status: 'running' },
            { id: '3', name: 'c', status: 'stopped' },
            { id: '2', name: 'b', status: 'stopped' },
            { id: '4', name: 'd', status: 'stopped' }
          ]
        },
        data () {
          return {
            isLoading: false
          }
        }
      })
      const workflowsElements = wrapper.findAll('.c-gscan-workflow')
      expect(workflowsElements.length).to.equal(5)
      expect(workflowsElements.at(0).element.textContent).to.equal('a')
      expect(workflowsElements.at(1).element.textContent).to.equal('e')
      expect(workflowsElements.at(2).element.textContent).to.equal('b')
      expect(workflowsElements.at(3).element.textContent).to.equal('c')
      expect(workflowsElements.at(4).element.textContent).to.equal('d')
    })
    it('should display alphabetically even with mixed statuses', () => {
      const wrapper = mountFunction({
        propsData: {
          workflows: [
            { id: '5', name: 'e', status: 'held' },
            { id: '1', name: 'a', status: 'held' },
            { id: '3', name: 'c', status: 'stopped' },
            { id: '2', name: 'b', status: 'running' },
            { id: '4', name: 'd', status: 'stopped' }
          ]
        },
        data () {
          return {
            isLoading: false
          }
        }
      })
      const workflowsElements = wrapper.findAll('.c-gscan-workflow')
      expect(workflowsElements.length).to.equal(5)
      expect(workflowsElements.at(0).element.textContent).to.equal('a')
      expect(workflowsElements.at(1).element.textContent).to.equal('b')
      expect(workflowsElements.at(2).element.textContent).to.equal('e')
      expect(workflowsElements.at(3).element.textContent).to.equal('c')
      expect(workflowsElements.at(4).element.textContent).to.equal('d')
    })
    it('should display alphabetically even with mixed statuses', () => {
      const wrapper = mountFunction({
        propsData: {
          workflows: [
            { id: '5', name: 'e', status: 'held' },
            { id: '1', name: 'a', status: 'held' },
            { id: '3', name: 'c', status: 'stopped' },
            { id: '2', name: 'b', status: 'running' },
            { id: '4', name: 'd', status: 'stopped' }
          ]
        },
        data () {
          return {
            isLoading: false
          }
        }
      })
      const workflowsElements = wrapper.findAll('.c-gscan-workflow')
      expect(workflowsElements.length).to.equal(5)
      expect(workflowsElements.at(0).element.textContent).to.equal('a')
      expect(workflowsElements.at(1).element.textContent).to.equal('b')
      expect(workflowsElements.at(2).element.textContent).to.equal('e')
      expect(workflowsElements.at(3).element.textContent).to.equal('c')
      expect(workflowsElements.at(4).element.textContent).to.equal('d')
    })
  })
  describe('Workflow Summary', () => {
    let localThis
    beforeEach(() => {
      localThis = {
        workflows: simpleWorkflowGscanNodes
      }
    })
    it('should correctly calculate the workflow summary', () => {
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
      const summaries = GScan.computed.workflowsSummaries.call(localThis)
      expect(summaries.get('five').get('succeeded').length).to.equal(3)
      expect(summaries.get('five').get('succeeded')[0]).to.equal('bar.20130829T0000Z')
      expect(summaries.get('five').get('succeeded')[1]).to.equal('foo.20130829T0000Z')
      expect(summaries.get('five').get('succeeded')[2]).to.equal('foo.20130829T1200Z')
    })
  })
})
