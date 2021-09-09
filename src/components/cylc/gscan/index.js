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
import { createWorkflowNode } from '@/components/cylc/gscan/nodes'

/**
 * @typedef {Object} GScan
 * @property {Array<TreeNode>} tree
 * @property {Lookup} lookup
 */

/**
 * @typedef {Object<String, TreeNode>} Lookup
 */

/**
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

/**
 * @param {WorkflowGraphQLData} workflow
 * @param {GScan} gscan
 * @param {*} options
 */
function updateWorkflow (workflow, gscan, options) {
  // We don't care whether it is hierarchical or not here, since we can quickly
  // access the node via the GScan lookup.
  const existingData = gscan.lookup[workflow.id]
  if (!existingData) {
    throw new Error(`Updated node [${workflow.id}] not found in workflow lookup`)
  }
  mergeWith(existingData.node, workflow, mergeWithCustomizer)
  Vue.set(gscan.lookup, existingData.id, existingData)
}

/**
 * @param {TreeNode} workflow
 * @param {GScan} gscan
 * @param {*} options
 */
function removeWorkflow (workflow, gscan, options) {

}

export {
  addWorkflow,
  updateWorkflow,
  removeWorkflow
}
