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
import pick from 'lodash/pick'
import isArray from 'lodash/isArray'
import { Tokens } from '@/utils/uid'
import { sortedIndexBy } from '@/components/cylc/common/sort'

const NODE_TYPES = [
  'user',
  'workflow-part',
  'workflow',
  'cycle',
  'task',
  'job'
]

const state = () => ({
  cylcTree: {
    $index: {},
    children: []
  },
  /**
   * This holds the name of the current workflow. This is set by VueRouter
   * and is used to decide what's the current workflow. It is used in conjunction
   * with the workflows/workflows (above) when finding the current workflow and
   * using it, for instance, to create the GraphQL variables of a workflow
   * view (see mixins used in the Tree View).
   *
   * @type {String}
   */
  workflowName: null
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
  }
}

/* Initialise the data store. */
function createTree (state) {
  // console.log('@@ Create')
  if (state.cylcTree) {
    return
  }
  state.cylcTree = {
    $index: {},
    id: '$root',
    children: [],
  }
  // console.log('@@')
}

/* Wipe everything in the store. */
function clearTree (state) {
  // console.log('@@ CLEAR')
  for (const child of state.cylcTree.children) {
    remove(state, child.id)
  }
  // console.log('@@')
}

/* Add a node to the global $index (flat lookup). */
function addIndex (state, id, treeNode) {
  if (state.cylcTree.$index[id] === undefined) {
    // this is a new node => create it
    // console.log(`$i ++ ${id}`)
    state.cylcTree.$index[id] = treeNode
  }
}

/* Remove a node from the global $index (flat lookup). */
function removeIndex (state, id) {
  // console.log(`$i -- ${id}`)
  delete state.cylcTree.$index[id]
}

/* Retrieve a node from the global $index (flat lookup). */
function getIndex (state, id) {
  if (id === '$root') {
    // speial ID maps onto the tree root element
    // (note this avoids a circular reference which VueX does not like)
    return state.cylcTree
  }
  return state.cylcTree.$index[id]
}

/* Add a child node under a parent Node */
function addChild (parentNode, childNode) {
  // determine which list to add this node to
  // console.log(`$t ++ ${childNode.id}`)
  let key = 'children'
  if (childNode.type === '$namespace') {
    key = '$namespaces'
  } else if (childNode.type === '$edge') {
    key = '$edges'
  } else if (parentNode.type === 'cycle' && childNode.type === 'family') {
    key = 'familyTree'
  }

  if (childNode.type === 'workflow') {
    // create additional indexes for workflow nodes
    childNode.$edges = []
    childNode.$namespaces = []
  }

  // insert the child preserving sort order
  let comparator
  if (['cycle', 'family'].includes(parentNode.type)) {
    // sort by type, then name
    // (this makes families sort before tasks in the graph)
    comparator = (n) => `${n.type}-${n.name}`
  } else {
    // sort by name
    comparator = (n) => n.name
  }
  const reverse = ['cycle', 'job'].includes(childNode.type)
  const index = sortedIndexBy(
    parentNode[key],
    childNode,
    comparator,
    { reverse }
  )
  parentNode[key].splice(index, 0, childNode)
}

/* Remove a child node from a parent node. */
function removeChild (state, node, parentNode = null) {
  // console.log(`$t -- ${node.id}`)
  let key = 'children'
  if (node.type === '$namespace') {
    key = '$namespaces'
  } else if (node.type === '$edge') {
    key = '$edges'
  }
  if (!parentNode) {
    parentNode = getIndex(state, node.parent)
    if (!parentNode) {
      // parent node no longer in the store (this should not happen)
      return
    }
  }
  parentNode[key].splice(
    parentNode[key].indexOf(node), 1
  )
}

/* Recursively remove a node and anything underneath it.
 *
 * Set removeParent to also remove the parent node (convenience method to avoid
 * parent lookup).
 * */
function removeTree (state, node, removeParent = true) {
  let pointer
  const stack = [
    ...node.children || [],
    ...node.familyTree || []
  ]
  const removeIndicies = [
    ...node.$namespaces || [],
    ...node.$edges || []
  ]
  const removeNodes = []
  while (stack.length) {
    // walk the tree under the provided node to list nodes and indices for
    // deletion
    pointer = stack.pop()
    stack.push(
      ...(pointer.children || []),
      ...(pointer.familyTree || []),
    )
    removeIndicies.push(
      ...(pointer.$namespaces || []),
      ...(pointer.$edges || []),
    )
    removeNodes.push(pointer)
  }
  for (pointer of [...removeIndicies, ...removeNodes.reverse()]) {
    // remove indexes first, then remove tree nodes from the bottom up
    removeIndex(state, pointer.id)
    removeChild(state, pointer)
  }
  if (removeParent) {
    // remove the parent of the provided node if requested
    removeIndex(state, node.id)
    removeChild(state, node)
  }
}

/* Remove any childless parents above this node.
 *
 * This removes tasks / cycles / families etc, but stops at workflows.
 * */
