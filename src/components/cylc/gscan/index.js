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
import Vue from 'vue'
import { mergeWith } from 'lodash'
import { sortedIndexBy } from '@/components/cylc/common/sort'
import { mergeWithCustomizer } from '@/components/cylc/common/merge'
import { sortWorkflowNamePartNodeOrWorkflowNode } from '@/components/cylc/gscan/sort'
import {
  createWorkflowNode,
  getWorkflowNamePartsNodesIds,
  parseWorkflowNameParts
} from '@/components/cylc/gscan/nodes'

/**
 * @typedef {Object} GScan
 * @property {Array<TreeNode>} tree
 * @property {Lookup} lookup
 */

/**
 * @typedef {Object<String, TreeNode>} Lookup
 */

// --- Added

/**
 * Add a new workflow to the GScan data structure.
 *
 * @param {TreeNode} workflow
 * @param {GScan} gscan
 * @param {*} options
 */
function addWorkflow (workflow, gscan, options) {
  const hierarchical = options.hierarchical || true
  const workflowNode = createWorkflowNode(workflow, hierarchical)
  if (hierarchical) {
    // TBD: We need the leaf node to propagate states, and this is done here since the
    //      addHierarchicalWorkflow has recursion. There might be a better way for
    //      handling this though?
    let leafNode = workflowNode
    while (leafNode.children) {
      // [0] because this is not really a sparse tree, but more like a linked-list since
      // we created the node with createWorkflowNode.
      leafNode = leafNode.children[0]
    }
    addHierarchicalWorkflow(workflowNode, leafNode, gscan.lookup, gscan.tree, options)
  } else {
    gscan.lookup[workflow.id] = workflowNode
    gscan.tree.push(workflowNode)
  }
}

/**
 * This function is private. It receives a lookup and tree instead of a GScan object (as in other
 * functions of this module). This is required as we apply recursion for adding nodes into the tree,
 * but we replace the tree and pass only a sub-tree.
 *
 * @param workflowOrPart
 * @param workflow
 * @param {Lookup} lookup
 * @param {Array<TreeNode>} tree
 * @param {*} options
 * @private
 */
function addHierarchicalWorkflow (workflowOrPart, workflow, lookup, tree, options) {
  if (!lookup[workflowOrPart.id]) {
    // A new node. Let's add this node and its descendants to the lookup.
    lookup[workflowOrPart.id] = workflowOrPart
    if (workflowOrPart.children) {
      const stack = [...workflowOrPart.children]
      while (stack.length) {
        const currentNode = stack.shift()
        lookup[currentNode.id] = currentNode
        if (currentNode.children) {
          stack.push(...currentNode.children)
        }
      }
    }
    // And now add the node to the tree. Here we calculate what is the index for this element.
    // If we decide to have ASC and DESC, then we just need to invert the location of the node,
    // something like `sortedIndex = (array.length - sortedIndex)`.
    const sortedIndex = sortedIndexBy(
      tree,
      workflowOrPart,
      (n) => n.name,
      sortWorkflowNamePartNodeOrWorkflowNode
    )
    tree.splice(sortedIndex, 0, workflowOrPart)
  } else {
    // The node exists in the lookup, so must exist in the tree too. We will have to merge the hierarchies.
    const existingNode = lookup[workflowOrPart.id]
    if (existingNode.children) {
      // Propagate workflow states to its ancestor.
      if (workflow.node.latestStateTasks && workflow.node.stateTotals) {
        existingNode.node.descendantsLatestStateTasks[workflow.id] = workflow.node.latestStateTasks
        existingNode.node.descendantsStateTotal[workflow.id] = workflow.node.stateTotals
        tallyPropagatedStates(existingNode.node)
      }
      // Copy array since we will iterate it, and modify existingNode.children
      // (see the tree.splice above.)
      const children = [...workflowOrPart.children]
      for (const child of children) {
        // Recursion!
        addHierarchicalWorkflow(child, workflow, lookup, existingNode.children, options)
      }
    } else {
      // Here we have an existing workflow node (only child-less). Let's merge it.
      // It should not happen actually, since this is adding a workflow. Maybe throw
      // an error instead?
      mergeWith(existingNode, workflowOrPart, mergeWithCustomizer)
    }
  }
}

