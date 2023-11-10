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
import { vi } from 'vitest'
import { createVuetify } from 'vuetify'
import sinon from 'sinon'
import { cloneDeep } from 'lodash'
import Tree from '@/components/cylc/tree/Tree.vue'
import { simpleWorkflowTree4Nodes } from './tree.data'
import CylcObjectPlugin from '@/components/cylc/cylcObject/plugin'
import WorkflowService from '@/services/workflow.service'
import { nextTick } from 'vue'

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
      workflows: cloneDeep(simpleWorkflowTree4Nodes),
      autoStripTypes: ['workflow'],
    },
    ...options
  })

  describe('Filter', () => {
    it('does not filter by name or state by default', () => {
      const wrapper = mountFunction()
      expect(wrapper.vm.tasksFilter).to.deep.equal({})
    })

    it.each([
      {},
      { id: ' ', states: [] },
    ])('does not run filtering when filters are falsy: %o', async (tasksFilter) => {
      const spy = vi.spyOn(Tree.methods, 'filterNode')
      const wrapper = mountFunction()
      wrapper.vm.tasksFilter = tasksFilter
      await nextTick()
      expect(wrapper.vm.rootChildren).toEqual(
        simpleWorkflowTree4Nodes[0].children
      )
      expect(spy).not.toHaveBeenCalled()
    })

    it.each([
      { tasksFilter: { id: 'foo' }, filteredOut: false },
      { tasksFilter: { states: ['failed'] }, filteredOut: false },
      { tasksFilter: { id: 'foo', states: ['failed'] }, filteredOut: false },

      { tasksFilter: { id: 'asdf' }, filteredOut: true },
      { tasksFilter: { states: ['running'] }, filteredOut: true },
      { tasksFilter: { id: 'foo', states: ['running'] }, filteredOut: true },
      { tasksFilter: { id: 'asdf', states: ['failed'] }, filteredOut: true },
    ])('filters by $tasksFilter', ({ tasksFilter, filteredOut }) => {
      const wrapper = mountFunction()
      wrapper.vm.tasksFilter = tasksFilter
      expect(wrapper.vm.rootChildren).toMatchObject([{
        id: '~user/workflow1//20100101T0000Z',
        filteredOut,
        familyTree: [{
          id: '~user/workflow1//20100101T0000Z/root',
          children: [{
            id: '~user/workflow1//20100101T0000Z/foo',
            filteredOut,
          }],
        }],
      }])
    })
  })
})
