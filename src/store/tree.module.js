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
import { clear } from '@/components/cylc/tree'
import applyDeltasLookup from '@/components/cylc/workflow/deltas'
import Alert from '@/model/Alert.model'
import applyDeltasTree from '@/components/cylc/tree/deltas'

const state = {
  /**
   * This stores workflow data as a hashmap/dictionary. The keys
   * are the ID's of the entities returned from GraphQL.
   *
   * The values of the dictionary hold the GraphQL data returned as-is.
   *
   * The intention is for workflow views to look up data in this structure
   * and re-use, instead of duplicating it.
   *
   * @type {Object.<String, Object>}
   */
  lookup: {},
  /**
   * This is the CylcTree, which contains the hierarchical tree data structure.
   * It is created from the GraphQL data, with the only difference that this one
   * contains hierarchy, while the lookup (not workflow.lookup) is flat-ish.
   *
   * The nodes in the .tree property have a reference or pointer (.node) to the
   * data in the lookup map above, to avoid data duplication.
   *
   * @type {Workflow}
   */
  workflow: {
    tree: {},
    lookup: {}
  }
}

const mutations = {
  SET_WORKFLOW (state, data) {
    state.workflow = data
  },
  SET_LOOKUP (state, data) {
    state.lookup = data
  },
  CLEAR_WORKFLOW (state) {
    clear(state.workflow)
    state.workflow = {
      tree: {
        id: '',
        type: 'workflow',
        children: []
      },
      lookup: {}
    }
  }
}

const actions = {
  applyWorkflowDeltas ({ commit, state }, data) {
    // modifying state directly in an action results in warnings...
    const lookup = Object.assign({}, state.lookup)
    const result = applyDeltasLookup(data, lookup)
    if (result.errors.length === 0) {
      commit('SET_LOOKUP', lookup)
    }
    result.errors.forEach(error => {
      commit('SET_ALERT', new Alert(error[0], null, 'error'), { root: true })
      // eslint-disable-next-line no-console
      console.warn(...error)
    })
  },
  clearWorkflow ({ commit }) {
    commit('SET_LOOKUP', {})
  },
  applyTreeDeltas ({ commit, state }, data) {
    // modifying state directly in an action results in warnings...
    const workflow = state.workflow
    const lookup = state.lookup
    // TODO: this could be an options object stored in the Vuex store, in some module...
    const options = {
      cyclePointsOrderDesc: localStorage.cyclePointsOrderDesc
        ? JSON.parse(localStorage.cyclePointsOrderDesc)
        : true
    }
    const result = applyDeltasTree(data, workflow, lookup, options)
    if (result.errors.length === 0) {
      commit('SET_WORKFLOW', workflow)
    }
    result.errors.forEach(error => {
      commit('SET_ALERT', new Alert(error[0], null, 'error'), { root: true })
      // eslint-disable-next-line no-console
      console.warn(...error)
    })
  },
  clearTree ({ commit }) {
    commit('CLEAR_WORKFLOW')
  }
}

export const tree = {
  namespaced: true,
  state,
  mutations,
  actions
}
