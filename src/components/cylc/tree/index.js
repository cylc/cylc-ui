import { extractGroupState } from '@/utils/tasks'
import { computePercentProgress } from '@/components/cylc'

/**
 * Create a workflow node. Uses the same properties (by reference) as the given workflow,
 * only adding new properties such as type, children, etc.
 *
 * @param workflow {Object} workflow
 * @return {{children: [], __type: string}}
 */
function createWorkflowNode (workflow) {
  return {
    __type: 'workflow',
    ...workflow,
    children: []
  }
}

/**
 * Create a cycle point node. Uses the family proxy property `cyclePoint`.
 *
 * @param familyProxy {Object} family proxy
 * @return {{children: [], __type: string, name: *, id: *}}
 */
function createCyclePointNode (familyProxy) {
  return {
    __type: 'cyclepoint',
    id: familyProxy.cyclePoint,
    name: familyProxy.cyclePoint,
    children: []
  }
}

/**
 * Create a family proxy node. Contains the same properties (by reference) as the given family,
 * only adding new properties such as type, children, etc.
 *
 * @param familyProxy {Object} family proxy
 * @return {{children: [], __type: string}}
 */
function createFamilyProxyNode (familyProxy) {
  return {
    __type: 'family',
    ...familyProxy,
    children: []
  }
}

/**
 * Create a task proxy node. Contains the same properties (by reference) as the given task,
 * only adding new properties such as type, name, children, etc.
 *
 * @param taskProxy {Object} task proxy
 * @return {{expanded: boolean, children: [], __type: string, name: *}}
 */
function createTaskProxyNode (taskProxy) {
  return {
    __type: 'task',
    ...taskProxy,
    name: taskProxy.task.name,
    children: [],
    expanded: false
  }
}

/**
 * Create a job node. Contains the same properties (by reference) as the given job,
 * only adding new properties such as type, name, etc.
 *
 * @param job {Object} job
 * @param latestMessage {string} latest message of the job's task
 * @return {{__type: string, name: string, latestMessage: *}}
 */
// TODO: re-work the latest message, as this is the task latest message, not the job's...
function createJobNode (job, latestMessage) {
  return {
    __type: 'job',
    ...job,
    name: `#${job.submitNum}`,
    latestMessage: latestMessage
  }
}

/***
 * Compute the task progress if possible.
 *
 * Only applicable when the task is in the "running" state, and when it has one or more jobs.
 *
 * The formula used to compute the progress is the same as in Cylc 7, using `meanElapsedTime` task property,
 * the latest job's `startedTime`, and the current time.
 *
 * When the progress is successfully computed, the given task proxy node will get an additional property
 * `progress` with type number (integer) between 0 and 100, representing the task progress.
 *
 * @param taskProxyNode {Object} task proxy node
 */
function computeTaskProgress (taskProxyNode) {
  // calculate task progress if necessary/possible
  if (taskProxyNode.state === 'running' && taskProxyNode.jobs.length > 0) {
    // the graphql query is expected to have jobs sorted by submit_num, e.g.:
    // `jobs(sort: { keys: ["submit_num"], reverse:true })`
    const latestJob = taskProxyNode.jobs[0]
    if (Object.hasOwnProperty.call(latestJob, 'startedTime')) {
      const startedTime = Date.parse(latestJob.startedTime)
      taskProxyNode.progress = computePercentProgress(startedTime, taskProxyNode.task.meanElapsedTime)
    }
  }
}

/**
 * Compute the state of each cycle point node in the list given.
 *
 * The formula used to compute each cycle point state is the same as in Cylc 7, using an enum of task types.
 *
 * After the state is successfully computed, each cycle point node gets an additional property `state`
 * with type string, representing the cycle point state.
 *
 * @param cyclePointNodes {Array} list of cycle point nodes.
 */
function computeCyclePointsStates (cyclePointNodes) {
  for (const cyclePointNode of cyclePointNodes) {
    const childStates = []
    for (const child of cyclePointNode.children) {
      childStates.push(child.state)
    }
    cyclePointNode.state = extractGroupState(childStates, false)
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
 * @returns Object
 */
function convertGraphQLWorkflowToTree (workflow) {
  // the workflow object gets augmented to become a valid node for the tree
  const rootNode = createWorkflowNode(workflow)
  // a lookup map to hold the ID's as keys, and object instances as values, will be later used when iterating tasks
  const lookup = new Map()
  // build hierarchy of cycle-point with zero or many families, and each family with zero or many other families
  // TODO: most of this for-loop and code within might be removed later: https://github.com/cylc/cylc-ui/issues/354#issuecomment-585003621
  for (const familyProxy of rootNode.familyProxies) {
    const parent = familyProxy.firstParent
    if (!lookup.get(familyProxy.cyclePoint)) {
      // create cycle point node, using family's cycle point info
      const cyclePointNode = createCyclePointNode(familyProxy)
      lookup.set(cyclePointNode.id, cyclePointNode)
      // a cycle point must go directly under the workflow
      rootNode.children.push(cyclePointNode)
    }

    // skip the root family, which has null as its first parent
    if (parent === null) {
      continue
    }
    if (!lookup.get(familyProxy.id)) {
      const familyProxyNode = createFamilyProxyNode(familyProxy)
      lookup.set(familyProxyNode.id, familyProxyNode)
      // we add to the lookup table, but we should not add to the parent just yet, as it could a) not exist, or b) be the root family
    }

    // if the parent is root, we use the cyclepoint as the parent
    if (parent.name === 'root') {
      lookup.get(familyProxy.cyclePoint).children.push(lookup.get(familyProxy.id))
    } else {
      if (!lookup.get(parent.id)) {
        // construct preliminary parent node if not root
        const familyProxyNode = createFamilyProxyNode(parent)
        lookup.set(familyProxyNode.id, familyProxyNode)
      }
      // attach the family node to its parent (cycle point, or another family, except root family)
      lookup.get(parent.id).children.push(lookup.get(familyProxy.id))
    }
  }

  // sort cycle points
  rootNode.children.sort((cyclepoint, anotherCyclepoint) => {
    return cyclepoint.id.localeCompare(anotherCyclepoint.id)
  })

  // simply iterate through tasks, creating the nodes, then attach them to their parents using the lookup map
  for (const taskProxy of rootNode.taskProxies) {
    const taskProxyNode = createTaskProxyNode(taskProxy)
    // if the parent is root, we must instead attach this node to the cyclepoint!
    if (taskProxyNode.firstParent.name === 'root') {
      lookup.get(taskProxyNode.firstParent.cyclePoint).children.push(taskProxyNode)
    } else {
      lookup.get(taskProxyNode.firstParent.id).children.push(taskProxyNode)
    }
    for (const job of taskProxyNode.jobs) {
      const jobNode = createJobNode(job, taskProxyNode.latestMessage)
      taskProxyNode.children.push(jobNode)
    }
    computeTaskProgress(taskProxyNode)
  }

  // last step now is to calculate the group-state for cycle-points, based on its direct children's states
  computeCyclePointsStates(rootNode.children)

  // return the tree children, excluding the Workflow root node, which is not used by the Cylc UI (same as in Cylc 7).
  return rootNode.children
}

export {
  convertGraphQLWorkflowToTree
}
