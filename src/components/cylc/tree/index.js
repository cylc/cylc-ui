import { extractGroupState } from '@/utils/tasks'
import { STATES_WITH_PROGRESS, computePercentProgress, getWorkflowCycles } from '@/components/cylc'

/**
 * Given a GraphQL response workflow, this function will return the data structure
 * expected by the Vue.js tree component.
 *
 * The data structure returned will be a tree-like structure, where the root is the workflow
 * node, followed by cycle points, then families, and finally tasks as leaf nodes.
 *
 * Every node has data, and a .name property used to display the node in the tree in the UI.
 *
 * @param workflow {object}
 * @returns {Array}
 */
function convertGraphQLWorkflowToTree (workflow) {
  const cycles = getWorkflowCycles(workflow)
  Object.assign(workflow, {
    __type: 'workflow',
    children: []
  })
  for (const cyclePoint of cycles) {
    const cyclePointNode = {
      __type: 'cyclepoint',
      name: cyclePoint,
      children: [],
      id: cyclePoint,
      state: ''
    }
    workflow.children.push(cyclePointNode)
    // list used to keep the states of children nodes, and then later used to calculate the group-state
    const childStates = []
    for (const taskProxy of workflow.taskProxies) {
      if (taskProxy.cyclePoint === cyclePoint) {
        childStates.push(taskProxy.state)
        Object.assign(taskProxy, {
          __type: 'task',
          name: taskProxy.task.name,
          children: [],
          expanded: false
        })
        cyclePointNode.children.push(taskProxy)
        for (const job of taskProxy.jobs) {
          Object.assign(job, {
            __type: 'job',
            name: `#${job.submitNum}`,
            latestMessage: taskProxy.latestMessage
          })
          taskProxy.children.push(job)
        }
        // calculate task progress if necessary/possible
        if (STATES_WITH_PROGRESS.includes(taskProxy.state) && taskProxy.jobs.length > 0) {
          // the graphql query is expected to have jobs sorted by submit_num, e.g.:
          // `jobs(sort: { keys: ["submit_num"], reverse:true })`
          const latestJob = taskProxy.jobs[0]
          if (Object.hasOwnProperty.call(latestJob, 'startedTime')) {
            const startedTime = Date.parse(latestJob.startedTime)
            taskProxy.progress = computePercentProgress(startedTime, taskProxy.task.meanElapsedTime)
          }
        }
      }
    }
    cyclePointNode.state = extractGroupState(childStates, false)
  }
  return [workflow]
}

export {
  convertGraphQLWorkflowToTree
}
