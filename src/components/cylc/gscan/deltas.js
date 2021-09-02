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
import { mergeWithCustomizer } from '@/components/cylc/common/merge'

/**
 * @param {DeltasAdded|Object} added
 * @param {Array<WorkflowGraphQLData>} workflows
 * @return {Result}
 */
function applyDeltasAdded (added, workflows) {
  const result = {
    errors: []
  }
  if (added && added.workflow && added.workflow.status) {
    try {
      Vue.set(workflows, added.workflow.id, added.workflow)
    } catch (error) {
      result.errors.push([
        'Error applying GScan added-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
        error,
        added,
        workflows
      ])
    }
  }
  return result
}

/**
 * @param {DeltasUpdated|Object} updated
 * @param {Array<WorkflowGraphQLData>} workflows
 * @return {Result}
 */
function applyDeltasUpdated (updated, workflows) {
  const result = {
    errors: []
  }
  try {
    if (updated && updated.workflow && workflows[updated.workflow.id]) {
      mergeWith(workflows[updated.workflow.id], updated.workflow, mergeWithCustomizer)
    }
  } catch (error) {
    result.errors.push([
      'Error applying GScan updated-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
      error,
      updated,
      workflows
    ])
  }
  return result
}

/**
 * @param {DeltasPruned|Object} pruned
 * @param {Array<WorkflowGraphQLData>} workflows
 * @return {Result}
 */
function applyDeltasPruned (pruned, workflows) {
  const result = {
    errors: []
  }
  try {
    if (pruned && pruned.workflow) {
      Vue.delete(workflows, pruned.workflow)
    }
  } catch (error) {
    result.errors.push([
      'Error applying GScan pruned-delta, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
      error,
      pruned,
      workflows
    ])
  }
  return result
}

export {
  applyDeltasAdded,
  applyDeltasUpdated,
  applyDeltasPruned
}
