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
 *
 * @see https://cylc.github.io/cylc-admin/proposal-state-names.html#taskjob-states
 */
class JobState extends Enumify {
  static SUBMITTED = new JobState('submitted')
  static SUBMIT_FAILED = new JobState('submit-failed')
  static RUNNING = new JobState('running')
  static SUCCEEDED = new JobState('succeeded')
  static FAILED = new JobState('failed')
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

export const JobStateNames = JobState.enumValues.map(({ name }) => name)

/**
 * Get the appropriate log file name for a job based on its state.
 *
 * @param {string=} state
 * @returns {string=} log file name if state is defined & valid, else undefined.
 */
export function getJobLogFileFromState (state) {
  switch (state) {
    case JobState.FAILED.name:
      return 'job.err'
    case JobState.SUBMITTED.name:
    case JobState.SUBMIT_FAILED.name:
      return 'job-activity.log'
    case JobState.RUNNING.name:
    case JobState.SUCCEEDED.name:
      return 'job.out'
  }
}

export default JobState
