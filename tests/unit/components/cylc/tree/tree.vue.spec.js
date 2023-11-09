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
import { createVuetify } from 'vuetify'
import sinon from 'sinon'
import Tree from '@/components/cylc/tree/Tree.vue'
import { simpleWorkflowTree4Nodes } from './tree.data'
import CylcObjectPlugin from '@/components/cylc/cylcObject/plugin'
import WorkflowService from '@/services/workflow.service'

const $eventBus = {
  emit () {}
}
const $workflowService = sinon.createStubInstance(WorkflowService)
const vuetify = createVuetify()

describe('Tree component', () => {
  /**
   * @param options
   * @returns {Wrapper<Tree>}
   */
  const mountFunction = (options) => mount(Tree, {
    global: {
      plugins: [vuetify, CylcObjectPlugin],
      mocks: {
        $eventBus,
        $workflowService
      }
    },
    props: {
      workflows: simpleWorkflowTree4Nodes[0].children,
    },
    ...options
  })

  it('should display the tree with valid data', () => {
    const wrapper = mountFunction()
    expect(wrapper.props().workflows[0].node.__typename).to.equal('CyclePoint')
    expect(wrapper.find('div')).to.not.equal(null)
  })

  describe('Filter', () => {
    it('does not filter by name or state by default', () => {
      const wrapper = mountFunction()
      expect(wrapper.vm.tasksFilter).to.deep.equal({})
    })

    it.each([
      { tasksFilter: {}, filtered: true },
      { tasksFilter: { id: '' }, filtered: true },
      { tasksFilter: { id: 'foo' }, filtered: true },
      { tasksFilter: { states: ['failed'] }, filtered: true },
      { tasksFilter: { id: 'foo', states: ['failed'] }, filtered: true },

      { tasksFilter: { id: 'asdf' }, filtered: false },
      { tasksFilter: { states: ['running'] }, filtered: false },
      { tasksFilter: { id: 'foo', states: ['running'] }, filtered: false },
      { tasksFilter: { id: 'asdf', states: ['failed'] }, filtered: false },
    ])('filters by $tasksFilter', ({ tasksFilter, filtered }) => {
      const wrapper = mountFunction()
      wrapper.vm.tasksFilter = tasksFilter
      expect(wrapper.vm.rootChildren).toMatchObject([{
        id: '~user/workflow1//20100101T0000Z',
        filtered,
        familyTree: [{
          id: '~user/workflow1//20100101T0000Z/root',
          children: [{
            id: '~user/workflow1//20100101T0000Z/foo',
            filtered,
          }],
        }],
      }])
    })
  })
})
