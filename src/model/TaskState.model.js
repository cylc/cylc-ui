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
  static SUBMIT_FAILED = new TaskState('SUBMIT_FAILED')
  static FAILED = new TaskState('FAILED')
  static EXPIRED = new TaskState('EXPIRED')
  static SUBMIT_RETRYING = new TaskState('SUBMIT_RETRYING')
  static RETRYING = new TaskState('RETRYING')
  static RUNNING = new TaskState('RUNNING')
  static SUBMITTED = new TaskState('SUBMITTED')
  static READY = new TaskState('READY')
  static QUEUED = new TaskState('QUEUED')
  static WAITING = new TaskState('WAITING')
  static HELD = new TaskState('HELD')
  static SUCCEEDED = new TaskState('SUCCEEDED')
  static RUNAHEAD = new TaskState('RUNAHEAD')
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
