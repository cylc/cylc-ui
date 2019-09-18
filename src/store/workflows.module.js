// raw GraphQL response data structure
import { extractGroupState } from '@/utils/tasks'

const STATES_WITH_PROGRESS = ['running']

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
 * Compute percent progress.
 *
 * @see https://github.com/cylc/cylc-flow/blob/de7d938496e82dbdfb165938145670dd8e801efd/lib/cylc/gui/updater_tree.py#L248-L263
 * @param {number} startedTime in milliseconds since 1970-01-01 00:00:00 UTC, e.g. 1568353099874
 * @param {number} meanElapsedTime mean elapsed time in seconds
 * @returns {number} the percent progress, e.g. 25 (meaning 25% progress)
 * @private
 */
function _computePercentProgress (startedTime, meanElapsedTime) {
  const now = Date.now() // milliseconds since 1970-01-01
  // startedTime > now reportedly possible via interaction with `cylc reset`
  if (startedTime > now || meanElapsedTime === 0) {
    return 0
  }

  if (now > startedTime + meanElapsedTime * 1000) {
    return 100
  }
  return 100 * (now - startedTime) / (meanElapsedTime * 1000)
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
            taskProxy.expanded = false
            let startedTime = 0
            // the GraphQL query is expected to have `jobs(sort: { keys: ["submit_num"], reverse:true }) {`
            for (const job of taskProxy.jobs) {
              job.name = `#${job.submitNum}`
              job.__type = 'job'
              job.latestMessage = taskProxy.latestMessage
              taskProxy.children.push(job)
              // we use only the highest submitNum startedTime
              if (startedTime === 0 && job.startedTime) {
                startedTime = Date.parse(job.startedTime)
              }
            }
            simplifiedCyclepoint.children.push(taskProxy)

            if (STATES_WITH_PROGRESS.includes(taskProxy.state)) {
              taskProxy.progress = _computePercentProgress(startedTime, taskProxy.task.meanElapsedTime)
            }

            childStates.push(taskProxy.state)
          }
        }

        simplifiedCyclepoint.state = extractGroupState(childStates, false)

        workflow.children.push(simplifiedCyclepoint)
      }
      workflowTree.push(workflow)
    }
    cycles.clear()
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
