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
 * Cylc valid job states.
 */
class JobState extends Enumify {
  static SUBMIT_FAILED = new JobState('submit_failed')
  static FAILED = new JobState('failed')
  static RUNNING = new JobState('running')
  static SUBMITTED = new JobState('submitted')
  static READY = new JobState('ready')
  static QUEUED = new JobState('queued')
  static HELD = new JobState('held')
  static SUCCEEDED = new JobState('succeeded')
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

export default JobState
