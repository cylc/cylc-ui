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
import {
  containsTreeData,
  createWorkflowNode,
  createCyclePointNode,
  createFamilyProxyNode,
  createTaskProxyNode,
  createJobNode
} from '@/components/cylc/tree/tree-nodes'

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
        const jobNode = createJobNode(job)
        tree.addJob(jobNode)
      }
    }
  }
}

export {
  populateTreeFromGraphQLData
}
