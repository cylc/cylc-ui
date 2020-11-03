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
 * Cylc valid task states.
 */
class TaskState extends Enumify {
  // NOTE: the order of the enum values is important to calculate the group states in the UI. Items at
  // the top of the list have preference over the items below in the algorithm.
  static SUBMIT_FAILED = new TaskState('submit_failed')
  static FAILED = new TaskState('failed')
  static EXPIRED = new TaskState('expired')
  static SUBMIT_RETRYING = new TaskState('submit_retrying')
  static RETRYING = new TaskState('retrying')
  static RUNNING = new TaskState('running')
  static SUBMITTED = new TaskState('submitted')
  static READY = new TaskState('ready')
  static QUEUED = new TaskState('queued')
  static WAITING = new TaskState('waiting')
  static HELD = new TaskState('held')
  static SUCCEEDED = new TaskState('succeeded')
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

export default TaskState
