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
import { clear } from '@/components/cylc/tree/index'

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
  },
  /**
   * This contains a list of workflows returned from GraphQL and is used by components
   * such as GScan, Dashboard, and WorkflowsTable.
   *
   * @type {Object.<String, WorkflowGraphQLData>}
   */
  workflows: {},
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
  SET_WORKFLOW_NAME (state, data) {
    state.workflowName = data
  },
  SET_WORKFLOWS (state, data) {
    state.workflows = data
  },
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

const actions = {}

export const workflows = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
