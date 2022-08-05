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
import Vue from 'vue'
import mergeWith from 'lodash/mergeWith'
import { mergeWithCustomizer } from '@/components/cylc/common/merge'

/**
 * @typedef {Object} GraphQLResponseData
 * @property {Deltas} deltas
 */

/**
 * @typedef {Object} Deltas
 * @property {string} id
 * @property {?DeltasAdded} added
 * @property {?DeltasUpdated} updated
 * @property {?DeltasPruned} pruned
 */

/**
 * A GraphQLData object represents an object from a GraphQL response as-is.
 * It is wrapped within a Tree node, for instance, (i.e. a tree-node has a node), for
 * when components need the raw object data from fetched with a query
 * (e.g. the state of a task).
 *
 * The properties of this object vary depending on the query parameters,
 * and the GraphQL schema. Use GraphiQL to confirm the data if necessary.
 *
 * @typedef {Object} GraphQLData
 * @property {string} id - node ID
 */

/**
 * @typedef {GraphQLData} WorkflowGraphQLData
 * @property {string} name
 * @property {string} status
 * @property {string} owner
 * @property {string} host
 * @property {string} port
 * @property {Object} stateTotals
 * @property {Array<string>} latestStateTasks
 * @property {?Array<GraphQLData>} cyclePoints
 * @property {?Array<GraphQLData>} familyProxies
 * @property {?Array<GraphQLData>} taskProxies
 */

/**
 * @typedef {Object} DeltasAdded
 * @property {WorkflowGraphQLData} workflow
 * @property {Array<Object>} cyclePoints
 * @property {Array<Object>} familyProxies
 * @property {Array<Object>} taskProxies
 * @property {Array<Object>} jobs
 */

/**
 * @typedef {Object} DeltasUpdated
 * @property {Object} workflow
 * @property {Array<Object>} familyProxies
 * @property {Array<Object>} taskProxies
 * @property {Array<Object>} jobs
 */

/**
 * @typedef {Object} DeltasPruned
 * @property {Array<string>} workflows
 * @property {Array<string>} taskProxies - IDs of task proxies removed
 * @property {Array<string>} familyProxies - IDs of family proxies removed
 * @property {Array<string>} jobs - IDs of jobs removed
 */

/**
 * @typedef {Object} Result
 * @property {Array<Object>} errors
 */

const KEYS = ['workflow', 'cyclePoints', 'familyProxies', 'taskProxies', 'jobs', 'edges']

/**
 * @param {DeltasAdded|Object} added
 * @param {Object.<String, Object>} lookup
 * @return {Result}
 */
function applyDeltasAdded (added, lookup) {
  const result = {
    errors: []
  }
  for (const addedValue of Object.values(pick(added, KEYS))) {
    const items = isArray(addedValue) ? addedValue : [addedValue]
    for (const addedData of items) {
      // An example for a data without .id, is the empty delta with __typename: "Added". It does occur, and can cause runtime errors.
      if (addedData.id) {
        try {
          Vue.set(lookup, addedData.id, addedData)
        } catch (error) {
          result.errors.push([
            'Error applying Lookup added-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
            error,
            addedData,
            lookup
          ])
        }
      }
    }
  }
  return result
}

/**
 * Deltas updated.
 *
 * @param updated {DeltasUpdated|Object} updated
 * @param {Object.<String, Object>} lookup
 * @return {Result}
 */
function applyDeltasUpdated (updated, lookup) {
  const result = {
    errors: []
  }
  for (const updatedValue of Object.values(pick(updated, KEYS))) {
    const items = isArray(updatedValue) ? updatedValue : [updatedValue]
    for (const updatedData of items) {
      // An example for a data without .id, is the empty delta with __typename: "Updated". It does occur, and can cause runtime errors.
      if (updatedData.id) {
        try {
          const existingNode = lookup[updatedData.id]
          if (existingNode) {
            mergeWith(existingNode, updatedData, mergeWithCustomizer)
          } else {
            // TODO: we are adding in the updated. Is that OK? Should we revisit it later perhaps?
            Vue.set(lookup, updatedData.id, updatedData)
          }
        } catch (error) {
          result.errors.push([
            'Error applying Lookup updated-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
            error,
            updatedData,
            lookup
          ])
        }
      }
    }
  }
  return result
}

/**
 * Deltas pruned.
 *
 * @param {DeltasPruned|Object} pruned - deltas pruned
 * @param {Object.<String, Object>} lookup
 * @return {Result}
 */
function applyDeltasPruned (pruned, lookup) {
  for (const prunedData of Object.values(pick(pruned, KEYS))) {
    const items = isArray(prunedData) ? prunedData : [prunedData]
    for (const id of items) {
      if (lookup[id]) {
        delete lookup[id]
      }
    }
  }
  return {
    errors: []
  }
}

export {
  applyDeltasAdded,
  applyDeltasUpdated,
  applyDeltasPruned
}
