import { extractGroupState } from '@/utils/tasks'
import { computePercentProgress } from '@/components/cylc'

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
  // the workflow object gets augmented to become a valid node for the tree
  Object.assign(workflow, {
    __type: 'workflow',
    children: []
  })
  // a lookup map to hold the ID's as keys, and object instances as values, will be later used when iterating tasks
  const lookup = new Map()
  // build hierarchy of cycle-point with zero or many families, and each family with zero or many other families
  for (const familyProxy of workflow.familyProxies) {
    const parent = familyProxy.firstParent
    if (!lookup.get(familyProxy.cyclePoint)) {
      // create cycle point node, using family's cycle point info
      const cyclePointNode = {
        __type: 'cyclepoint',
        name: familyProxy.cyclePoint,
        children: [],
        id: familyProxy.cyclePoint,
        state: ''
      }
      lookup.set(familyProxy.cyclePoint, cyclePointNode)
      // a cycle point must go directly under the workflow
      workflow.children.push(cyclePointNode)
    }

    // skip the root family, which has null as its first parent
    if (parent === null) {
      continue
    }
    if (!lookup.get(familyProxy.id)) {
      // create family proxy node for the tree
      Object.assign(familyProxy, {
        __type: 'family',
        name: familyProxy.name,
        children: []
      })
      lookup.set(familyProxy.id, familyProxy)
      // we should not add to the parent just yet, as it could a) not exist, or b) be the root family
    }

    if (parent.name === 'root') {
      // if the parent is root, we use the cyclepoint as the parent
      lookup.get(familyProxy.cyclePoint).children.push(lookup.get(familyProxy.id))
    } else {
      if (!lookup.get(parent.id)) {
        // construct preliminary parent node if not root
        Object.assign(parent, {
          __type: 'family',
          name: parent.name,
          children: []
        })
        lookup.set(parent.id, parent)
      }
      // attach the family node to its parent (cycle point, or another family, except root family)
      lookup.get(parent.id).children.push(lookup.get(familyProxy.id))
    }
  }

  workflow.children.sort((cyclepoint, anotherCyclepoint) => {
    return cyclepoint.id.localeCompare(anotherCyclepoint.id)
  })

  // simply iterate through tasks, creating the nodes, then attach them to their parents using the lookup map
  for (const taskProxy of workflow.taskProxies) {
    Object.assign(taskProxy, {
      __type: 'task',
      name: taskProxy.task.name,
      children: [],
      expanded: false
    })
    if (taskProxy.firstParent.name === 'root') {
      // if the parent is root, we must instead attach this node to the cyclepoint!
      lookup.get(taskProxy.firstParent.cyclePoint).children.push(taskProxy)
    } else {
      lookup.get(taskProxy.firstParent.id).children.push(taskProxy)
    }
    for (const job of taskProxy.jobs) {
      Object.assign(job, {
        __type: 'job',
        name: `#${job.submitNum}`,
        latestMessage: taskProxy.latestMessage
      })
      taskProxy.children.push(job)
    }
    // calculate task progress if necessary/possible
    if (taskProxy.state === 'running' && taskProxy.jobs.length > 0) {
      // the graphql query is expected to have jobs sorted by submit_num, e.g.:
      // `jobs(sort: { keys: ["submit_num"], reverse:true })`
      const latestJob = taskProxy.jobs[0]
      if (Object.hasOwnProperty.call(latestJob, 'startedTime')) {
        const startedTime = Date.parse(latestJob.startedTime)
        taskProxy.progress = computePercentProgress(startedTime, taskProxy.task.meanElapsedTime)
      }
    }
  }

  // last step now is to calculate the group-state for cycle-points, based on its direct children's states
  for (const cyclepoint of workflow.children) {
    const childStates = []
    for (const child of cyclepoint.children) {
      childStates.push(child.state)
    }
    cyclepoint.state = extractGroupState(childStates, false)
  }
  return [workflow]
}

export {
  convertGraphQLWorkflowToTree
}
