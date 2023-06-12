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

import { Enumify } from 'enumify'

/**
 * @typedef {Object} TaskOutput
 * @property {string} name - enum name
 */
class TaskOutput extends Enumify {
  // @see: https://cylc.github.io/cylc-admin/proposal-state-names.html#outputs
  // @see: https://github.com/cylc/cylc-flow/blob/bb79a6e03437927ecf97deb6a34fa8f1e7ab0835/cylc/flow/task_outputs.py
  static EXPIRED = new TaskOutput('expired')
  static SUBMITTED = new TaskOutput('submitted')
  static SUBMIT_FAILED = new TaskOutput('submit-failed')
  static STARTED = new TaskOutput('started')
  static SUCCEEDED = new TaskOutput('succeeded')
  static FAILED = new TaskOutput('failed')
  static _ = this.closeEnum()

  /**
   * Constructor.
   * @param {String} name
   */
  constructor (name) {
    super()
    this.name = name
  }
}

export const TASK_OUTPUT_NAMES = [
  TaskOutput.SUBMITTED.name,
  TaskOutput.STARTED.name,
  TaskOutput.SUCCEEDED.name,
  TaskOutput.SUBMIT_FAILED.name,
  TaskOutput.FAILED.name,
  TaskOutput.EXPIRED.name
]

export default TaskOutput
