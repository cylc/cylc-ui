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
    store.state.workflows.workflow = {
      tree: [],
      lookup: {}
    }
    store.state.workflows.workflows = []
    store.state.workflows.workflowName = null
  }
  beforeEach(resetState)
  afterEach(resetState)
  describe('State', () => {
    it('should start with empty lookup, empty workflow, no workflows, and no workflow name', () => {
      expect(Object.keys(store.state.workflows.lookup).length).to.deep.equal(0)
      expect(store.state.workflows.workflow).to.deep.equal({ tree: [], lookup: {} })
      expect(store.state.workflows.workflows.length).to.equal(0)
      expect(store.state.workflows.workflowName).to.equal(null)
    })
  })
  describe('Getters', () => {
    it('should get the current workflow', () => {
      expect(store.getters['workflows/currentWorkflow']).to.equal(null)
      const workflows = {
        'cylc|cylc': {
          id: 'cylc|cylc',
          name: 'cylc'
        }
      }
      store.commit('workflows/SET_WORKFLOWS', workflows)
      store.commit('workflows/SET_WORKFLOW_NAME', workflows['cylc|cylc'].name)
      expect(store.getters['workflows/currentWorkflow']).to.deep.equal(workflows['cylc|cylc'])
    })
  })
  describe('Mutations', () => {
    it('should set workflows', () => {
      const workflows = {
        'cylc|cylc': {
          id: 'cylc|cylc',
          name: 'cylc'
        }
      }
      store.commit('workflows/SET_WORKFLOWS', workflows)
      expect(store.state.workflows.workflows).to.deep.equal(workflows)
    })
    it('should set workflow name', () => {
      const workflowName = 'cylc'
      store.commit('workflows/SET_WORKFLOW_NAME', workflowName)
      expect(store.state.workflows.workflowName).to.equal(workflowName)
    })
    it('should set gscan', () => {
      const workflow = {
        tree: [
          {
            test: 1
          }
        ],
        lookup: {
          test: 1
        }
      }
      store.commit('workflows/SET_GSCAN', workflow)
      expect(store.state.workflows.gscan).to.deep.equal(workflow)
    })
    it('should clear gscan', () => {
      const workflow = {
        tree: [
          {
            test: 1
          }
        ],
        lookup: {
          test: 1
        }
      }
      store.commit('workflows/SET_GSCAN', workflow)
      expect(store.state.workflows.gscan.tree.length).to.equal(1)
      expect(Object.keys(store.state.workflows.gscan.lookup).length).to.equal(1)
      store.commit('workflows/CLEAR_GSCAN')
      expect(store.state.workflows.gscan.tree.length).to.equal(0)
      expect(Object.keys(store.state.workflows.gscan.lookup).length).to.equal(0)
    })
  })
  describe('Actions', () => {
    it('should apply workflows deltas', () => {
      const data = {
        deltas: {
          added: {
            workflow: {
              id: 'cylc|test',
              status: 'test'
            }
          }
        }
      }
      store.dispatch('workflows/applyWorkflowsDeltas', data)
      store.dispatch('workflows/applyGScanDeltas', data)
      expect(store.state.workflows.workflows['cylc|test']).to.not.equal(undefined)
    })
    it('should clear workflows', () => {
      const workflows = {
        'cylc|cylc': {
          id: 'cylc|cylc',
          name: 'cylc'
        }
      }
      store.commit('workflows/SET_WORKFLOWS', workflows)
      expect(store.state.workflows.workflows).to.deep.equal(workflows)
      store.dispatch('workflows/clearWorkflows')
      expect(store.state.workflows.workflows).to.not.deep.equal(workflows)
    })
    it('should set workflow name', () => {
      const workflowName = 'cylc'
      store.dispatch('workflows/setWorkflowName', workflowName)
      expect(store.state.workflows.workflowName).to.equal(workflowName)
    })
    it('should apply workflow deltas', () => {
      const data = {
        deltas: {
          added: {
            workflow: {
              id: 'cylc|test',
              status: 'test'
            }
          }
        }
      }
      store.dispatch('workflows/applyGScanDeltas', data)
      expect(store.state.workflows.gscan.lookup['cylc|test']).to.not.equal(undefined)
    })
  })
})
