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

const { badFile } = require('./logFiles.cjs')

const jobLogLines = [
  'one\n',
  'two\n',
  'three\n',
  'four\n',
  'five\n'
]

const workflowLogLines = [
  '2023-05-25T10:48:01+01:00 INFO - Workflow: one\n',
  '2023-05-25T10:48:01+01:00 INFO - LOADING workflow parameters\n',
  '2023-05-25T10:48:01+01:00 INFO - + cycle point time zone = Z\n',
  '2038-01-19T04:14:07+01:00 CRITICAL - It\'s the Epochalypse!\n',
]

/**
 * Return a mock WS subscription response for UI server cat_log.
 *
 * @param {{
 *   id: string,
 *   file: string,
 * }} variables
 */
const LogData = ({ id, file }) => {
  const isJob = id.includes('//')
  return {
    logs: file === badFile
      ? {
          connected: false,
          error: `file not found: ${file}`,
        }
      : {
          connected: true,
          path: `my-host:/path/to/the/log/file/note/these/paths/get/really/log/${file}`,
          lines: isJob ? jobLogLines : workflowLogLines,
        }
  }
}

module.exports = {
  LogData,
  jobLogLines,
  workflowLogLines,
}
