/**
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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
import { toRaw } from 'vue'
import pick from 'lodash/pick'
import isArray from 'lodash/isArray'
import { Tokens } from '@/utils/uid'
import { sortedIndexBy } from '@/components/cylc/common/sort'
import { discardFromArray } from '@/utils/general'

const NODE_TYPES = Object.freeze([
  'user',
  'workflow-part',
  'workflow',
  'cycle',
  'task',
  'job',
])

const state = () => ({
  cylcTree: {
    $index: {},
    children: [],
  },
})

const getters = {
  /* Return matching nodes from the store.
   *
   * - Specify the type of node you want to find using nodeType.
   * - Specify any IDs you want to filter for by specifying ids, or omit
   *   this argument to return all.
   *
   * Note: This walks the tree from the root node down to the level specified
   * by nodeType every time a node in the tree to this point is added or
   * removed. E.G. if you request 'workflow' nodes, then this node list
   * will be recomputed every time a workflow is added or removed (delta batching
   * may reduce the actual call count).
   */
  getNodes: (state) => (nodeType, ids) => {
    if (!NODE_TYPES.includes(nodeType)) {
      throw new Error(`Invalid node type: ${nodeType}`)
    }

    // node types which are above "nodeType" in the tree
    const parentNodeTypes = NODE_TYPES.slice(0, NODE_TYPES.indexOf(nodeType))

    // walk the tree looking for nodeType nodes
    let item
    const ret = []
    const stack = [...state.cylcTree.children]
    while (stack.length) {
      item = stack.pop()
      if (parentNodeTypes.includes(item.type)) {
        // this is above "nodeType" in the tree, look through its child nodes
        stack.push(...item.children)
      } else if (
        item.type === nodeType &&
        (!ids || ids.includes(item.id))
      ) {
        ret.push(item)
      }
    }
    return ret
  },
}

/* Add a node to the global $index (flat lookup). */
function addIndex (state, id, treeNode) {
  if (state.cylcTree.$index[id] === undefined) {
    // this is a new node => create it
    // console.log(`$i ++ ${id}`)
    state.cylcTree.$index[id] = treeNode
  }
}

/** Remove a node from the global $index (flat lookup). */
function removeIndex (state, id) {
  // console.log(`$i -- ${id}`)
  delete state.cylcTree.$index[id]
}

/** Retrieve a node from the global $index (flat lookup). */
function getIndex (state, id) {
  return state.cylcTree.$index[id]
}

/** Add a child node under a parent Node */
function addChild (parentNode, childNode) {
  // determine which list to add this node to
  // console.log(`$t ++ ${childNode.id}`)
  let key = 'children'
  if (childNode.type === '$namespace') {
    key = '$namespaces'
  } else if (childNode.type === '$edge') {
    key = '$edges'
  } else if (parentNode.type === 'cycle' && childNode.type === 'family') {
    parentNode.rootFamily = childNode
    return
  }

  if (childNode.type === 'workflow') {
    // create additional indexes for workflow nodes
    childNode.$edges = []
    childNode.$namespaces = []
  }

  // insert the child preserving sort order
  const iteratee = ['task', 'family'].includes(childNode.type)
    ? (n) => `${n.type}-${n.name}` // (this makes families sort before tasks in the tree)
    : (n) => n.name
  const reverse = ['cycle', 'job'].includes(childNode.type)
  const index = sortedIndexBy(
    parentNode[key],
    childNode,
    iteratee,
    { reverse }
  )
  parentNode[key].splice(index, 0, childNode)
}

/** Remove a child node from a parent node. */
function removeChild (state, node, parentNode = null) {
  // console.log(`$t -- ${node.id}`)
  parentNode ??= getIndex(state, node.parent)
  if (!parentNode) {
    // parent node no longer in the store (this should not happen)
    return
  }
  const key = ['$namespace', '$edge'].includes(node.type) ? `${node.type}s` : 'children'
  discardFromArray(parentNode[key], node)
}

