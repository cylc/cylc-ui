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
import * as GScanTree from '@/components/cylc/gscan/index'

/**
 * Deltas added.
 *
 * @param {DeltasAdded} added
 * @param {GScan} gscan
 * @param {*} options
 * @returns {Result}
 */
function applyDeltasAdded (added, gscan, options) {
  const result = {
    errors: []
  }
  if (added.workflow) {
    const workflow = added.workflow
    try {
      GScanTree.addWorkflow(workflow, gscan, options)
    } catch (error) {
      result.errors.push([
        'Error applying GScan added-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
        error,
        added.workflow,
        gscan,
        options
      ])
    }
  }
  return result
}

/**
 * Deltas updated.
 *
 * @param {DeltasUpdated} updated
 * @param {GScan} gscan
 * @param {*} options
 * @returns {Result}
 */
function applyDeltasUpdated (updated, gscan, options) {
  const result = {
    errors: []
  }
  if (updated.workflow) {
    const workflow = updated.workflow
    try {
      GScanTree.updateWorkflow(workflow, gscan, options)
    } catch (error) {
      result.errors.push([
        'Error applying updated-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
        error,
        workflow,
        gscan,
        options
      ])
    }
  }
  return result
}

/**
 * Deltas pruned.
 *
 * @param {DeltasPruned} pruned
 * @param {GScan} gscan
 * @param {*} options
 * @returns {Result}
 */
function applyDeltasPruned (pruned, gscan, options) {
  const result = {
    errors: []
  }
  // TBD: why not workflows? We have that in the jsdoc for DeltasPruned, and I believe
  //      that's how other queries return the data.
  if (pruned.workflow) {
    const workflowId = pruned.workflow
    try {
      GScanTree.removeWorkflow(workflowId, gscan, options)
    } catch (error) {
      result.errors.push([
        'Error applying pruned-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
        error,
        workflowId,
        gscan,
        options
      ])
    }
  }
  return result
}

export {
  applyDeltasAdded,
  applyDeltasUpdated,
  applyDeltasPruned
}
