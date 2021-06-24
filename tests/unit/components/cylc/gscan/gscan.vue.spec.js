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
import GScan from '@/components/cylc/gscan/GScan'
import TreeItem from '@/components/cylc/tree/TreeItem'
import { simpleWorkflowGscanNodes } from './gscan.data'
import WorkflowState from '@/model/WorkflowState.model'
import TaskState from '@/model/TaskState.model'
import Vuetify from 'vuetify'
import Vue from 'vue'

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
  },
  startDeltasSubscription: function () {
    return {
      unsubscribed: false,
      unsubscribe () {
        this.unsubscribed = true
      }
    }
  }
}

Vue.use(Vuetify)

describe('GScan component', () => {
  /**
   * @param options
   * @returns {Wrapper<GScan>}
   */
  const mountFunction = options => {
    const vuetify = new Vuetify()
    return mount(GScan, {
      localVue,
      vuetify,
      stubs: {
        RouterLink: RouterLinkStub
      },
      ...options
    })
  }
  it('should display a skeleton loader if loading data', () => {
    const wrapper = mountFunction({
      data () {
        return {
          isLoading: true,
          workflowsTracker: 1,
          workflows: simpleWorkflowGscanNodes
        }
      }
    })
    const skeletonLoader = wrapper.find('.v-skeleton-loader')
    const isBusy = skeletonLoader.element.getAttribute('aria-busy')
    expect(isBusy).to.equal('true')
  })
  it('should display the GScan with valid data', () => {
    const wrapper = mountFunction({
      data () {
        return {
          isLoading: false,
          workflowsTracker: 1,
          workflows: simpleWorkflowGscanNodes
        }
      }
    })
    expect([...wrapper.vm.$data.workflows.values()][0].name).to.equal('five')
    expect(wrapper.find('div')).to.not.equal(null)
    expect(wrapper.html()).to.contain('five')
  })
  it('should destroy observables (force update)', () => {
    const wrapper = mountFunction({
      data () {
        return {
          isLoading: false,
          workflowsTracker: 1,
          workflows: simpleWorkflowGscanNodes
        }
      }
    })
    expect(wrapper.vm.$data.deltasObservable).to.not.equal(null)
    wrapper.vm.$destroy()
    // .deltasObservable is NOT RxJS/JS Observable; it is a mocked object, see at the top of this file for more. The
    // .unsubscribe property is defined for ease of testing here.
    expect(wrapper.vm.$data.deltasObservable.unsubscribed).to.equal(true)
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
  describe('Sorting', () => {
    const createWorkflows = (namesAndStatuses) => {
      return namesAndStatuses.map(nameAndStatus => {
        return {
          id: `user|${nameAndStatus.name}`,
          name: nameAndStatus.name,
          status: nameAndStatus.status.name,
          latestStateTasks: []
        }
      })
    }
    it('should sort workflows', () => {
      const tests = [
        // already sorted by name
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.RUNNING },
            { name: 'b', status: WorkflowState.RUNNING },
            { name: 'c', status: WorkflowState.RUNNING },
            { name: 'd', status: WorkflowState.RUNNING },
            { name: 'e', status: WorkflowState.RUNNING }
          ]),
          expected: ['a', 'b', 'c', 'd', 'e']
        },
        // already sorted by status
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.RUNNING },
            { name: 'b', status: WorkflowState.RUNNING },
            { name: 'c', status: WorkflowState.PAUSED },
            { name: 'd', status: WorkflowState.PAUSED },
            { name: 'e', status: WorkflowState.STOPPED }
          ]),
          expected: ['a', 'b', 'c', 'd', 'e']
        },
        // sort in alphabetical order
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.RUNNING },
            { name: 'e', status: WorkflowState.RUNNING },
            { name: 'c', status: WorkflowState.RUNNING },
            { name: 'b', status: WorkflowState.RUNNING },
            { name: 'd', status: WorkflowState.RUNNING }
          ]),
          expected: ['a', 'b', 'c', 'd', 'e']
        },
        // running workflows are displayed first, then paused, then the rest...
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.RUNNING },
            { name: 'e', status: WorkflowState.PAUSED },
            { name: 'c', status: WorkflowState.STOPPED },
            { name: 'b', status: WorkflowState.STOPPED },
            { name: 'd', status: WorkflowState.STOPPED }
          ]),
          expected: ['a', 'e', 'b', 'c', 'd']
        },
        // sorted alphabetically within statuses
        {
          workflows: createWorkflows([
            { name: 'e', status: WorkflowState.PAUSED },
            { name: 'a', status: WorkflowState.PAUSED },
            { name: 'c', status: WorkflowState.STOPPED },
            { name: 'b', status: WorkflowState.RUNNING },
            { name: 'd', status: WorkflowState.STOPPED }
          ]),
          expected: ['b', 'a', 'e', 'c', 'd']
        },
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.PAUSED },
            { name: 'c', status: WorkflowState.STOPPED },
            { name: 'b', status: WorkflowState.RUNNING },
            { name: 'd', status: WorkflowState.STOPPED },
            { name: 'e', status: WorkflowState.PAUSED }
          ]),
          expected: ['b', 'a', 'e', 'c', 'd']
        },
        // new statuses (stopping, error)
        {
          workflows: createWorkflows([
            { name: 'a', status: WorkflowState.PAUSED },
            { name: 'c', status: WorkflowState.STOPPED },
            { name: 'b', status: WorkflowState.RUNNING },
            { name: 'd', status: WorkflowState.STOPPED },
            { name: 'e', status: WorkflowState.PAUSED },
            { name: 'f', status: WorkflowState.PAUSED },
            { name: 'h', status: WorkflowState.STOPPING },
            { name: 'g', status: WorkflowState.ERROR },
            { name: 'j', status: WorkflowState.STOPPING },
            { name: 'i', status: WorkflowState.STOPPED },
            { name: 'k', status: WorkflowState.RUNNING },
            { name: 'l', status: WorkflowState.PAUSED }
          ]),
          expected: ['b', 'k', 'a', 'e', 'f', 'l', 'h', 'j', 'c', 'd', 'i', 'g']
        }
      ]
      tests.forEach(test => {
        const wrapper = mountFunction({
          data () {
            return {
              isLoading: false,
              workflowsTracker: 1,
              workflows: test.workflows
            }
          }
        })
        const workflowsElements = wrapper.findAllComponents(TreeItem)
        expect(workflowsElements.length).to.equal(test.expected.length)
        for (let i = 0; i < test.expected.length; i++) {
          expect(test.expected[i]).to.equal(workflowsElements.at(i).element.textContent)
        }
      })
    })
  })
  describe('Filters', () => {
    const workflows = [
      {
        id: '1',
        name: 'new zealand',
        status: WorkflowState.PAUSED.name,
        stateTotals: {
          [TaskState.FAILED.name]: 1
        }
      },
      {
        id: '2',
        name: 'zeeland',
        status: WorkflowState.RUNNING.name,
        stateTotals: {
          [TaskState.RUNNING.name]: 1
        }
      }
    ]
    const initialWorkflowStates = WorkflowState.enumValues.map(state => {
      return {
        text: state.name,
        value: state,
        model: true
      }
    })
    const initialWorkflowTaskStates = TaskState.enumValues.map(state => {
      return {
        text: state.name,
        value: state,
        model: false
      }
    })
    // utility function to create the list of filters, used by tests below
    const createStatesFilters = (workflowStates, workflowTaskStates) => {
      return [
        {
          title: 'workflow state',
          items: workflowStates
        },
        {
          title: 'task state',
          items: workflowTaskStates
        }
      ]
    }
    it('should have a default state of no name filter, and all states enabled', () => {
      const wrapper = mountFunction({
        data () {
          return {
            isLoading: false,
            workflowsTracker: 1,
            workflows: workflows
          }
        }
      })
      // read: give me all the workflows in RUNNING/PAUSED/STOPPED, no
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
    it('should not filter by name, nor by tasks state by default, but should include all workflow states', () => {
      const wrapper = mountFunction({
        data () {
          return {
            workflows: workflows
          }
        }
      })
      wrapper.vm.filterWorkflows(
        wrapper.vm.workflows,
        wrapper.vm.searchWorkflows,
        wrapper.vm.filters
      )
      // we will have the two items being displayed too
      expect(wrapper.vm.filteredWorkflows.length).to.equal(2)
    })
    describe('Filter by workflow name', () => {
      it('should filter by name', () => {
        const tests = [
          {
            searchWorkflow: '',
            expected: 2
          },
          {
            searchWorkflow: 'new',
            expected: 1
          },
          {
            searchWorkflow: 'land',
            expected: 2
          },
          {
            searchWorkflow: 'dog',
            expected: 0
          }
        ]
        tests.forEach(test => {
          const wrapper = mountFunction({
            data () {
              return {
                workflows: workflows
              }
            }
          })
          expect(wrapper.vm.filteredWorkflows.length).to.equal(2)
          wrapper.vm.filterWorkflows(wrapper.vm.workflows, test.searchWorkflow, wrapper.vm.filters)
          expect(wrapper.vm.filteredWorkflows.length).to.equal(test.expected)
        })
      })
    })
    describe('Filter by workflow state', () => {
      it('should filter by workflow state', () => {
        const tests = [
          // all states enabled
          {
            workflowStates: WorkflowState.enumValues,
            expected: 2
          },
          // enable only the ones we have in our test data set
          {
            workflowStates: [WorkflowState.RUNNING, WorkflowState.PAUSED],
            expected: 2
          },
          // enable just one of the values we have in our test data set
          {
            workflowStates: [WorkflowState.RUNNING],
            expected: 1
          },
          // leave the ones we have in our test data set un-checked
          {
            workflowStates: [],
            expected: 0
          }
        ]
        tests.forEach(test => {
          const workflowStates = initialWorkflowStates
            .map(state => {
              if (test.workflowStates.includes(state.value)) {
                return Object.assign({}, state, { model: true })
              }
              return Object.assign({}, state, { model: false })
            })
          const wrapper = mountFunction({
            data () {
              return {
                workflows: workflows
              }
            }
          })
          const filters = createStatesFilters(workflowStates, initialWorkflowTaskStates)
          wrapper.vm.filterWorkflows(wrapper.vm.workflows, '', filters)
          expect(wrapper.vm.filteredWorkflows.length).to.equal(test.expected)
        })
      })
    })
    describe('Filter by workflow tasks state', () => {
      it('should filter by workflow tasks state', () => {
        const tests = [
          // all states enabled
          {
            workflowTaskStates: TaskState.enumValues,
            expected: 2
          },
          // enable only the ones we have in our test data set
          {
            workflowTaskStates: [TaskState.RUNNING, TaskState.FAILED],
            expected: 2
          },
          // enable just one of the values we have in our test data set
          {
            workflowTaskStates: [TaskState.RUNNING],
            expected: 1
          },
          // un-checking means every task state enabled
          {
            workflowTaskStates: [],
            expected: 2
          }
        ]
        tests.forEach(test => {
          const workflowTaskStates = initialWorkflowTaskStates
            .map(state => {
              if (test.workflowTaskStates.includes(state.value)) {
                return Object.assign({}, state, { model: true })
              }
              return Object.assign({}, state, { model: false })
            })
          const wrapper = mountFunction({
            data () {
              return {
                workflows: workflows
              }
            }
          })
          const filters = createStatesFilters(initialWorkflowStates, workflowTaskStates)
          wrapper.vm.filterWorkflows(wrapper.vm.workflows, '', filters)
          expect(wrapper.vm.filteredWorkflows.length).to.equal(test.expected)
        })
      })
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
})
