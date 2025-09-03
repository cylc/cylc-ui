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

import TaskState from '@/model/TaskState.model'
import { TASK_OUTPUT_NAMES } from '@/model/TaskOutput.model'

/**
 * States used when the parent is stopped.
 * @type {TaskState[]}
 */
const isStoppedOrderedStates = [
  TaskState.SUBMIT_FAILED,
  TaskState.FAILED,
  TaskState.RUNNING,
  TaskState.SUBMITTED,
  TaskState.EXPIRED,
  TaskState.PREPARING,
  TaskState.SUCCEEDED,
  TaskState.WAITING
]

/**
 * Gives a single state, based on a list of states of children nodes.
 * @param {TaskState[]} childStates children nodes
 * @param {boolean} isStopped whether the parent node is stopped or not
 * @returns {string} a valid Task State name, or empty string if not found
 * @link @see https://github.com/cylc/cylc-flow/blob/d66ae5c3ce8c749c8178d1cd53cb8c81d1560346/lib/cylc/task_state_prop.py
 */
export function extractGroupState (childStates, isStopped = false) {
  const states = isStopped ? isStoppedOrderedStates : TaskState.enumValues
  for (const state of states) {
    if (childStates.includes(state.name)) {
      return state.name
    }
  }
  return ''
}

export function latestJob (taskProxy) {
  return taskProxy?.children?.[0]?.node
}

/** Returns an array of task messages and custom outputs for a job node.
 *
 * Requires the following fields:
 * job {
 *   messages
 *   TaskProxy {
 *     outputs {
 *       label
 *       message
 *     }
 *   }
 * }
 */
export function jobMessageOutputs (jobNode) {
  const ret = []

  for (const message of jobNode.node.messages || []) {
    if (TASK_OUTPUT_NAMES.includes(message)) {
      continue
    }
    const messageOutput = jobNode.node.taskProxy?.outputs?.find(
      (output) => message === output.message
    )
    ret.push({
      level: undefined, // TODO: https://github.com/cylc/cylc-ui/pull/1436
      label: messageOutput?.label,
      message: messageOutput?.message ?? message,
      isMessage: !messageOutput,
    })
  }
  return ret
}

/**
 * Convert duration to an easily read format
 * Durations of 0 seconds return undefined unless allowZeros is true
 *
 * @param {number=} dur Duration in seconds
 * @param {boolean} [allowZeros=false] Whether durations of 0 are formatted as
 * 00:00:00, rather than undefined
 * @return {string=} Formatted duration
 */
export function formatDuration (dur, allowZeros = false) {
  if (dur || (dur === 0 && allowZeros === true)) {
    const seconds = dur % 60
    const minutes = ((dur - seconds) / 60) % 60
    const hours = ((dur - minutes * 60 - seconds) / 3600) % 24
    const days = (dur - hours * 3600 - minutes * 60 - seconds) / 86400

    let dayss = ''
    if (days > 0) {
      dayss = days.toString() + 'd '
    }

    return dayss +
      hours.toString().padStart(2, '0') +
      ':' + minutes.toString().padStart(2, '0') +
      ':' + Math.round(seconds).toString().padStart(2, '0')
  }
  // the meanElapsedTime can be 0/undefined (i.e. task has not run before)
  // return "undefined" rather than a number for these cases
  return undefined
}

export function dtMean (taskNode) {
  // Convert to an easily read duration format:
  const dur = taskNode.node?.task?.meanElapsedTime
  return formatDuration(dur)
}

/**
 * @param {string} flowNums - Flow numbers in DB format
 * @returns {string} - Flow numbers in pretty format
 */
export function formatFlowNums (flowNums) {
  return JSON.parse(flowNums).join(', ') || 'None'
}

/**
 * Return whether a task is in the None flow.
 *
 * @param {string=} flowNums
 * @returns {boolean}
 */
export function isFlowNone (flowNums) {
  return Boolean(flowNums && !JSON.parse(flowNums).length)
}
