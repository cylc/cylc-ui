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

// eslint-disable-next-line no-unused-vars
import CylcTree from '@/components/cylc/tree/cylc-tree'

/**
 * Create a workflow node. Uses the same properties (by reference) as the given workflow,
 * only adding new properties such as type, children, etc.
 *
 * @param workflow {Object} workflow
 * @return {{id: string, type: string, node: Object, children: []}}
 */
function createWorkflowNode (workflow) {
  // Does not have the infinite-tree properties (size, state, etc) because this node is used only to build the
  // initial hierarchy. After that it is discarded, and we return its children (Cylc 7 did not display workflows
  // in the tree).
  return {
    id: workflow.id,
    type: 'workflow',
    node: workflow,
    children: []
  }
}

/**
 * Create a cycle point node ID. Uses the node property `id`.
 *
 * It will split the node ID using the separator. And if the number
 * of tokens is at least three, it will return the three first tokens
 * joined by the separator too.
 *
 * Otherwise returns the node ID.
 *
 * For example, given a node with the following ID's:
 *
 * - 'a|b|c|d'    results in a cycle point node ID 'a|b|c'
 * - 'a|b|c|d|e'  results in a cycle point node ID 'a|b|c'
 * - 'a|b|c'      results in a cycle point node ID 'a|b|c'
 * - 'a|b'        results in a cycle point node ID 'a|b'
 * - ''           results in a cycle point node ID ''
 *
 * @param node {{
 *   id: string
 * }} a tree node
 * @return {string}
 */
function getCyclePointId (node) {
  if (node && node.id) {
    const tokens = node.id.split('|')
    if (tokens.length >= 3) {
      return tokens.splice(0, 3).join('|')
    }
  }
  const nodeId = node && node.id ? node.id : 'undefined'
  throw new Error(`Error extracting cycle point ID from node ID ${nodeId}`)
}

/**
 * Create a cycle point node. Uses the family proxy property `cyclePoint`.
 *
 * @param familyProxy {Object} family proxy
 * @return {{id: string, type: string, node: Object, children: []}}
 */
function createCyclePointNode (familyProxy) {
  const id = getCyclePointId(familyProxy)
  return {
    id: id,
    type: 'cyclepoint',
    node: {
      id: id,
      name: familyProxy.cyclePoint
    },
    children: []
  }
}

/**
 * Create a family proxy node. Contains the same properties (by reference) as the given family,
 * only adding new properties such as type, children, etc.
 *
 * @param familyProxy {Object} family proxy
 * @return {{id: string, type: string, node: Object, children: []}}
 */
function createFamilyProxyNode (familyProxy) {
  return {
    id: familyProxy.id,
    type: 'family-proxy',
    node: familyProxy,
    children: []
  }
}

/**
 * Create a task proxy node. Contains the same properties (by reference) as the given task,
 * only adding new properties such as type, name, children, etc.
 *
 * @param taskProxy {Object} task proxy
 * @return {{id: string, type: string, expanded: boolean, node: Object, children: []}}
 */
// TODO: move expanded state to data later for infinite-tree
function createTaskProxyNode (taskProxy) {
  return {
    id: taskProxy.id,
    type: 'task-proxy',
    node: taskProxy,
    expanded: false,
    children: []
  }
}

function createJobDetailsNode (job) {
  const details = [
    {
      title: 'host id',
      value: job.host
    },
    {
      title: 'job id',
      value: job.jobId
    },
    {
      title: 'batch sys',
      value: job.jobRunnerName
    },
    {
      title: 'submit time',
      value: job.submittedTime
    },
    {
      title: 'start time',
      value: job.startedTime
    },
    {
      title: 'finish time',
      value: job.finishedTime
    },
    {
      title: 'latest message',
      property: job.latestMessage
    }
  ]
  return {
    id: `${job.id}-details`,
    type: 'job-details',
    node: {
      details
    }
  }
}

/**
 * Create a job node. Contains the same properties (by reference) as the given job,
 * only adding new properties such as type, name, etc.
 *
 * @param job {Object} job
 * @param [latestMessage] {string} latest message of the job's task, defaults to an empty string
 * @return {{node: Object, latestMessage: string}}
 * @return {{id: string, type: string, expanded: boolean, latestMessage: string, node: Object, children: []}}
 */
// TODO: re-work the latest message, as this is the task latest message, not the job's...
// TODO: add job-leaf (details) in the hierarchy later for infinite-tree
function createJobNode (job, latestMessage = '') {
  const jobDetailsNode = createJobDetailsNode(job)
  return {
    id: job.id,
    type: 'job',
    expanded: false,
    node: job,
    latestMessage: latestMessage,
    children: [jobDetailsNode]
  }
}

function containsTreeData (workflow) {
  return workflow !== undefined &&
    workflow !== null &&
    workflow.cyclePoints && Array.isArray(workflow.cyclePoints) &&
    workflow.familyProxies && Array.isArray(workflow.familyProxies) &&
    workflow.taskProxies && Array.isArray(workflow.taskProxies)
}

/**
 * Populate the given tree using the also provided GraphQL workflow object.
 *
 * Every node has data, and a .name property used to display the node in the tree in the UI.
 *
 * @param tree {null|CylcTree} - A hierarchical tree
 * @param workflow {null|Object} - GraphQL workflow object
 * @throws {Error} - If the workflow or tree are either null or invalid (e.g. missing data)
 */
function populateTreeFromGraphQLData (tree, workflow) {
  if (!tree || !workflow || !containsTreeData(workflow)) {
    // throw new Error('You must provide valid data to populate the tree!')
    // a stopped workflow is valid, but won't have anything that we can use
    // to populate the tree, only workflow data and empty families
    return
  }
  // the workflow object gets augmented to become a valid node for the tree
  const rootNode = createWorkflowNode(workflow)
  tree.setWorkflow(rootNode)
  for (const cyclePoint of workflow.cyclePoints) {
    const cyclePointNode = createCyclePointNode(cyclePoint)
    tree.addCyclePoint(cyclePointNode)
  }
  for (const familyProxy of workflow.familyProxies) {
    const familyProxyNode = createFamilyProxyNode(familyProxy)
    tree.addFamilyProxy(familyProxyNode)
  }
  for (const taskProxy of workflow.taskProxies) {
    const taskProxyNode = createTaskProxyNode(taskProxy)
    tree.addTaskProxy(taskProxyNode)
    // A TaskProxy could no jobs (yet)
    if (taskProxy.jobs) {
      for (const job of taskProxy.jobs) {
        const jobNode = createJobNode(job, taskProxy.latestMessage)
        tree.addJob(jobNode)
      }
    }
  }
}

export {
  createWorkflowNode,
  createCyclePointNode,
  createFamilyProxyNode,
  createTaskProxyNode,
  createJobNode,
  containsTreeData,
  populateTreeFromGraphQLData,
  getCyclePointId
}
