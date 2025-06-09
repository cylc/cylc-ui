/*
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
const { Workflow } = require('./workflows/index.cjs')

const deletedFile = 'deleted.log'

const jobLogFiles = [
  'job.out',
  'job.err',
  'job',
  'job-activity.log',
]

const workflowLogFiles = [
  'scheduler/01-start-01.log',
  deletedFile,
]

/**
 * Return a mock GQL response for list of log files.
 *
 * @param {{ id: string }} variables
 */
const LogFiles = async ({ id }) => {
  await simulatedDelay(500)
  return {
    data: {
      logFiles: {
        files: id == null
          ? []
          : id.includes('//') ? jobLogFiles : workflowLogFiles
      }
    }
  }
}

/**
 * Return a mock GQL response for job state.
 *
 * @param {{ id: string }} variables
 */
const JobState = async ({ id, workflowId }) => {
  if (!workflowId.startsWith('~')) {
    workflowId = `~user/${workflowId}`
  }
  const { deltas } = Workflow({ workflowId })
  const searchID = id.replace(
    /\/NN$/, ''
  ).replace(
    /\/(\d+)$/, (match, p1) => `/${parseInt(p1)}` // strips leading zeroes
  )
  const { state } = deltas?.added?.jobs?.find((job) => job.id.includes(searchID)) ?? {}
  await simulatedDelay(500)
  return {
    data: {
      jobs: state ? [{ id, state }] : []
    }
  }
}

module.exports = {
  JobState,
  LogFiles,
  deletedFile,
  jobLogFiles,
  workflowLogFiles,
}
