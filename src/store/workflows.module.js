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

import { convertGraphQLWorkflowToTree } from '@/components/cylc/tree'

const state = {
  workflows: [],
  workflowName: null
}

const getters = {
  currentWorkflow: state => {
    if (state.workflowName === null) {
      return null
    }
    return state.workflows.find(workflow => workflow.name === state.workflowName) || null
  },
  workflowTree: (state, getters) => {
    return convertGraphQLWorkflowToTree(getters.currentWorkflow)
  }
}

const mutations = {
  SET (state, data) {
    // TODO: when subscriptions are introduced this will have to apply
    // deltas to the store
    state.workflows = data
  },
  SET_WORKFLOW_NAME (state, { workflowName }) {
    state.workflowName = workflowName
  }
}

const actions = {
  set ({ commit }, data) {
    commit('SET', data)
  }
}

export const workflows = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
