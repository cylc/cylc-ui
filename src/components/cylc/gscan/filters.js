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

/**
 * @param {WorkflowGScanNode|WorkflowNamePartGScanNode} workflow
 * @param {?string} name - name filter
 * @returns {boolean}
 */
export function filterByName (workflow, name) {
  return !name || workflow.tokens.workflow.toLowerCase().includes(name.toLowerCase())
}

/**
 * @private
 * @param {Object=} stateTotals - object with the keys being states, and values the count
 * @return {string[]}
 */
function getWorkflowStates (stateTotals) {
  return !stateTotals
    ? []
    : Object.keys(stateTotals).filter((state) => stateTotals[state] > 0)
}

/**
 * @param {WorkflowGScanNode|WorkflowNamePartGScanNode} workflow
 * @param {string[]} workflowStates
 * @param {string[]} taskStates
 * @returns {boolean}
 */
export function filterByState (workflow, workflowStates, taskStates) {
  // workflow states
  if (
    workflowStates.length && !workflowStates.includes(workflow.node.status)
  ) {
    return false
  }
  // task states
  if (taskStates.length) {
    return getWorkflowStates(workflow.node.stateTotals).some(
      (item) => taskStates.includes(item)
    )
  }
  return true
}
