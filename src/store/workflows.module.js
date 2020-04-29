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

// imported for jsdoc type hinting
// eslint-disable-next-line no-unused-vars
import CylcTree from '@/components/cylc/tree/tree'
import { createWorkflowTree } from '@/components/cylc/tree'
// import merge from 'lodash.merge'

/**
 * @type {{
 *  tree: CylcTree,
 *  workflowName: string|null,
 *  workflows: []
 * }}
 */
const state = {
  tree: null,
  workflows: [],
  workflowName: null,
  latestDelta: 0
}

const getters = {
  currentWorkflow: state => {
    if (state.workflowName === null) {
      return null
    }
    return state.workflows.find(workflow => workflow.name === state.workflowName) || null
  },
  /**
   * Get the current tree children.
   * @returns {*}
   */
  tree: (state, getters) => {
    const currentWorkflow = getters.currentWorkflow
    if (currentWorkflow === null) {
      return null
    }
    console.log('WARN! CREATING TREE!')
    return createWorkflowTree(currentWorkflow)
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

// --- code related to deltas pruned

/**
 * Prune family proxies from a workflow.
 * @private
 * @param {[]} [prunedFamilyProxies] array of family proxies
 * @param {CylcTree} tree
 */
function pruneFamilyProxies (prunedFamilyProxies, tree) {
  if (!prunedFamilyProxies) {
    return
  }
  prunedFamilyProxies.forEach(familyProxyNode => tree.removeFamilyProxy(familyProxyNode))
}

/**
 * Prune task proxies from a workflow.
 * @private
 * @param {[]} [prunedTaskProxies] array of task proxies
 * @param {CylcTree} tree
 */
function pruneTaskProxies (prunedTaskProxies, tree) {
  if (!prunedTaskProxies) {
    return
  }
  prunedTaskProxies.forEach(taskProxyNode => tree.removeTaskProxy(taskProxyNode))
}

/**
 * Prune jobs from a workflow.
 * @private
 * @param {[]} [prunedJobs] array of jobs
 * @param {CylcTree} tree
 */
function pruneJobs (prunedJobs, tree) {
  if (!prunedJobs) {
    return
  }
  prunedJobs.forEach(jobNode => tree.removeJob(jobNode))
}

/**
 * Prune data from a workflow.
 * @private
 * @param {{
 *   familyProxies: [],
 *   taskProxies: [],
 *   jobs: []
 * }} pruned
 * @param {CylcTree} tree
 */
function pruneData (pruned, tree) {
  if (!pruned || !tree) {
    return
  }
  // Now go through the pruned deltas
  pruneFamilyProxies(pruned.familyProxies, tree)
  pruneTaskProxies(pruned.taskProxies, tree)
  pruneJobs(pruned.jobs, tree)
}

// --- code related to deltas data added or updated

// function addOrUpdateTaskProxies (addedOrUpdatedTaskProxies, workflow) {
//   if (!addedOrUpdatedTaskProxies || !workflow.taskProxies) {
//     return
//   }
//   addedOrUpdatedTaskProxies.forEach((addedOrUpdatedTaskProxy) => {
//     const existingTaskProxy = workflow.taskProxies.find(taskProxy => taskProxy.id === addedOrUpdatedTaskProxy.id)
//     if (!existingTaskProxy) {
//       workflow.taskProxies.push(addedOrUpdatedTaskProxy)
//     } else {
//       merge(existingTaskProxy, addedOrUpdatedTaskProxy)
//     }
//   })
// }
//
// function addData (updatedWorkflow, workflowToUpdate) {
//   workflowToUpdate.status = updatedWorkflow.status
//   addOrUpdateTaskProxies(updatedWorkflow.taskProxies, workflowToUpdate)
// }

const actions = {
  set ({ commit }, data) {
    commit('SET', data)
  },
  /**
   *
   * @param {CallableFunction} commit
   * @param {{
   *   workflows: [{
   *     id: String
   *   }]
   * }} state
   * @param getters
   * @param {{
   *   workflow: {
   *     id: String
   *   }
   *   pruned: {
   *     familyProxies: [],
   *     taskProxies: [],
   *     jobs: []
   *   }
   * }} deltas
   */
  updateDeltas ({ commit, state, getters }, { deltas }) {
    // addData(deltas.added)
    // updateData(deltas.updated)
    pruneData(deltas.pruned, getters.tree)
    // now that deltas have been updated, update this state field so others watching it can get notified
    state.latestDelta = Date.now()
  }
}

export const workflows = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
