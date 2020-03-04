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
import merge from 'lodash.merge'

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

// --- code related to deltas pruned

/**
 * Prune family proxies from a workflow.
 * @private
 * @param {[]} [prunedFamilyProxies] array of family proxies
 * @param {{familyProxies: []}} workflow workflow
 */
function pruneFamilyProxies (prunedFamilyProxies, workflow) {
  if (!prunedFamilyProxies || !workflow.familyProxies) {
    return
  }
  prunedFamilyProxies.forEach((deltaFamilyProxyId) => {
    // eslint-disable-next-line no-unused-vars
    for (const [index, familyProxy] of workflow.familyProxies.entries()) {
      if (familyProxy.id === deltaFamilyProxyId) {
        workflow.familyProxies.splice(index, 1)
        break
      }
    }
  })
}

/**
 * Prune task proxies from a workflow.
 * @private
 * @param {[]} [prunedTaskProxies] array of task proxies
 * @param {{taskProxies: []}} workflow workflow
 */
function pruneTaskProxies (prunedTaskProxies, workflow) {
  if (!prunedTaskProxies || !workflow.taskProxies) {
    return
  }
  prunedTaskProxies.forEach((deltaTaskProxyId) => {
    for (const [index, taskProxy] of workflow.taskProxies.entries()) {
      if (taskProxy.id === deltaTaskProxyId) {
        workflow.taskProxies.splice(index, 1)
        break
      }
    }
  })
}

/**
 * Prune jobs from a workflow.
 * @private
 * @param {[]} [prunedJobs] array of jobs
 * @param {{
 *   taskProxies: [{
 *     id: String,
 *     jobs: []
 *   }]
 * }} workflow workflow
 */
function pruneJobs (prunedJobs, workflow) {
  if (!prunedJobs) {
    return
  }
  prunedJobs.forEach((deltaJobId) => {
    // eslint-disable-next-line no-unused-vars
    const [userName, workflowName, cyclepoint, taskName, jobName] = deltaJobId.split('|')
    const taskProxyId = [userName, workflowName, cyclepoint, taskName].join('|')
    workflow.taskProxies.forEach((taskProxy) => {
      if (taskProxy.jobs && taskProxy.id === taskProxyId) {
        for (const [index, taskProxyJob] of taskProxy.jobs.entries()) {
          if (taskProxyJob.id === deltaJobId) {
            taskProxy.jobs.splice(index, 1)
            break
          }
        }
      }
    })
  })
}

/**
 * Prune data from a workflow.
 * @private
 * @param {{
 *   familyProxies: [],
 *   taskProxies: [],
 *   jobs: []
 * }} pruned
 * @param workflow workflow
 */
function pruneData (pruned, workflow) {
  if (!pruned) {
    return
  }
  // Now go through the pruned deltas
  pruneFamilyProxies(pruned.familyProxies, workflow)
  pruneTaskProxies(pruned.taskProxies, workflow)
  pruneJobs(pruned.jobs, workflow)
}

// --- code related to deltas data added or updated

function addOrUpdateTaskProxies (addedOrUpdatedTaskProxies, workflow) {
  if (!addedOrUpdatedTaskProxies || !workflow.taskProxies) {
    return
  }
  addedOrUpdatedTaskProxies.forEach((addedOrUpdatedTaskProxy) => {
    const existingTaskProxy = workflow.taskProxies.find(taskProxy => taskProxy.id === addedOrUpdatedTaskProxy.id)
    if (!existingTaskProxy) {
      workflow.taskProxies.push(addedOrUpdatedTaskProxy)
    } else {
      merge(existingTaskProxy, addedOrUpdatedTaskProxy)
    }
  })
}

function addOrUpdateData (updatedWorkflow, workflowToUpdate) {
  workflowToUpdate.status = updatedWorkflow.status
  addOrUpdateTaskProxies(updatedWorkflow.taskProxies, workflowToUpdate)
}

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
    // First step is to locate the workflow referenced in the deltas
    const deltasWorkflowId = deltas.workflow.id
    const workflows = state.workflows
    let workflowToUpdate = null
    for (const workflow of workflows) {
      if (workflow.id === deltasWorkflowId) {
        workflowToUpdate = workflow
        break
      }
    }
    // We do not have the workflow?
    if (workflowToUpdate === null) {
      return
    }
    addOrUpdateData(deltas.workflow, workflowToUpdate)
    pruneData(deltas.pruned, workflowToUpdate)
    commit('SET', workflows)
  }
}

export const workflows = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
