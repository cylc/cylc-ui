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
 * Get a state summary for a given workflow. The returned map has a string with the state name as key. These keys
 * are sorted alphabetically. The values are sets, with the task names (<tt>${name}.${cyclepoint}</tt>). These
 * names are also sorted alphabetically.
 * @param {Object} workflow
 * @returns {Map<string, Array>}
 * @see https://github.com/cylc/cylc-flow/blob/de7d938496e82dbdfb165938145670dd8e801efd/lib/cylc/state_summary_mgr.py#L204
 */
function getWorkflowSummary (workflow) {
  const states = new Map()
  // a stopped workflow, may not have any tasks
  if (workflow.taskProxies) {
    for (const taskProxy of workflow.taskProxies) {
      // a task in waiting, may not have any jobs
      if (taskProxy.jobs) {
        for (const job of taskProxy.jobs) {
          // TODO: temporary fix, as the backend is sending ready jobs, but they will change in cylc flow&uiserver in the future
          if (job.state === 'ready') {
            continue
          }
          if (!states.has(job.state)) {
            states.set(job.state, new Set())
          }
          states.get(job.state).add(`${taskProxy.name}.${taskProxy.cyclePoint}`)
        }
      }
    }
    for (const [stateName, tasksSet] of states.entries()) {
      states.set(stateName, [...tasksSet].sort())
    }
  }
  return new Map([...states.entries()].sort())
}

export {
  getWorkflowSummary
}
