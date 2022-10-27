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
import mergeWith from 'lodash/mergeWith'
import { mergeWithCustomizer } from '@/components/cylc/common/merge'
import Vue from 'vue'
import { clear } from '@/components/cylc/tree/index'
import { Tokens } from '@/utils/uid'
import { sortedIndexBy } from '@/components/cylc/common/sort'

const state = {
  /**
   * This stores workflow data as a hashmap/dictionary. The keys
   * are the ID's of the entities returned from GraphQL.
   *
   * The values of the dictionary hold the GraphQL data returned as-is.
   *
   * The intention is for workflow views to look up data in this structure
   * and re-use, instead of duplicating it.
   *
   * @type {Object.<String, Object>}
   */
  lookup: {},
  cylcTree: {
    $index: {},
    children: []
  },
  /**
   * This is the CylcTree, which contains the hierarchical tree data structure.
   * It is created from the GraphQL data, with the only difference that this one
   * contains hierarchy, while the lookup (not workflow.lookup) is flat-ish.
   *
   * The nodes in the .tree property have a reference or pointer (.node) to the
   * data in the lookup map above, to avoid data duplication.
   *
   * @type {Workflow}
   */
  workflow: {
    tree: {},
    lookup: {}
  },
  /**
   * This contains a list of workflows returned from GraphQL and is used by components
   * such as GScan, Dashboard, and WorkflowsTable.
   *
   * @type {Object.<String, WorkflowGraphQLData>}
   */
  workflows: {},
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
}

const getters = {
  currentWorkflow: state => {
    if (state.workflowName === null) {
      return null
    }
    console.log(state.workflowName)
    return getIndex(state, state.workflowName).id
    // return Object.values(state.workflows)
    //   .find(workflow => workflow.name === state.workflowName)
  },
  getTree: state => {
    console.log('getTree')
    const ret = {}
    if (state.cylcTree?.children === undefined) {
      return ret
    }
    const stack = [...state.cylcTree.children]
    let pointer
    let item
    while (stack.length) {
      item = stack.shift()
      pointer = ret

      // eslint-disable-next-line
      for (const [partType, partName] of item.tokens.tree()) {
        if (!pointer[partName]) {
          pointer[partName] = {}
        }
        pointer = pointer[partName]
      }

      for (const child of item.children || []) {
        stack.push(child)
      }
    }
    console.log('/getTree')
    return ret
  }
}

function createTree (state) {
  console.log('@@ Create')
  if (state.cylcTree) {
    return
  }
  const tree = {
    $index: {},
    id: '$root'
  }
  Vue.set(tree, 'children', [])
  state.cylcTree = tree
  console.log('@@')
}

function clearTree (state) {
  console.log('@@ CLEAR')
  for (const child of state.cylcTree.children) {
    remove(state, child.id)
  }
  console.log('@@')
}

// index methods
function addIndex (state, id, treeNode) {
  if (state.cylcTree.$index[id] === undefined) {
    // this is a new node => create it
    console.log(`$i ++ ${id}`)
    Vue.set(state.cylcTree.$index, id, treeNode)
  }
}

function removeIndex (state, id) {
  console.log(`$i -- ${id}`)
  Vue.delete(state.cylcTree.$index, id)
}

function getIndex (state, id) {
  if (id === '$root') {
    // speial ID maps onto the tree root element
    // (note this avoids a circular reference which VueX does not like)
    return state.cylcTree
  }
  return state.cylcTree.$index[id]
}

function hasChild (node, id, attr = 'id', childAttr = 'children') {
  return node[childAttr].filter(
    item => { return item[attr] === id }
  ).length === 1
}

// tree methods
function addChild (parentNode, childNode) {
  console.log(`$t ++ ${childNode.id}`)
  // determine which list to add this node to
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
    Vue.set(childNode, '$edges', [])
    Vue.set(childNode, '$namespaces', [])
  }

  // insert the child preserving sort order
  // if ([].includes(childNode.type)) {}
  const reverse = ['cycle', 'job'].includes(childNode.type)
  const index = sortedIndexBy(
    parentNode[key],
    childNode,
    (n) => n.name, // sort by node name
    { reverse }
  )
  parentNode[key].splice(index, 0, childNode)
}

function removeChild (state, node, parentNode = null) {
  console.log(`$t -- ${node.id}`)
  let key = 'children'
  if (node.type === '$namesapce') {
    key = '$namespaces'
  } else if (node.type === '$edge') {
    key = '$edges'
  }
  if (!parentNode) {
    parentNode = getIndex(state, node.parent)
  }
  if (!parentNode) {
    // parent node no longer in the store
    // (this should not happen)
    return
  }
  parentNode.children.splice(
    parentNode[key].indexOf(node), 1
  )
}

function removeTree (state, node, removeParent = true) {
  let pointer
  const stack = [
    ...node.children || [],
    ...node.familyTree || [],
    ...node.$namespaces || [],
    ...node.$edges || []
  ]
  const remove = []
  while (stack.length) {
    pointer = stack.pop()
    stack.push(...(pointer.children || []))
    stack.push(...(pointer.familyTree || []))
    stack.push(...(pointer.$namespaces || []))
    stack.push(...(pointer.$edges || []))
    remove.push(pointer)
  }
  for (pointer of remove.reverse()) {
    removeIndex(state, pointer.id)
    removeChild(state, pointer)
  }
  if (removeParent) {
    removeIndex(state, node.id)
    removeChild(state, node)
  }
}

