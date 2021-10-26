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

/**
 * @param {GScan} gscan
 */
function clear (gscan) {
  ['tree', 'lookup'].forEach(each => {
    Object.keys(gscan[each]).forEach(key => {
      Vue.delete(gscan[each], key)
    })
  })
}

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
  if (hierarchical) {
    const workflowNode = createWorkflowNode(workflow, hierarchical)
    addHierarchicalWorkflow(workflowNode, gscan.lookup, gscan.tree, options)
  } else {
    gscan.lookup[workflow.id] = workflow
    gscan.tree.push(workflow)
  }
}

/**
 * This function is private. It receives a lookup and tree instead of a GScan object (as in other
 * functions of this module). This is required as we apply recursion for adding nodes into the tree,
 * but we replace the tree and pass only a sub-tree.
 *
 * @param workflow
 * @param {Lookup} lookup
 * @param {Array<TreeNode>} tree
 * @param {*} options
 * @private
 */
function addHierarchicalWorkflow (workflow, lookup, tree, options) {
  if (!lookup[workflow.id]) {
    // a new node, let's add this node and its descendants to the lookup
    lookup[workflow.id] = workflow
    if (workflow.children) {
      const stack = [...workflow.children]
      while (stack.length) {
        const currentNode = stack.shift()
        lookup[currentNode.id] = currentNode
        if (currentNode.children) {
          stack.push(...currentNode.children)
        }
      }
    }
    // and now add the top-level node to the tree
    // Here we calculate what is the index for this element. If we decide to have ASC and DESC,
    // then we just need to invert the location of the element, something like
    // `sortedIndex = (array.length - sortedIndex)`.
    const sortedIndex = sortedIndexBy(
      tree,
      workflow,
      (n) => n.name,
      sortWorkflowNamePartNodeOrWorkflowNode
    )
    tree.splice(sortedIndex, 0, workflow)
  } else {
    // we will have to merge the hierarchies
    const existingNode = lookup[workflow.id]
    // TODO: combine states summaries?
    if (existingNode.children) {
      // Copy array since we will iterate it, and modify existingNode.children
      // (see the tree.splice above.)
      const children = [...workflow.children]
      for (const child of children) {
        // Recursion
        addHierarchicalWorkflow(child, lookup, existingNode.children, options)
      }
    } else {
      // Here we have an existing workflow node. Let's merge it.
      mergeWith(existingNode, workflow, mergeWithCustomizer)
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
    updateHierarchicalWorkflow(existingData, gscan.lookup, gscan.tree, options)
  }
  // TODO: create workflow hierarchy (from workflow object), then iterate
  //       it and use lookup to fetch the existing node. Finally, combine
  //       the gscan states (latestStateTasks & stateTotals).
  Vue.set(gscan.lookup, existingData.id, existingData)
}

function updateHierarchicalWorkflow (existingData, lookup, tree, options) {
  // We need to sort its parent again.
  const workflowNameParts = parseWorkflowNameParts(existingData.id)
  const nodesIds = getWorkflowNamePartsNodesIds(workflowNameParts)
  // Discard the last since it's the workflow ID that we already have
  // in the `existingData` object. Now if not empty, we have our parent.
  nodesIds.pop()
  const parentId = nodesIds.length > 0 ? nodesIds.pop() : null
  const parent = parentId ? lookup[parentId] : tree
  if (!parent) {
    throw new Error(`Invalid orphan hierarchical node: ${existingData.id}`)
  }
  const siblings = parent.children
  // Where is this node at the moment?
  const currentIndex = siblings.findIndex(node => node.id === existingData.id)
  // Where should it be now?
  const sortedIndex = sortedIndexBy(
    parent.children,
    existingData,
    (n) => n.name,
    sortWorkflowNamePartNodeOrWorkflowNode
  )
  // If it is not where it is, we need to add it to its correct location.
  if (currentIndex !== sortedIndex) {
    // siblings.splice(currentIndex, 1)
    // siblings.splice(sortedIndex, 0, existingData)
    Vue.delete(siblings, currentIndex)
    Vue.set(siblings, sortedIndex, existingData)
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
  for (let i = nodesIds.length - 1; i >= 0; i--) {
    const nodeId = nodesIds[i]
    const node = lookup[nodeId]
    if (node.children && node.children.length > 0) {
      // We stop as soon as we find a node that still has children.
      break
    }
    // Now we can remove the node from the lookup, and from its parents children array.
    const previousIndex = i - 1
    const parentId = previousIndex >= 0 ? nodesIds[previousIndex] : null
    if (parentId && !lookup[parentId]) {
      throw new Error(`Failed to locate parent ${parentId} in GScan lookup`)
    }
    const parentChildren = parentId ? lookup[parentId].children : tree
    removeNode(nodeId, lookup, parentChildren)
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
  clear,
  addWorkflow,
  updateWorkflow,
  removeWorkflow
}