// --- Updated

/**
 * Update a workflow in the GScan data structure.
 *
 * @param {WorkflowGraphQLData} workflow
 * @param {GScan} gscan
 * @param {Object} options
 */
function updateWorkflow (workflow, gscan, options) {
  // We don't care whether it is hierarchical or not here, since we can quickly
  // access the node via the GScan lookup.
  const existingData = gscan.lookup[workflow.id]
  if (!existingData) {
    throw new Error(`Updated node [${workflow.id}] not found in workflow lookup`)
  }
  mergeWith(existingData.node, workflow, mergeWithCustomizer)
  const hierarchical = options.hierarchical || true
  if (hierarchical) {
    // But now we need to propagate the states up to its ancestors, if any.
    updateHierarchicalWorkflow(existingData, gscan.lookup, gscan.tree, options)
  }
  Vue.set(gscan.lookup, existingData.id, existingData)
}

function updateHierarchicalWorkflow (existingData, lookup, tree, options) {
  const workflowNameParts = parseWorkflowNameParts(existingData.id)
  // nodesIds contains the list of GScan tree nodes, with the workflow being a leaf node.
  const nodesIds = getWorkflowNamePartsNodesIds(workflowNameParts)
  const workflowId = nodesIds.pop()
  const parentId = nodesIds.length > 0 ? nodesIds.pop() : null
  const parent = parentId ? lookup[parentId] : tree
  if (!parent) {
    // This is only possible if the parent was missing from the lookup... Never supposed to happen.
    throw new Error(`Invalid orphan hierarchical node: ${existingData.id}`)
  }
  const siblings = parent.children
  // Where is this node at the moment?
  const currentIndex = siblings.findIndex(node => node.id === existingData.id)
  // Where should it be now?
  const sortedIndex = sortedIndexBy(
    siblings,
    existingData,
    (n) => n.name,
    sortWorkflowNamePartNodeOrWorkflowNode
  )
  // If it is not where it must be, we need to move it to its correct location.
  if (currentIndex !== sortedIndex) {
    // First we remove the element from where it was.
    siblings.splice(currentIndex, 1)
    if (sortedIndex < currentIndex) {
      // Now, if we must move the element to a position that is less than where it was, we can simply move it;
      siblings.splice(sortedIndex, 0, existingData)
    } else {
      // however, if we are moving it down/later, we must compensate for itself. i.e. the sortedIndex is considering
      // the element itself. So we subtract one from its position.
      siblings.splice(sortedIndex - 1, 0, existingData)
    }
  }
  // Finally, we need to propagate the state totals and latest state tasks,
  // but only if we have a parent (otherwise we are at the top-most level).
  if (parentId) {
    const workflow = lookup[workflowId]
    const latestStateTasks = workflow.node.latestStateTasks
    const stateTotals = workflow.node.stateTotals
    // Installed workflows do not have any state.
    if (latestStateTasks && stateTotals) {
      for (const parentNodeId of [...nodesIds, parentId]) {
        const parentNode = lookup[parentNodeId]
        if (parentNode.latestStateTasks && parentNode.stateTotals) {
          mergeWith(parentNode.node.descendantsLatestStateTasks[workflow.id], latestStateTasks, mergeWithCustomizer)
          mergeWith(parentNode.node.descendantsStateTotal[workflow.id], stateTotals, mergeWithCustomizer)
          tallyPropagatedStates(parentNode.node)
        }
      }
    }
  }
}

/**
 * Computes the latestStateTasks of each node. The latestStateTasks and
 * stateTotals of a workflow-name-part are not reactive, but are calculated
 * based on the values of descendantsLatestStateTasks and descendantsStateTotal,
 * so we need to keep these in sync any time we add or update descendants.
 *
 * @param {WorkflowGraphQLData} node
 */