/**
 * Recursively remove everything underneath a node.
 *
 * @param {boolean} inclusive Also remove the node itself (convenience method to avoid
 * parent lookup).
 */
function removeTree (state, node, inclusive = true) {
  const stack = [
    ...node.children || [],
  ]
  if (node.rootFamily) stack.push(node.rootFamily)
  const removeIndices = [
    ...node.$namespaces || [],
    ...node.$edges || [],
  ]
  const removeNodes = []
  while (stack.length) {
    // walk the tree under the provided node to list nodes and indices for
    // deletion
    const pointer = stack.pop()
    stack.push(
      ...(pointer.children || []),
    )
    if (pointer.rootFamily) stack.push(pointer.rootFamily)
    removeIndices.push(
      ...(pointer.$namespaces || []),
      ...(pointer.$edges || []),
    )
    removeNodes.push(pointer)
  }
  for (const pointer of [...removeIndices, ...removeNodes.reverse()]) {
    // remove index-only items first, then remove tree nodes from the bottom up
    removeIndex(state, pointer.id)
    removeChild(state, pointer)
  }
  if (inclusive) {
    // remove the provided node if requested
    removeIndex(state, node.id)
    removeChild(state, node)
  }
}

/**
 * Remove this node if childless, and its childless ancestors, stopping at the workflow level.
 *
 * If this node is a workflow-part, continue up and stop at the user level.
 */
function cleanParents (state, node) {
  while (node?.parent) {
    if (node.type !== 'workflow') {
      // don't prune workflow nodes
      // (this requires an explicit instruction to do so)
      if (!node.children.length) {
        // node has no children -> prune it
        removeIndex(state, node.id)
        removeChild(state, node)
      } else {
        // node has children stop here
        break
      }
    }
    node = getIndex(state, node.parent)
  }
}

/**
 * Build the familyTree based on the family information contained
 * in this node.
 */
function applyInheritance (state, node) {
  if (node.type === 'family' && node.node.childTasks?.length) {
    // build a set of child IDs for faster lookup
    const childIDs = new Set(toRaw(node).children.map((obj) => obj.id))
    for (const child of toRaw(node).node.childTasks) {
      if (!childIDs.has(child.id)) {
        // add any new tasks to the family
        const childNode = getIndex(state, child.id)
        if (childNode) {
          addChild(node, childNode)
        }
      }
    }
  }
}

/**
 * Collate node state up / down the tree.
 *
 * This handles updates to one node that might affect another, allowing updates
 * to propagate up or down the tree.
 *
 * This currently manages the following fields:
 *   - logRecords
 *   - warningActive
 *
 * The purge argument can be used to strip already actioned keys from the
 * update object. This needs to be done if the update is assigned to the node
 * after this call.
 */
function collateState (state, node, update, newlyCreated) {
  // bubble state up the tree
  if (node.type === 'workflow' && update.logRecords?.length) {
    let parent = node
    if (newlyCreated) {
      parent.node.warningActive = true
      parent = state.cylcTree.$index[parent.parent]
    }
    // walk up the tree
    while (['workflow', 'workflow-part'].includes(parent.type)) {
      parent.node.warningActive = true
      deque(parent.node, 'logRecords', update.logRecords, 10)
      parent = state.cylcTree.$index[parent.parent]
    }
  }

  // push state down the tree
  if (node.type === 'workflow-part' && (update.warningActive !== undefined)) {
    const stack = [node]
    let child
    while (stack.length) {
      child = stack.pop()
      if (child.type === 'workflow') {
        child.node.warningActive = update.warningActive
      } else if (child.type === 'workflow-part') {
        child.node.warningActive = update.warningActive
        stack.push(...child.children)
      }
    }
  }

  // bubble state up the tree (resulting from a push down the tree? - move
  // inside last block?)
  if (['workflow', 'workflow-part'].includes(node.type) && update.warningActive === false) {
    let parent = node
    while (['workflow', 'workflow-part'].includes(parent.type)) {
      parent = state.cylcTree.$index[parent.parent]
      if (parent.node.warningActive) {
        let warningActive = false
        for (const child of parent.children) {
          if (child.id !== node.id && child.node.warningActive) {
            warningActive = true
            break
          }
        }
        parent.node.warningActive = warningActive
      }
    }
  }

  if (!newlyCreated) {
    // these fields are managed exclusively by this routine, don't let them
    // pass through to be erroneously updated by the standard method
    delete update.logRecords
  }
}

