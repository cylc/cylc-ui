// raw GraphQL response data structure
import { extractGroupState } from '@/utils/tasks'

const state = {
  workflows: [],
  workflowTree: []
}

const mutations = {
  SET (state, data) {
    // TODO: when subscriptions are introduced this will have to apply
    // deltas to the store
    state.workflows = data
  },
  SET_WORKFLOW_TREE (state, workflowTree) {
    state.workflowTree = workflowTree
  }
}

/**
 * Compute a map of cycles, where the key is the workflow ID, and the
 * value is the cyclepoint name.
 *
 * @param workflows
 * @returns {Map<any, any>}
 * @private
 */
function _getCycles (workflows) {
  const cycles = new Map()
  for (const workflow of workflows) {
    if (Object.prototype.hasOwnProperty.call(workflow, 'taskProxies')) {
      if (!cycles.get(workflow.id)) {
        cycles.set(workflow.id, new Set())
      }
      for (const proxy of workflow.taskProxies) {
        cycles.get(workflow.id).add(proxy.cyclePoint)
      }
    }
  }
  return cycles
}

/**
 * Compute a workflow tree where the root is the workflow node, followed by
 * the cycle points, and finally by task proxies.
 *
 * Every node has a .name property for display.
 *
 * @param workflows
 * @returns {[]}
 * @private
 */
function _getWorkflowTree (workflows) {
  const cycles = _getCycles(workflows)
  const workflowTree = []
  if (cycles.size > 0) {
    for (const workflow of workflows) {
      // add workflow minus taskProxies, with children
      workflow.__type = 'workflow'
      workflow.children = []
      for (const cyclePoint of cycles.get(workflow.id)) {
        const simplifiedCyclepoint = {
          name: cyclePoint,
          id: cyclePoint,
          state: '',
          children: [],
          __type: 'cyclepoint'
        }

        const childStates = []

        for (const taskProxy of workflow.taskProxies) {
          if (taskProxy.cyclePoint === cyclePoint) {
            taskProxy.name = taskProxy.task.name
            taskProxy.children = []
            taskProxy.__type = 'task'
            for (const job of taskProxy.jobs.reverse()) {
              job.name = `#${job.submitNum}`
              job.__type = 'job'
              taskProxy.children.push(job)
            }
            simplifiedCyclepoint.children.push(taskProxy)

            childStates.push(taskProxy.state)
          }
        }

        simplifiedCyclepoint.state = extractGroupState(childStates, false)

        workflow.children.push(simplifiedCyclepoint)
      }
      workflowTree.push(workflow)
    }
  }
  return workflowTree
}

const actions = {
  set ({ commit }, data) {
    const workflowTree = _getWorkflowTree(data)
    commit('SET_WORKFLOW_TREE', workflowTree)
    commit('SET', data)
  }
}

export const workflows = {
  namespaced: true,
  state,
  mutations,
  actions
}