function cleanParents (state, node) {
  let pointer = node
  while (pointer?.parent) {
    if (pointer.type !== 'workflow') {
      // don't prune workflow nodes
      // (this requires an explicit instruction to do so)
      if (!pointer.children.length) {
        // node has no children -> prune it
        removeIndex(state, node.id)
        removeChild(state, pointer)
      } else {
        // node has children stop here
        break
      }
    }
    pointer = getIndex(state, pointer.parent)
  }
}

/**
 * Build the familyTree based on the family information containined
 * in this node.
 */
function applyInheritance (state, node) {
  if (node.type === 'family' && node.node.childTasks) {
    // build a mapping of {childID: childNode} for faster lookup
    const childIDs = node.children.reduce((map, obj) => { map[obj.id] = obj; return map }, {})
    for (const child of node.node.childTasks) {
      if (!(child.id in childIDs)) {
        // add any new tasks to the family
        const childNode = getIndex(state, child.id)
        if (childNode) {
          addChild(node, childNode)
        }
      }
    }
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
    Object.assign(treeItem.node, updatedData)
    applyInheritance(state, treeItem)
    return
  }

  // create a new tree item
  let treeParent
  const ret = createTreeNode(state, id, tokens, updatedData)
  if (!ret) {
    // node already exists, nothing more to do here
    return
  }
  [treeParent, treeItem] = ret

  // add the new item to the tree
  addChild(treeParent, treeItem)
  applyInheritance(state, treeItem)

  // add an entry for this item into the index
  addIndex(state, id, treeItem)
}

/* Return the family hierarchy leading to a node.
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

  // add family levels below the cycle point
  for (const ancestor of node.ancestors.slice().reverse()) {
    ret.push([
      'family',
      ancestor.name,
      lastTokens.clone({ task: ancestor.name })
    ])
  }

  // add the family itself
  ret.push([
    'family',
    tokens[tokens.lowestToken()],
    tokens
  ])

  return ret
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
  let childAttribute
  for (const [partType, partName, partTokens] of tree) {
    if (pointer.type === 'cycle' && type === 'family') {
      childAttribute = 'familyTree'
    } else {
      childAttribute = 'children'
    }
    const child = pointer[childAttribute].find(
      ({ name }) => name === partName
    )
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
          id: partTokens.id
        },
        parent: pointer.id,
        tokens: partTokens,
        type: partType,
        children: [],
        familyTree: partType === 'cycle' ? [] : undefined,
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

  if (pointer.children.some(child => child.id === id)) {
    // node already in the tree
    return
  }

  const treeNode = {
    id,
    tokens,
    name,
    type,
    parent: pointer.id,
    node,
    children: [],
    familyTree: type === 'cycle' ? [] : undefined,

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
    // remove edge node
    parentNode.$edges.splice(
      parentNode.$edges.indexOf(treeNode), 1
    )
  } else if (treeNode.type === '$namespace') {
    // remove namespace node
    parentNode.$namespaces.splice(
      parentNode.$namespaces.indexOf(treeNode), 1
    )
  } else if (treeNode.type === 'family') {
    const firstParent = getIndex(state, treeNode.node.ancestors.slice(-1).id)
    // remove family proxy node
    removeChild(state, treeNode, firstParent)
  } else {
    if (treeNode.type === 'task' && treeNode.node.firstParent) {
      // remove task from its primary family
      const familyNode = getIndex(state, treeNode.node.firstParent.id)
      removeChild(state, treeNode, familyNode)
    }
    // remove ~user[/path/to...]/workflow//cycle/task/job node
    removeTree(state, treeNode)
    cleanParents(state, parentNode)
  }

  // remove the node from the store
  delete state.cylcTree.$index[id]
}

const mutations = {
  // the old callback methods
  SET_WORKFLOW_NAME (state, data) {
    state.workflowName = data
  },
  // the new cylc tree methods
  CREATE: createTree,
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
    Object.keys(pick(pruned, PRUNED_KEYS_MULT)).forEach(prunedKey => {
      if (pruned[prunedKey]) {
        for (const prunedID of pruned[prunedKey]) {
          remove(state, prunedID)
        }
      }
    })
    Object.keys(pick(pruned, PRUNED_KEYS_SING)).forEach(prunedKey => {
      if (pruned[prunedKey]) {
        remove(state, pruned[prunedKey])
      }
    })
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
  CLEAR: clearTree
}

// NOTE: deltas are applied in the order listed here
// NOTE: we must create tasks before families (note cycles ARE families
// because of the way we request them)
const KEYS = ['workflow', 'taskProxies', 'cyclePoints', 'familyProxies', 'jobs', 'edges']

// Pruned keys which return arrays of pruned IDs
const PRUNED_KEYS_MULT = ['taskProxies', 'familyProxies', 'jobs', 'edges']
// Pruned keys which contain single pruned IDs
const PRUNED_KEYS_SING = ['workflow']

const actions = {}

export const workflows = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
