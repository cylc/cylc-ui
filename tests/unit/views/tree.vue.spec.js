/* Copyright (C) NIWA & British Crown (Met Office) & Contributors.
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
 * along with this program.  If not, see <http://www.gnu.org/licenses/>. */

import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { createVuetify } from 'vuetify'
import sinon from 'sinon'
import storeOptions from '@/store/options'
import Tree from '@/views/Tree.vue'
import User from '@/model/User.model'
import WorkflowService from '@/services/workflow.service'
import CylcObjectPlugin from '@/components/cylc/cylcObject/plugin'
import { Tokens } from '@/utils/uid'
import { getIDMap } from '$tests/util'

const $workflowService = sinon.createStubInstance(WorkflowService)
const vuetify = createVuetify()

const expandID = (id) => ({
  id,
  tokens: new Tokens(id),
  node: {},
})

const workflowNode = {
  ...expandID('~user/workflow1'),
  type: 'workflow',
  children: [
    {
      ...expandID('~user/workflow1//1'),
      type: 'cycle',
      children: [],
      familyTree: [
        {
          ...expandID('~user/workflow1//1/root'),
          type: 'family',
          children: [
            {
              ...expandID('~user/workflow1//1/FAM'),
              type: 'family',
              children: [
                {
                  ...expandID('~user/workflow1//1/foo'),
                  type: 'task',
                  node: { state: 'failed' },
                  children: [
                    {
                      ...expandID('~user/workflow1//1/foo/1'),
                      type: 'job',
                    },
                  ]
                },
                {
                  ...expandID('~user/workflow1//1/bar'),
                  type: 'task',
                  node: { state: 'waiting' },
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

describe('Tree view', () => {
  let mountFunction
  beforeEach(() => {
    const store = createStore(storeOptions)
    const user = new User('cylc', [], new Date(), true, 'localhost', 'owner')
    store.commit('user/SET_USER', user)
    mountFunction = (options) => mount(Tree, {
      global: {
        plugins: [vuetify, CylcObjectPlugin, store],
        mocks: {
          $workflowService
        }
      },
      props: {
        workflowName: 'workflow1',
      },
      ...options
    })
  })

  describe('Filter', () => {
    it.each([
      {},
      { id: null, states: null },
      { id: '  ', states: [] }
    ])('has null filterState when filters are empty: %o', async (tasksFilter) => {
      const wrapper = mountFunction()
      expect(wrapper.vm.tasksFilter).toEqual({
        id: null,
        states: null,
      })
      await wrapper.setData({ tasksFilter })
      expect(wrapper.vm.filterState).toBeNull()
    })

    it.each([
      { tasksFilter: { id: 'foo' }, filteredOut: false },
      { tasksFilter: { states: ['failed'] }, filteredOut: false },
      { tasksFilter: { id: 'foo', states: ['failed'] }, filteredOut: false },

      { tasksFilter: { id: 'asdf' }, filteredOut: true },
      { tasksFilter: { states: ['running'] }, filteredOut: true },
      { tasksFilter: { id: 'foo', states: ['running'] }, filteredOut: true },
      { tasksFilter: { id: 'asdf', states: ['failed'] }, filteredOut: true },
    ])('filters by $tasksFilter', async ({ tasksFilter, filteredOut }) => {
      const wrapper = mountFunction()
      wrapper.vm.tasksFilter = tasksFilter
      await nextTick()
      expect(wrapper.vm.filterState).toMatchObject(tasksFilter)
      const filteredOutNodesCache = new Map()
      expect(wrapper.vm.filterNode(workflowNode, filteredOutNodesCache)).toEqual(!filteredOut)
      expect(getIDMap(filteredOutNodesCache)).toEqual({
        '~user/workflow1': filteredOut,
        '~user/workflow1//1': filteredOut,
        '~user/workflow1//1/FAM': filteredOut,
        '~user/workflow1//1/foo': filteredOut,
        '~user/workflow1//1/bar': true, // always filtered out
      })
    })
  })
})
