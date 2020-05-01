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

import CylcTree from '@/components/cylc/tree/tree'

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
 * Create a cycle point node. Uses the family proxy property `cyclePoint`.
 *
 * @param familyProxy {Object} family proxy
 * @return {{id: string, type: string, node: Object, children: []}}
 */
function createCyclePointNode (familyProxy) {
  return {
    id: familyProxy.cyclePoint,
    type: 'cyclepoint',
    node: {
      id: familyProxy.cyclePoint,
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

/**
 * Create a job node. Contains the same properties (by reference) as the given job,
 * only adding new properties such as type, name, etc.
 *
 * @param job {Object} job
 * @param latestMessage {string} latest message of the job's task
 * @return {{node: Object, latestMessage: string}}
 * @return {{id: string, type: string, node: Object, latestMessage: string}}
 */
// TODO: re-work the latest message, as this is the task latest message, not the job's...
// TODO: add job-leaf (details) in the hierarchy later for infinite-tree
function createJobNode (job, latestMessage) {
  return {
    id: job.id,
    type: 'job',
    node: job,
    latestMessage: latestMessage
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
 * @returns CylcTree|null
 */
function convertGraphQLWorkflowToTree (workflow) {
  if (workflow === null || !workflow.cyclePoints || !workflow.familyProxies || !workflow.taskProxies) {
    return null
  }
  // the workflow object gets augmented to become a valid node for the tree
  const rootNode = createWorkflowNode(workflow)
  const cylcTree = new CylcTree(rootNode)
  for (const cyclePoint of workflow.cyclePoints) {
    const cyclePointNode = createCyclePointNode(cyclePoint)
    cylcTree.addCyclePoint(cyclePointNode)
  }
  for (const familyProxy of workflow.familyProxies) {
    const familyProxyNode = createFamilyProxyNode(familyProxy)
    cylcTree.addFamilyProxy(familyProxyNode)
  }
  for (const taskProxy of workflow.taskProxies) {
    const taskProxyNode = createTaskProxyNode(taskProxy)
    cylcTree.addTaskProxy(taskProxyNode)
    for (const job of taskProxy.jobs) {
      const jobNode = createJobNode(job, taskProxy.latestMessage)
      cylcTree.addJob(jobNode)
    }
  }
  return cylcTree
}

export {
  convertGraphQLWorkflowToTree
}
