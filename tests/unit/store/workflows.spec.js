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

import { expect } from 'chai'
import Vue from 'vue'
import Vuex from 'vuex'
import storeOptions from '@/store/options'

Vue.use(Vuex)

/**
 * Tests for the store/workflows module.
 */
describe('workflows', () => {
  const store = new Vuex.Store(storeOptions)
  if (!global.localStorage) {
    global.localStorage = {}
  }
  const resetState = () => {
    store.state.workflows.lookup = {}
    store.state.workflows.workflowName = null
  }
  beforeEach(resetState)
  afterEach(resetState)
  describe('State', () => {
    it('should start with empty lookup and no workflow name', () => {
      expect(Object.keys(store.state.workflows.lookup).length).to.deep.equal(0)
      expect(store.state.workflows.workflowName).to.equal(null)
    })
  })
  describe('Getters', () => {
    it('should get the current workflow', () => {
      expect(store.getters['workflows/currentWorkflow']).to.equal(null)
      const lookup = {
        'cylc|cylc': {
          id: 'cylc|cylc',
          name: 'cylc'
        }
      }
      store.commit('workflows/SET_LOOKUP', lookup)
      store.commit('workflows/SET_WORKFLOW_NAME', lookup['cylc|cylc'].name)
      expect(store.getters['workflows/currentWorkflow']).to.deep.equal(lookup['cylc|cylc'])
    })
  })
  describe('Mutations', () => {
    it('should set workflows', () => {
      const lookup = {
        'cylc|cylc': {
          id: 'cylc|cylc',
          name: 'cylc'
        }
      }
      store.commit('workflows/SET_LOOKUP', lookup)
      expect(store.state.workflows.lookup).to.deep.equal(lookup)
    })
    it('should set workflow name', () => {
      const workflowName = 'cylc'
      store.commit('workflows/SET_WORKFLOW_NAME', workflowName)
      expect(store.state.workflows.workflowName).to.equal(workflowName)
    })
  })
})
