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
import { createWorkflowNode } from '@/components/cylc/gscan/nodes'
import { addWorkflow } from '@/components/cylc/gscan/index'

function applyDeltasAdded (added, gscan, options) {
  const result = {
    errors: []
  }
  if (added.workflow) {
    const hierarchical = options.hierarchical || true
    const workflowNode = createWorkflowNode(added.workflow, hierarchical)
    try {
      addWorkflow(workflowNode, gscan, options)
    } catch (error) {
      result.errors.push([
        'Error applying added-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
        error,
        added.workflow,
        gscan,
        options
      ])
    }
  }
  return result
}

function applyDeltasUpdated () {
  const result = {
    errors: []
  }
  return result
}

function applyDeltasPruned () {
  const result = {
    errors: []
  }
  return result
}

const DELTAS = {
  added: applyDeltasAdded,
  updated: applyDeltasUpdated,
  pruned: applyDeltasPruned
}

/**
 * @param {Deltas} deltas
 * @param {*} gscan
 * @param {*} options
 * @returns {Result}
 */
function handleDeltas (deltas, gscan, options) {
  const errors = []
  Object.keys(DELTAS).forEach(key => {
    if (deltas[key]) {
      const handlingFunction = DELTAS[key]
      const result = handlingFunction(deltas[key], gscan, options)
      errors.push(...result.errors)
    }
  })
  return {
    errors
  }
}

/**
 * @param {GraphQLResponseData} data
 * @param {*} gscan
 * @param {*}options
 * @returns {Result}
 */
export default function (data, gscan, options) {
  const deltas = data.deltas
  try {
    return handleDeltas(deltas, gscan, options)
  } catch (error) {
    return {
      errors: [
        [
          'Unexpected error applying gscan deltas',
          error,
          deltas,
          gscan,
          options
        ]
      ]
    }
  }
}
