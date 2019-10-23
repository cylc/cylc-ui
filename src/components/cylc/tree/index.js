import { extractGroupState } from '@/utils/tasks'
import { STATES_WITH_PROGRESS, computePercentProgress } from '@/components/cylc'

/**
 * @private
 * @param entryId {string} a family proxy, or task proxy ID
 * @param separator {string}
 * @returns {{cyclePoint: *, workflow: *, family: *, user: *}}
 */
function parseFamilyId (entryId, separator = '|') {
  // TODO: get the separator (for now we are using "|") from a constant?
  const tokens = entryId.split(separator)
  if (tokens.length !== 4) {
    throw Error(`invalid id ${entryId}`)
  }
  return {
    user: tokens[0],
    workflow: tokens[1],
    cyclePoint: tokens[2],
    family: tokens[3]
  }
}

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
    const parsedFamilyId = parseFamilyId(familyProxy.id)
    if (!lookup.get(parsedFamilyId.cyclePoint)) {
      // create cycle point node, using family's cycle point info
      const cyclePointNode = {
        __type: 'cyclepoint',
        name: parsedFamilyId.cyclePoint,
        children: [],
        id: parsedFamilyId.cyclePoint,
        state: ''
      }
      lookup.set(parsedFamilyId.cyclePoint, cyclePointNode)
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
        name: parsedFamilyId.family,
        children: []
      })
      lookup.set(familyProxy.id, familyProxy)
      // we should not add to the parent just yet, as it could a) not exist, or b) be the root family
    }

    const parsedParentId = parseFamilyId(parent.id)
    if (parsedParentId.family === 'root') {
      // if the parent is root, we use the cyclepoint as the parent
      lookup.get(parsedFamilyId.cyclePoint).children.push(lookup.get(familyProxy.id))
    } else {
      if (!lookup.get(parent.id)) {
        // construct preliminary parent node if not root
        Object.assign(parent, {
          __type: 'family',
          name: parsedParentId.family,
          children: []
        })
        lookup.set(parent.id, parent)
      }
      // attach the family node to its parent (cycle point, or another family, except root family)
      lookup.get(parent.id).children.push(lookup.get(familyProxy.id))
    }
  }

  // simply iterate through tasks, creating the nodes, then attach them to their parents using the lookup map
  for (const taskProxy of workflow.taskProxies) {
    Object.assign(taskProxy, {
      __type: 'task',
      name: taskProxy.task.name,
      children: [],
      expanded: false
    })
    const parsedTaskProxyId = parseFamilyId(taskProxy.firstParent.id)
    if (parsedTaskProxyId.family === 'root') {
      // if the parent is root, we must instead attach this node to the cyclepoint!
      lookup.get(parsedTaskProxyId.cyclePoint).children.push(taskProxy)
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
