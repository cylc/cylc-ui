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
  },
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
    // Now go through the pruned deltas
    if (deltas.pruned) {
      if (deltas.pruned.tasks) {
        deltas.pruned.tasks.forEach((deltaTaskId) => {
          console.log(deltaTaskId)
          const [user, workflow, cyclepoint, task] = deltaTaskId.split('|')
          const taskProxyId = [user, workflow, cyclepoint, task].join('|')
          for (const [index, taskProxy] of workflowToUpdate.taskProxies.entries()) {
            console.log(taskProxy)
            console.log(taskProxyId)
            if (taskProxy.id === taskProxyId) {
              workflowToUpdate.taskProxies.splice(index, 1)
              break
            }
          }
        })
      }
      if (deltas.pruned.jobs) {
        deltas.pruned.jobs.forEach((deltaJobId) => {
          const [user, workflow, cyclepoint, task, job] = deltaJobId.split('|')
          const taskProxyId = [user, workflow, cyclepoint, task].join('|')
          const jobId = [user, workflow, cyclepoint, task, job].join('|')
          for (const taskProxy of workflowToUpdate.taskProxies) {
            if (taskProxy.jobs && taskProxy.id === taskProxyId) {
              for (const [index, taskProxyJob] of taskProxy.jobs.entries()) {
                if (taskProxyJob.id === jobId) {
                  taskProxy.jobs.splice(index, 1)
                  break
                }
              }
            }
          }
        })
      }
    }
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
