import { extractGroupState } from '@/utils/tasks'
import { STATES_WITH_PROGRESS, computePercentProgress, getWorkflowCycles } from '@/components/cylc'

/**
 * Given a GraphQL query response for workflows, this function will return the data structure
 * expected by the Vue.js tree component.
 * @param workflows {Array}
 * @returns {Array}
 */
function convertGraphQLWorkflowsToTree (workflows) {
  // TODO: build the whole structure in one go to save iterations...
  return []
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
function getWorkflowTree (workflows) {
  const cycles = getCycles(workflows)
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
              taskProxy.progress = computePercentProgress(startedTime, taskProxy.task.meanElapsedTime)
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

export {
  convertGraphQLWorkflowsToTree
}
