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
  cylcTree: {},
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
    return Object.values(state.workflows)
      .find(workflow => workflow.name === state.workflowName)
  }
}

const mutations = {
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
  CREATE_CYLC_TREE (state, data) {
    const tree = {
      $workflows: {}
    }
    Vue.set(tree, 'children', [])
    // Vue.set(tree, '$workflows', [])
    state.cylcTree = tree
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
  UPDATE (state, updated) {
    for (const updatedValue of Object.values(pick(updated, KEYS))) {
      const items = isArray(updatedValue) ? updatedValue : [updatedValue]
      for (const updatedData of items) {
        if (updatedData.id) {
          const tokens = new Tokens(updatedData.id)
          const id = tokens.id
          console.log(`# ${id}`)
          const tree = tokens.tree()
          let type = null
          let key = null
          const name = tokens[tokens.lowestToken()]
          if (tokens.namespace) {
            type = '$namespace'
            key = '$namespaces'
          } else if (tokens.edge) {
            type = '$edge'
            key = '$edges'
          } else {
            tree.pop()
            type = tokens.lowestToken()
            key = 'children'
          }

          // iterate / construct transient nodes
          let pointer = state.cylcTree
          let children = null
          const partialTokens = new Tokens('~x')
          for (const [partType, partName] of tree) {
            // construct the ID of this level of the tree
            if (['workflow-part', 'workflow'].indexOf(partType) > -1) {
              if (partialTokens.workflow) {
                partialTokens.workflow = `${partialTokens.workflow}/${partName}`
              } else {
                partialTokens.workflow = partName
              }
            } else {
              partialTokens[partType] = partName
            }
            partialTokens.compute()

            // add a children list if not present
            if (pointer.children === undefined) {
              Vue.set(pointer, 'children', [])
            }

            // retrieve this intermediate item if it exists
            children = pointer.children.filter(
              item => { return item.name === partName }
            )

            // create this intermediate item if it does not exist
            if (!children.length) {
              const childTokens = partialTokens.clone()
              children = [{
                id: childTokens.id,
                name: partName,
                type: partType
              }]
              pointer.children.push(children[0])
            }

            // if (
            //   partType === 'workflow' &&
            //   !state.cylcTree.$workflows.includes(partialTokens.workflow)
            // ) {
            //   state.cylcTree.$workflows.push(children[0])
            // }

            if (
              partType === 'workflow' &&
              !state.cylcTree.$workflows[partialTokens.workflow_id]
            ) {
              state.cylcTree.$workflows[partialTokens.workflow_id] = children[0]
              console.log(`@ ${Object.keys(state.cylcTree.$workflows)}`)
            }

            if (children[0] === undefined) {
              debugger
            }
            pointer = children[0]
          }

          // add the list this item is to be inserted into if it doesn't exist
          if (pointer[key] === undefined) {
            Vue.set(pointer, key, [])
          }

          // retrieve this item if it exists
          const treeItems = pointer[key].filter(
            item => { return item.id === id }
          )

          if (treeItems.length) {
            const item = treeItems[0]
            if (item.node === undefined) {
              // there is no node yet => add it
              item.node = updatedData
            } else {
              // there is a node => merge into it
              mergeWith(item.node, updatedData, mergeWithCustomizer)
            }
          } else {
            // there is no tree item => create one
            pointer[key].push({
              id,
              name,
              type,
              node: updatedData
            })
          }
        }
      }
    }
  },
  REMOVE (state, pruned) {
    // TODO!!!
  }
}

// TODO: iterate these in order? or is that even necessary with this implementation?
const KEYS = ['workflow', 'cyclePoints', 'familyProxies', 'taskProxies', 'jobs', 'edges']

const actions = {}

export const workflows = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