function tallyPropagatedStates (node) {
  for (const latestStateTasks of Object.values(node.descendantsLatestStateTasks)) {
    for (const state of Object.keys(latestStateTasks)) {
      if (node.latestStateTasks[state]) {
        node.latestStateTasks[state].push(...latestStateTasks[state])
      } else {
        Vue.set(node.latestStateTasks, state, latestStateTasks[state])
      }
    }
  }
  for (const stateTotals of Object.values(node.descendantsStateTotal)) {
    for (const state of Object.keys(stateTotals)) {
      if (node.stateTotals[state]) {
        Vue.set(node.stateTotals, state, node.stateTotals[state] + stateTotals[state])
      } else {
        Vue.set(node.stateTotals, state, stateTotals[state])
      }
    }
  }
}

// -- Pruned

/**
 * Remove the workflow with ID equals to the given `workflowId` from the GScan data structure.
 *
 * @param {String} workflowId
 * @param {GScan} gscan
 * @param {*} options
 */
function removeWorkflow (workflowId, gscan, options) {
  const workflow = gscan.lookup[workflowId]
  if (!workflow) {
    throw new Error(`Pruned node [${workflow.id}] not found in workflow lookup`)
  }
  const hierarchical = options.hierarchical || true
  if (hierarchical) {
    removeHierarchicalWorkflow(workflowId, gscan.lookup, gscan.tree, options)
  } else {
    removeNode(workflowId, gscan.lookup, gscan.tree)
  }
}

/**
 * This function is private. It removes the workflow associated with the given `workflowId` from the
 * lookup, and also proceeds to remove the leaf-node with the workflow node, and all of its parents that
 * do not have any other descendants.
 *
 * @param {String} workflowId - Existing workflow ID
 * @param {Lookup} lookup
 * @param {Array<TreeNode>} tree
 * @param {Object} options
 * @private
 */
function removeHierarchicalWorkflow (workflowId, lookup, tree, options) {
  const workflowNameParts = parseWorkflowNameParts(workflowId)
  const nodesIds = getWorkflowNamePartsNodesIds(workflowNameParts)
  // We start from the leaf-node, going upward to make sure we don't leave nodes with no children.
  const removedNodeIds = []
  for (let i = nodesIds.length - 1; i >= 0; i--) {
    const nodeId = nodesIds[i]
    const node = lookup[nodeId]
    // If we have children nodes, we MUST not remove the node from the GScan tree, since
    // it contains other workflows branches. Instead, we must only remove the propagated
    // states.
    if (node.children && node.children.length > 0) {
      // If we pruned a workflow that was installed, these states are undefined!
      if (node.node.descendantsLatestStateTasks && node.node.descendantsStateTotal) {
        for (const removedNodeId of removedNodeIds) {
          Vue.delete(node.node.descendantsLatestStateTasks, removedNodeId)
          Vue.delete(node.node.descendantsStateTotal, removedNodeId)
        }
      }
    } else {
      // Now we can remove the node from the lookup, and from its parents children array.
      const previousIndex = i - 1
      const parentId = previousIndex >= 0 ? nodesIds[previousIndex] : null
      if (parentId && !lookup[parentId]) {
        throw new Error(`Failed to locate parent ${parentId} in GScan lookup`)
      }
      const parentChildren = parentId ? lookup[parentId].children : tree
      removeNode(nodeId, lookup, parentChildren)
      removedNodeIds.push(nodeId)
    }
  }
}

/**
 * @param {String} id - ID of the tree node
 * @param {Array<TreeNode>} tree
 * @param {Lookup} lookup
 * @private
 */
function removeNode (id, lookup, tree) {
  Vue.delete(lookup, id)
  const treeNode = tree.find(node => node.id === id)
  if (treeNode) {
    Vue.delete(tree, tree.indexOf(treeNode))
  }
}

export {
  addWorkflow,
  updateWorkflow,
  removeWorkflow
}
