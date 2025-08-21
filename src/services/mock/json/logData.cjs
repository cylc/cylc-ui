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

const { simulatedDelay } = require('./util.cjs')
const { deletedFile } = require('./logFiles.cjs')

const logDirPath = '/path/to/the/log/file/note/these/paths/get/really/log'

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
  '2023-08-17T14:10:51+01:00 INFO - The quick brown 🦊 jumps over the lazy 🐶\n',
  '2024-02-07T13:38:25+01:00 INFO - Ce programme est distribué dans l\'espoir qu\'il sera utile, mais SANS TOUTE GARANTIE ; sans même la garantie implicite de QUALITÉ MARCHANDE ou d\'ADAPTATION À UN USAGE PARTICULIER. Consultez la GNU General Public License pour plus de détails.\n',
  '2025-08-21T02:53:22+01:00 ERROR - cycl not found in /home/users/sheev.palpatine/.local/bin:/home/users/sheev.palpatine/bin:/opt/caribou-client-wrapper/bin:/opt/conda/condabin:/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/opt/bish/bash/bosh/bin:/data/apps/apes/2025/bin\n',
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
const LogData = async ({ id, file }) => {
  const isJob = id.includes('//')
  const path = `${logDirPath}/${file}`
  await simulatedDelay(1e3)
  return {
    logs: {
      connected: file !== deletedFile,
      error: file === deletedFile
        ? 'No such file or directory'
        : undefined,
      path: `my-host:${path}`,
      lines: isJob ? jobLogLines : workflowLogLines,
    }
  }
}

module.exports = {
  LogData,
  logDirPath,
  jobLogLines,
  workflowLogLines,
}