function cleanParents (state, node) {
  let pointer = node
  while (pointer.parent) {
    if (pointer.type !== 'workflow') {
      // don't prune workflow nodes
      // (this requires an explicit instruction to do so)
      if (pointer.children.length === 0) {
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

function applyInheritance (state, node) {
  if (node.type === 'family') {
    const childTasks = node.node.childTasks || []

    // add new tasks
    for (const child of childTasks) {
      if (!hasChild(node, child.id)) {
        // child has been added to childTasks
        const childNode = getIndex(state, child.id)
        if (childNode) {
          addChild(node, getIndex(state, child.id))
        }
      }
    }

    // remove old tasks
    for (const child of node.children.filter(child => child.type === 'task')) {
      if (childTasks.filter(x => x.id === child.id).length === 0) {
        removeChild(state, child, node)
      }
    }
  }
}

// data methods
function update (state, updatedData) {
  const tokens = new Tokens(updatedData.id)
  const id = tokens.id
  console.log(`@ += ${id}`)

  let treeItem = getIndex(state, id)
  if (treeItem) {
    // node already exists -> update it
    mergeWith(treeItem.node, updatedData, mergeWithCustomizer)
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

function getFamilyTree (tokens, node) {
  // tree = [type, name, tokens]
  const ret = []

  // extract the tree up intil the cycle point
  let lastTokens
  for (const [type, name, iTokens] of tokens.tree()) {
    ret.push([type, name, iTokens])
    lastTokens = iTokens
    if (type === 'cycle') {
      break
    }
  }

  // add family levels below the cycle point
  const familyPath = []
  for (const ancestor of node.ancestors || []) {
    familyPath.push(ancestor.name)
    ret.push([
      'family',
      ancestor.name,
      lastTokens.clone({ task: ancestor.name })
    ])
  }

  // add the family itself
  familyPath.push(node.name)
  ret.push([
    'family',
    tokens[tokens.lowestToken()],
    tokens
  ])

  return ret
}

function createTreeNode (state, id, tokens, node) {
  let tree = tokens.tree()
  let type = null
  let name = null
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
    const last = tree.pop()
    type = last[0]
    name = last[1]
  }

  let pointer = state.cylcTree
  let intermediateItem = null
  let children = null
  let childAttribute = null
  for (const [partType, partName, partTokens] of tree) {
    if (pointer.type === 'cycle' && type === 'family') {
      childAttribute = 'familyTree'
    } else {
      childAttribute = 'children'
    }
    children = pointer[childAttribute].filter(
      item => { return item.name === partName }
    )
    if (!children.length) {
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
        type: partType
      }
      Vue.set(intermediateItem, 'children', [])
      if (partType === 'cycle') {
        Vue.set(intermediateItem, 'familyTree', [])
      }
      // add child to the tree
      addChild(pointer, intermediateItem)
      // register child in the index
      addIndex(state, partTokens.id, intermediateItem)
      pointer = intermediateItem
    } else {
      pointer = children[0]
    }
  }

  if (pointer.children.filter(child => child.id === id).length) {
    // node already in the tree
    return
  }

  const treeNode = {
    id,
    tokens,
    name,
    type,
    parent: pointer.id,
    node
  }
  Vue.set(treeNode, 'children', [])
  if (type === 'cycle') {
    Vue.set(treeNode, 'familyTree', [])
  }
  return [pointer, treeNode]
}

function remove (state, prunedID) {
  const tokens = new Tokens(prunedID)
  const id = tokens.id
  console.log(`@ -- ${id}`)

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
    // remove ~user[/path/to...]/workflow//cycle/task/job node
    removeTree(state, treeNode)
    cleanParents(state, parentNode)
  }

  // remove the node from the store
  Vue.delete(state.cylcTree.$index, id)
}

const mutations = {
  // the old callback methods
  SET_WORKFLOW_NAME (state, data) {
    state.workflowName = data
  },
  SET_WORKFLOWS (state, data) {
    state.workflows = data
  },
  SET_WORKFLOW (state, data) {
    state.workflow = data
  },
  SET_LOOKUP (state, data) {
    state.lookup = data
  },
  CLEAR_WORKFLOW (state) {
    clear(state.workflow)
    state.workflow = {
      tree: {
        id: '',
        type: 'workflow',
        children: []
      },
      lookup: {}
    }
  },
  // the new cylc tree methods
  CREATE: createTree,
  UPDATE: update,
  UPDATE_DELTAS (state, updated) {
    console.log('@ UPDATE')
    for (const updatedValue of Object.values(pick(updated, KEYS))) {
      const items = isArray(updatedValue) ? updatedValue : [updatedValue]
      for (const updatedData of items) {
        if (updatedData.id) {
          update(state, updatedData)
        }
      }
    }
    console.log('@@')
  },
  // remove an ID
  REMOVE: remove,
  // remove all IDs contained in a delta
  REMOVE_DELTAS (state, pruned) {
    console.log('@ REMOVE')
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
    console.log('@@')
  },
  // remove all children of a node
  REMOVE_CHILDREN (state, id) {
    console.log('@ REMOVE CHILDREN')
    const workflow = getIndex(state, id)
    if (workflow) {
      removeTree(state, workflow, false)
    }
    console.log('@@')
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
