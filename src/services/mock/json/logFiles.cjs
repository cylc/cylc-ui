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

const badFile = 'deleted.log'

const jobLogFiles = [
  'job.out',
  'job.err',
  'job',
]

const workflowLogFiles = [
  'scheduler/01-start-01.log',
  badFile,
]

/**
 * Return a mock GQL response for list of log files.
 *
 * @param {{ id: string }} variables
 */
const LogFiles = ({ id }) => ({
  data: {
    logFiles: {
      files: id == null
        ? []
        : id.includes('//') ? jobLogFiles : workflowLogFiles
    }
  }
})

module.exports = {
  LogFiles,
  badFile,
  jobLogFiles,
  workflowLogFiles,
}