/* Add or update data in the store.
 *
 * UpdatedData must have an ID. This will create a node if it does not exist
 * and update it if it does. This will also create any parent nodes in the tree
 * if they are not present.
 */
function update (state, updatedData) {
  const tokens = new Tokens(updatedData.id)
  const id = tokens.id
  // console.log(`@ += ${id}`)

  let treeItem = getIndex(state, id)
  if (treeItem) {
    // node already exists -> update it
    collateState(state, treeItem, updatedData, false)
    Object.assign(treeItem.node, updatedData)
    applyInheritance(state, treeItem)
    return
  }

  // create a new tree item
  let treeParent
  [treeParent, treeItem] = createTreeNode(state, id, tokens, updatedData)

  // add the new item to the tree
  addChild(treeParent, treeItem)
  applyInheritance(state, treeItem)

  // add an entry for this item into the index
  addIndex(state, id, treeItem)
  collateState(state, treeItem, updatedData, true)
}

/**
 * Return the family hierarchy leading to a node.
 *
 * This is the family equivalent to "Tokens.tree".
 */
function getFamilyTree (tokens, node) {
  // tree = [type, name, tokens]
  const ret = []

  // extract the tree up until the cycle point
  let lastTokens
  for (const [type, name, iTokens] of tokens.tree()) {
    ret.push([type, name, iTokens])
    lastTokens = iTokens
    if (type === 'cycle') {
      break
    }
  }

  // N.B. guarding against node.ancestors being undefined sometimes, which shouldn't really happen -
  // possibly caused by https://github.com/cylc/cylc-uiserver/issues/767
  if (!node.ancestors) {
    if (tokens.task !== 'root') {
      // Guess that the root family is the only ancestor if not explicitly listed
      ret.push([
        'family',
        'root',
        lastTokens.clone({ task: 'root' }),
      ])
    }
  } else {
    // Add family levels below the cycle point:
    for (let i = node.ancestors.length; i > 0; i--) {
      const { name } = node.ancestors[i - 1]
      ret.push([
        'family',
        name,
        lastTokens.clone({ task: name }),
      ])
    }
  }

  // add the family itself
  ret.push([
    'family',
    tokens[tokens.lowestToken()],
    tokens,
  ])

  return ret
}

/* Update a rolling array, adding new items and removing old ones.
 */
function deque (node, key, values, maxLength) {
  const old = node[key]
  if (old?.length === undefined) {
    node[key] = values
  } else {
    node[key] = old.concat(values).splice(-1 * maxLength)
  }
}

/* Create a node for insertion into the tree.
 *
 * This will create any parent nodes that are not present in the tree.
 */
function createTreeNode (state, id, tokens, node) {
  let tree = tokens.tree()
  let type
  let name
  if (tokens.namespace) {
    type = '$namespace'
    name = tokens.namespace
    // key = '$namespaces'
  } else if (tokens.edge) {
    type = '$edge'
    name = tokens.id
    // key = '$edges'
  } else if (node.__typename === 'FamilyProxy') {
    type = 'family'
    name = tokens.task
    tree = getFamilyTree(tokens, node)
    tokens = tree.pop()[2]
    id = tokens.id
  } else {
    [type, name] = tree.pop()
  }

  let pointer = state.cylcTree
  let intermediateItem
  for (const [partType, partName, partTokens] of tree) {
    const child = pointer.type === 'cycle' && type === 'family'
      ? pointer.rootFamily
      : getIndex(state, partTokens.id)
    if (!child) {
      // create intermediate node...
      // ...add a tree item
      intermediateItem = {
        id: partTokens.id,
        name: partName,
        node: {
          // create a blank node with just the ID in it
          // when this item is added to the store later this node will be
          // updated in place
          id: partTokens.id,
        },
        parent: pointer.id,
        tokens: partTokens,
        type: partType,
        children: [],
      }
      // add child to the tree
      addChild(pointer, intermediateItem)
      // register child in the index
      addIndex(state, partTokens.id, intermediateItem)
      pointer = intermediateItem
    } else {
      pointer = child
    }
  }

  const treeNode = {
    id,
    tokens,
    name,
    type,
    parent: pointer.id,
    node,
    children: [],
  }
  return [pointer, treeNode]
}

