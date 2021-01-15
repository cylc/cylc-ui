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
import TreeItem from '@/components/cylc/tree/TreeItem'
import { simpleWorkflowGscanNodes } from './gscan.data'
import WorkflowState from '@/model/WorkflowState.model'
import TaskState from '@/model/TaskState.model'

global.requestAnimationFrame = cb => cb()

const localVue = createLocalVue()
localVue.prototype.$workflowService = {
  register: function () {
  },
  unregister: function (obj) {
    // we will reset the subscriptions object so tests can confirm
    // this function has been called
    obj.subscriptions = {}
  },
  subscribe: function (obj, name) {
    return true
  },
  unsubscribe: function () {
  }
}

describe('GScan component', () => {
  /**
   * @param options
   * @returns {Wrapper<GScan>}
   */
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
  it('should set loading state', () => {
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
    expect(wrapper.vm.isLoading).to.equal(false)
    wrapper.vm.setActive(false)
    expect(wrapper.vm.isLoading).to.equal(true)
  })
  it('should unregister before being destroyed', () => {
    const wrapper = mountFunction({
      propsData: {
        workflows: []
      }
    })
    expect(wrapper.vm.subscriptions.root).to.equal(true)
    wrapper.vm.$destroy()
    expect(wrapper.vm.subscriptions.root).to.equal(undefined)
  })
  describe('Sorting', () => {
    it('should display workflows in alphabetical order', () => {
      const wrapper = mountFunction({
        propsData: {
          workflows: [
            { id: 'user|a', name: 'a', status: 'running' },
            { id: 'user|e', name: 'e', status: 'running' },
            { id: 'user|c', name: 'c', status: 'running' },
            { id: 'user|b', name: 'b', status: 'running' },
            { id: 'user|d', name: 'd', status: 'running' }
          ]
        },
        data () {
          return {
            isLoading: false
          }
        }
      })
      const workflowsElements = wrapper.findAllComponents(TreeItem)
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
            { id: 'user|e', name: 'e', status: 'held' },
            { id: 'user|a', name: 'a', status: 'running' },
            { id: 'user|c', name: 'c', status: 'stopped' },
            { id: 'user|b', name: 'b', status: 'stopped' },
            { id: 'user|d', name: 'd', status: 'stopped' }
          ]
        },
        data () {
          return {
            isLoading: false
          }
        }
      })
      const workflowsElements = wrapper.findAllComponents(TreeItem)
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
            { id: 'user|e', name: 'e', status: 'held' },
            { id: 'user|a', name: 'a', status: 'held' },
            { id: 'user|c', name: 'c', status: 'stopped' },
            { id: 'user|b', name: 'b', status: 'running' },
            { id: 'user|d', name: 'd', status: 'stopped' }
          ]
        },
        data () {
          return {
            isLoading: false
          }
        }
      })
      const workflowsElements = wrapper.findAllComponents(TreeItem)
      expect(workflowsElements.length).to.equal(5)
      expect(workflowsElements.at(0).element.textContent).to.equal('b')
      expect(workflowsElements.at(1).element.textContent).to.equal('a')
      expect(workflowsElements.at(2).element.textContent).to.equal('e')
      expect(workflowsElements.at(3).element.textContent).to.equal('c')
      expect(workflowsElements.at(4).element.textContent).to.equal('d')
    })
    it('should display alphabetically even with mixed statuses', () => {
      const wrapper = mountFunction({
        propsData: {
          workflows: [
            { id: 'user|a', name: 'a', status: 'held' },
            { id: 'user|c', name: 'c', status: 'stopped' },
            { id: 'user|b', name: 'b', status: 'running' },
            { id: 'user|d', name: 'd', status: 'stopped' },
            { id: 'user|e', name: 'e', status: 'held' }
          ]
        },
        data () {
          return {
            isLoading: false
          }
        }
      })
      const workflowsElements = wrapper.findAllComponents(TreeItem)
      expect(workflowsElements.length).to.equal(5)
      expect(workflowsElements.at(0).element.textContent).to.equal('b')
      expect(workflowsElements.at(1).element.textContent).to.equal('a')
      expect(workflowsElements.at(2).element.textContent).to.equal('e')
      expect(workflowsElements.at(3).element.textContent).to.equal('c')
      expect(workflowsElements.at(4).element.textContent).to.equal('d')
    })
  })
  describe('Filters', () => {
    const workflows = [
      {
        id: '1',
        name: 'new zealand',
        status: WorkflowState.HELD.name,
        stateTotals: {
          [WorkflowState.HELD.name]: 1
        }
      },
      {
        id: '2',
        name: 'zeeland',
        status: WorkflowState.RUNNING.name,
        stateTotals: {
          [WorkflowState.RUNNING.name]: 1
        }
      }
    ]
    it('should not filter by name, nor by tasks state, but should include all workflow states', () => {
      const wrapper = mountFunction({
        propsData: {
          workflows
        }
      })
      // read: give me all the workflows in RUNNING/HELD/STOPPED, no
      //       matter their names or their tasks' states.
      // no workflow name filtered initially
      expect(wrapper.vm.searchWorkflows).to.equal('')
      // every workflow state filter is ON initially
      const workflowStateFiltersOn = wrapper.vm.filters[0].items
        .map(filterItem => filterItem.model)
      expect(workflowStateFiltersOn.every(model => model)).to.equal(true)
      // every task state filter is OFF initially
      const taskStateFiltersOn = wrapper.vm.filters[1].items
        .map(filterItem => filterItem.model)
      expect(taskStateFiltersOn.some(model => model)).to.equal(false)
      // we will have the two items being displayed too
      expect(wrapper.vm.filteredWorkflows.length).to.equal(2)
    })
    describe('filter by name', () => {
      it('should filter by name', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows
          },
          data () {
            return {
              searchWorkflows: 'new'
            }
          }
        })
        expect(wrapper.vm.searchWorkflows).to.equal('new')
        expect(wrapper.vm.filteredWorkflows.length).to.equal(1)
      })
    })
    describe('filter by workflow state', () => {
      it('should filter by workflow state', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows
          },
          data () {
            return {
              searchWorkflows: '',
              filters: [
                {
                  title: 'workflow state',
                  items: [
                    {
                      text: 'running',
                      value: 'running',
                      model: true
                    },
                    {
                      text: 'held',
                      value: 'held',
                      model: false // remove held workflows!
                    },
                    {
                      text: 'stopped',
                      value: 'stopped',
                      model: true
                    }
                  ]
                },
                {
                  title: 'task state',
                  items: TaskState.enumValues.map(state => {
                    return {
                      text: state.name.toLowerCase(),
                      value: state,
                      model: false
                    }
                  })
                }
              ]
            }
          }
        })
        // here we only have 1 workflow, as the HELD state is not included (see above)
        expect(wrapper.vm.filteredWorkflows.length).to.equal(1)
      })
    })
    describe('filter by workflow tasks state', () => {
      it('should filter by workflow tasks state', () => {
        // `simpleWorkflowGscanNodes` has no tasks in the EXPIRED state, so
        // enabling that filter should filter-out the workflow
        const taskStatesFilter = TaskState.enumValues.map(state => {
          return {
            text: state.name.toLowerCase(),
            value: state,
            model: false
          }
        }).map(taskState => {
          if (taskState.text === TaskState.EXPIRED.name) {
            return Object.assign(taskState, {
              model: true
            })
          }
          return taskState
        })
        // NOTE: we are using `simpleWorkflowGscanNodes` in this test as it contains tasks/proxies
        const wrapper = mountFunction({
          propsData: {
            workflows: simpleWorkflowGscanNodes
          },
          data () {
            return {
              filteredWorkflows: [],
              searchWorkflows: '',
              filters: [
                {
                  title: 'workflow state',
                  items: [
                    {
                      text: 'running',
                      value: 'running',
                      model: true
                    },
                    {
                      text: 'held',
                      value: 'held',
                      model: true
                    },
                    {
                      text: 'stopped',
                      value: 'stopped',
                      model: true
                    }
                  ]
                },
                {
                  title: 'task state',
                  items: taskStatesFilter
                }
              ]
            }
          }
        })
        expect(wrapper.vm.filteredWorkflows.length).to.equal(0)
      })
    })
  })
  describe('Workflow summary', () => {
    let localThis
    beforeEach(() => {
      localThis = {
        workflows: simpleWorkflowGscanNodes
      }
    })
    it('should correctly calculate the workflow summary', () => {
      const summaries = GScan.computed.workflowsSummaries.call(localThis)
      expect(summaries.size).to.equal(1)
      expect(summaries.has('user|five')).to.equal(true)
      expect(summaries.get('user|five').has('succeeded')).to.equal(true)
      expect(summaries.get('user|five').get('succeeded').includes('foo.20130829T0000Z')).to.equal(true)
      expect(summaries.get('user|five').get('succeeded').includes('bar.20130829T0000Z')).to.equal(true)
      expect(summaries.get('user|five').get('succeeded').includes('foo.20130829T1200Z')).to.equal(true)
      expect(summaries.get('user|five').has('running')).to.equal(true)
      expect(summaries.get('user|five').get('running').includes('bar.20130829T1200Z')).to.equal(true)
      expect(summaries.get('user|five').get('running').includes('foo.20130830T0000Z')).to.equal(true)
    })
    it('should return elements in alphabetical order', () => {
      const summaries = GScan.computed.workflowsSummaries.call(localThis)
      expect(summaries.get('user|five').get('succeeded').length).to.equal(3)
      expect(summaries.get('user|five').get('succeeded')[0]).to.equal('bar.20130829T0000Z')
      expect(summaries.get('user|five').get('succeeded')[1]).to.equal('foo.20130829T0000Z')
      expect(summaries.get('user|five').get('succeeded')[2]).to.equal('foo.20130829T1200Z')
    })
    it('should return an empty map when no workflow provided', () => {
      expect(GScan.computed.workflowsSummaries.call({
        workflows: []
      }).size).to.equal(0)
      expect(GScan.computed.workflowsSummaries.call({}).size).to.equal(0)
    })
  })
  describe('Workflow link', () => {
    it('should create an empty link for non-workflow nodes', () => {
      const link = GScan.methods.workflowLink({})
      expect(link).to.equal('')
    })
    it('should create a link for a workflow node', () => {
      const link = GScan.methods.workflowLink({
        type: 'workflow',
        node: {
          name: 'name'
        }
      })
      expect(link).to.equal('/workflows/name')
    })
  })
  describe('Workflow icon', () => {
    it('should return error if an invalid status is provided', () => {
      const icon = GScan.methods.getWorkflowIcon('cylc')
      expect(icon).to.equal(WorkflowState.ERROR.icon)
    })
    it('should return the right icon for a valid status', () => {
      const icon = GScan.methods.getWorkflowIcon('running')
      expect(icon).to.equal(WorkflowState.RUNNING.icon)
    })
  })
  describe('Toggle items values', () => {
    it('should toggle items values to true', () => {
      const items = [
        {
          model: false
        },
        {
          model: false
        }
      ]
      GScan.methods.toggleItemsValues(items)
      expect(items.every(item => item.model))
    })
    it('should toggle items values to false', () => {
      const items = [
        {
          model: true
        },
        {
          model: true
        }
      ]
      GScan.methods.toggleItemsValues(items)
      expect(!items.every(item => item.model))
    })
    it('should toggle items values to false (mixed values)', () => {
      const items = [
        {
          model: true
        },
        {
          model: false
        }
      ]
      GScan.methods.toggleItemsValues(items)
      expect(!items.every(item => item.model))
    })
  })
  describe('GraphQL subscription', () => {
    describe('Subscribe', () => {
      it('should subscribe a new query', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows: []
          }
        })
        // the root query is registered on creation; we also cannot use another query
        // as the query must exist in the QUERIES global variable...
        delete wrapper.vm.subscriptions.root
        expect(wrapper.vm.subscriptions.root).to.equal(undefined)
        wrapper.vm.subscribe('root')
        // true because our mocked service returns true; see implementation at the top of this file
        expect(wrapper.vm.subscriptions.root).to.equal(true)
      })
      it('should subscribe a new query once', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows: []
          }
        })
        // force-define the value here
        wrapper.vm.subscriptions.root = false
        // normally subscribe would store the result of the $workflowService.subscribe, but it won't
        // as we have already force-defined it in the line above
        wrapper.vm.subscribe('root')
        // true because our mocked service returns true; see implementation at the top of this file
        expect(wrapper.vm.subscriptions.root).to.equal(false)
      })
    })
    describe('Unsubscribe', () => {
      it('should unsubscribe an existing query', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows: []
          }
        })
        const queryName = 'root'
        // let's unsubscribe the root query, subscribed on creation (created method)
        wrapper.vm.unsubscribe(queryName)
        expect(wrapper.vm.subscriptions.root).to.equal(undefined)
      })
      it('should do nothing if the query was not subscribed', () => {
        const wrapper = mountFunction({
          propsData: {
            workflows: []
          }
        })
        wrapper.vm.unsubscribe('cylc')
        expect(wrapper.vm.subscriptions.root).to.equal(true)
      })
    })
  })
})
