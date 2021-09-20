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

// TODO: move to the `options` parameter that is passed to deltas; ideally it would be stored in DB or localstorage.
const DEFAULT_PARTS_SEPARATOR = '|'
const DEFAULT_NAMES_SEPARATOR = '/'

/**
 * @typedef {Object} TreeNode
 * @property {String} id
 * @property {String|null} name
 * @property {String} type
 * @property {WorkflowGraphQLData} node
 */

/**
 * @typedef {TreeNode} WorkflowGScanNode
 */

/**
 * @typedef {TreeNode} WorkflowNamePartGScanNode
 * @property {Array<WorkflowNamePartGScanNode>} children
 */

/**
 * Create a workflow node for GScan component.
 *
 * If the `hierarchy` parameter is `true`, then the workflow name will be split by
 * `/`'s. For each part, a new `WorkflowNamePart` will be added in the hierarchy.
 * With the final node being the last part of the name.
 *
 * The last part of a workflow name may be the workflow name (e.g. `five`), or its
 * run ID (e.g. `run1`, if workflow name is `five/run1`).
 *
 * @param {WorkflowGraphQLData} workflow
 * @param {boolean} hierarchy - whether to parse the Workflow name and create a hierarchy or not
 * @param {String} partsSeparator - separator for workflow name parts (e.g. '|' as in 'part1|part2|...')
 * @param {String} namesSeparator - separator used for workflow and run names (e.g. '/' as in 'workflow/run1')
 * @returns {TreeNode}
 */
function createWorkflowNode (workflow, hierarchy, partsSeparator = DEFAULT_PARTS_SEPARATOR, namesSeparator = DEFAULT_NAMES_SEPARATOR) {
  if (!hierarchy) {
    return newWorkflowNode(workflow, null)
  }
  const workflowNameParts = parseWorkflowNameParts(workflow.id, partsSeparator, namesSeparator)
  let prefix = workflowNameParts.user
  // The root node, returned in this function.
  let rootNode = null
  // And a helper used when iterating the array...
  let currentNode = null
  for (const part of workflowNameParts.parts) {
    prefix = prefix === null ? part : `${prefix}${partsSeparator}${part}`
    const partNode = newWorkflowPartNode(prefix, part, workflow.id, workflow.latestStateTasks, workflow.stateTotals)
    if (rootNode === null) {
      rootNode = currentNode = partNode
    } else {
      currentNode.children.push(partNode)
      currentNode = partNode
    }
  }
  const workflowNode = newWorkflowNode(workflow, workflowNameParts.name)

  if (currentNode === null) {
    // We will return the workflow node only. It will be appended directly to the tree as a new leaf.
    rootNode = workflowNode
  } else {
    // Add the workflow node to the end of the branch as a leaf. Note that the top of the branch is returned in this case.
    currentNode.children.push(workflowNode)
  }
  return rootNode
}

/**
 * Create a new Workflow Node.
 *
 * @param {WorkflowGraphQLData} workflow
 * @param {String|null} part
 * @returns {WorkflowGScanNode}
 * @private
 */
function newWorkflowNode (workflow, part) {
  return {
    id: workflow.id,
    name: part,
    type: 'workflow',
    node: workflow
  }
}

/**
 * Create a new Workflow name part Node.
 *
 * @param {string} id
 * @param {string} part
 * @param {string} workflowId
 * @param {Object} latestStateTasks
 * @param {Object} stateTotals
 * @return {WorkflowNamePartGScanNode}
 */
function newWorkflowPartNode (id, part, workflowId, latestStateTasks = [], stateTotals = []) {
  return {
    id,
    name: part,
    type: 'workflow-name-part',
    node: {
      id,
      workflowId,
      name: part,
      status: '',
      descendantsLatestStateTasks: {
        [workflowId]: latestStateTasks
      },
      descendantsStateTotal: {
        [workflowId]: stateTotals
      },
      latestStateTasks: {},
      stateTotals: {}
    },
    children: []
  }
}

/**
 * @typedef {Object} ParsedWorkflowNameParts
 * @property {String} workflowId - workflow ID
 * @property {String} partsSeparator - parts separator parameter used to parse the name
 * @property {String} namesSeparator - names separator parameter used to parse the name
 * @property {String} user - parsed workflow user/owner
 * @property {String} workflowName - original workflow name
 * @property {Array<String>} parts - workflow name parts
 * @property {String} name - workflow name (last part, used to display nodes in the GScan tree)
 */

/**
 * Return the workflow name parts as an array of node IDs. The first node in the array is the top of the
 * branch, with the workflow node ID at its other end, as a leaf-node.
 *
 * @param {ParsedWorkflowNameParts} workflowNameParts
 * @return {Array<String>}
 */
function getWorkflowNamePartsNodesIds (workflowNameParts) {
  let prefix = workflowNameParts.user
  const nodesIds = workflowNameParts.parts
    .map(part => {
      prefix = `${prefix}${workflowNameParts.partsSeparator}${part}`
      return prefix
    })
  nodesIds.push(workflowNameParts.workflowId)
  return nodesIds
}

/**
 * Parses the workflow name parts. A simple name such as `user|workflow-name` will return a structure
 * with each part of the name, including the given parameters of this function (to simplify sending
 * the data to other methods).
 *
 * More complicated names such as `user|top/level/other/leaf` return the structure with an array of
 * each name part too. This is useful for functions that need to manipulate the tree of GScan nodes,
 * and necessary as we don't have this information from the server (only the name which doesn't
 * split the name parts).
 *
 * @param {String} workflowId - Workflow ID
 * @param {String} partsSeparator - separator for workflow name parts (e.g. '|' as in 'user|research/workflow/run1')
 * @param {String} namesSeparator - separator used for workflow and run names (e.g. '/' as in 'research/workflow/run1')
 * @return {ParsedWorkflowNameParts}
 */
function parseWorkflowNameParts (workflowId, partsSeparator = DEFAULT_PARTS_SEPARATOR, namesSeparator = DEFAULT_NAMES_SEPARATOR) {
  if (!workflowId || workflowId.trim() === '') {
    throw new Error('Missing ID for workflow name parts')
  }
  const idParts = workflowId.split(partsSeparator)
  if (idParts.length !== 2) {
    throw new Error(`Invalid parts found, expected at least 2 parts in ${workflowId}`)
  }
  const user = idParts[0]
  const workflowName = idParts[1]
  const parts = workflowName.split(namesSeparator)
  // The name, used for display in the tree. Can be a workflow name like 'd', or a runN like 'run1'.
  const name = parts.pop()
  return {
    workflowId,
    partsSeparator,
    namesSeparator,
    user, // user
    workflowName, // a/b/c/d/run1
    parts, // [a, b, c, d]
    name // run1
  }
}

export {
  createWorkflowNode,
  getWorkflowNamePartsNodesIds,
  parseWorkflowNameParts
}
