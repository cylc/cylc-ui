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
import Vue from 'vue'
import Alert from '@/model/Alert.model'
import applyDeltasLookup from '@/components/cylc/common/deltas'
import applyDeltasGscan from '@/components/cylc/gscan/deltas'

const state = {
  /**
   * This contains workflows returned from GraphQL indexed by their ID's. And is used by components
   * such as GScan, Dashboard, and WorkflowsTable.
   *
   * @type {Object.<string, WorkflowGraphQLData>}
   */
  workflows: {},
  gscan: {
    tree: {}
  },
  /**
   * This holds the name of the current workflow. This is set by VueRouter
   * and is used to decide what's the current workflow. It is used in conjunction
   * with the workflows/workflows (above) when finding the current workflow and
   * using it, for instance, to create the GraphQL variables of a workflow
   * view (see mixins used in the Tree View).
   *
   * @type {String}
   */
  workflowName: null
}

const getters = {
  currentWorkflow: state => {
    if (state.workflowName === null) {
      return null
    }
    return Object.values(state.workflows)
      .find(workflow => workflow.name === state.workflowName)
  }
}

const mutations = {
  SET_GSCAN (state, data) {
    state.gscan = data
  },
  CLEAR_GSCAN (state) {
    Object.keys(state.gscan.tree).forEach(key => {
      Vue.delete(state.gscan.tree, key)
    })
    state.gscan = {
      tree: {}
    }
  },
  SET_WORKFLOW_NAME (state, data) {
    state.workflowName = data
  },
  SET_WORKFLOWS (state, data) {
    state.workflows = data
  }
}

const actions = {
  setWorkflowName ({ commit }, data) {
    commit('SET_WORKFLOW_NAME', data)
  },
  applyWorkflowsDeltas ({ commit, state }, data) {
    // modifying state directly in an action results in warnings...
    const workflows = Object.assign({}, state.workflows)
    applyDeltasLookup(data, workflows)
    commit('SET_WORKFLOWS', workflows)
  },
  clearWorkflows ({ commit }) {
    commit('SET_WORKFLOWS', [])
  },
  applyGScanDeltas ({ commit, state }, data) {
    const gscan = state.gscan
    const options = {
      hierarchical: true
    }
    const result = applyDeltasGscan(data, gscan, options)
    if (result.errors.length === 0) {
      commit('SET_GSCAN', gscan)
    }
    result.errors.forEach(error => {
      commit('SET_ALERT', new Alert(error[0], null, 'error'), { root: true })
      // eslint-disable-next-line no-console
      console.warn(...error)
    })
  },
  clearGScan ({ commit }) {
    commit('CLEAR_GSCAN')
  }
}

export const workflows = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