/* Remove an ID from the tree.
 *
 * - If the node has children they will also be removed.
 * - The tree nodes and index entries will both be wiped.
 * - If the node is not in the store this will return (no error).
 */
function remove (state, prunedID) {
  const tokens = new Tokens(prunedID)
  const id = tokens.id
  // console.log(`@ -- ${id}`)

  const treeNode = getIndex(state, id)
  if (treeNode === undefined) {
    // treeNode never existed in the store => ignore
    return
  }

  const parentNode = getIndex(state, treeNode.parent)
  if (treeNode.type === '$edge') {
    discardFromArray(parentNode.$edges, treeNode)
  } else if (treeNode.type === '$namespace') {
    discardFromArray(parentNode.$namespaces, treeNode)
  } else if (treeNode.type === 'family') {
    // Remove family from its parent family
    removeChild(state, treeNode, parentNode)
  } else {
    if (treeNode.type === 'task' && treeNode.node.firstParent) {
      // remove task from its primary family
      const familyNode = getIndex(state, treeNode.node.firstParent.id)
      if (familyNode) removeChild(state, treeNode, familyNode)
    }
    // remove ~user[/path/to...]/workflow//cycle/task/job node
    removeTree(state, treeNode)
    cleanParents(state, parentNode)
  }

  // remove the node from the store
  delete state.cylcTree.$index[id]
}

const mutations = {
  // the new cylc tree methods
  UPDATE: update,
  UPDATE_DELTAS (state, updated) {
    // console.log('@ UPDATE')
    for (const updatedValue of Object.values(pick(updated, KEYS))) {
      const items = isArray(updatedValue) ? updatedValue : [updatedValue]
      for (const updatedData of items) {
        if (updatedData.id) {
          update(state, updatedData)
        }
      }
    }
    // console.log('@@')
  },
  // remove an ID
  REMOVE: remove,
  // remove all IDs contained in a delta
  REMOVE_DELTAS (state, pruned) {
    // console.log('@ REMOVE')
    for (const prunedKey of Object.keys(pick(pruned, PRUNED_KEYS_MULT))) {
      if (pruned[prunedKey]) {
        for (const prunedID of pruned[prunedKey]) {
          remove(state, prunedID)
        }
      }
    }
    for (const prunedKey of Object.keys(pick(pruned, PRUNED_KEYS_SING))) {
      if (pruned[prunedKey]) {
        remove(state, pruned[prunedKey])
      }
    }
    // console.log('@@')
  },
  // remove all children of a node
  REMOVE_CHILDREN (state, id) {
    // console.log('@ REMOVE CHILDREN')
    const workflow = getIndex(state, id)
    if (workflow) {
      removeTree(state, workflow, false)
    }
    // console.log('@@')
  },
}

// NOTE: deltas are applied in the order listed here
// NOTE: we must create tasks before families (note cycles ARE families
// because of the way we request them)
const KEYS = Object.freeze(['workflow', 'taskProxies', 'cyclePoints', 'familyProxies', 'jobs', 'edges'])

// Pruned keys which return arrays of pruned IDs
const PRUNED_KEYS_MULT = Object.freeze(['taskProxies', 'familyProxies', 'jobs', 'edges'])
// Pruned keys which contain single pruned IDs
const PRUNED_KEYS_SING = Object.freeze(['workflow'])

const actions = {}

export const workflows = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}

// For testing:
export {
  cleanParents as __cleanParents,
  removeTree as __removeTree,
}
