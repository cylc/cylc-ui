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
export class TaskState extends Enumify {
  static SUBMIT_FAILED = new TaskState('submit-failed')
  static FAILED = new TaskState('failed')
  static EXPIRED = new TaskState('expired')
  static RUNNING = new TaskState('running')
  static SUBMITTED = new TaskState('submitted')
  static PREPARING = new TaskState('preparing')
  static WAITING = new TaskState('waiting')
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

/**
 * Task states ordered for display purposes.
 * TODO: replace this by iterating TaskState.enumKeys?
 */
export const TaskStateUserOrder = [
  TaskState.WAITING,
  TaskState.PREPARING,
  TaskState.SUBMITTED,
  TaskState.RUNNING,
  TaskState.SUCCEEDED,
  TaskState.SUBMIT_FAILED,
  TaskState.FAILED,
  TaskState.EXPIRED
]

export const TaskStateNames = TaskStateUserOrder.map(({ name }) => name)

export class TaskModifier extends Enumify {
  static isRetry = new TaskModifier('isRetry', 'Retry')
  static isRunahead = new TaskModifier('isRunahead', 'Runahead')
  static isQueued = new TaskModifier('isQueued', 'Queued')
  static isWallclock = new TaskModifier('isWallclock', 'Wallclock')
  static isXtrigger = new TaskModifier('isXtriggered', 'Xtrigger')
  static isHeld = new TaskModifier('isHeld', 'Held')
  static isSkip = new TaskModifier('isSkip', 'Skip')
  static _ = this.closeEnum()

  constructor (field, title) {
    super()
    this.field = field
    this.title = title
  }
}

export const WaitingStateModifiers = [
  TaskModifier.isRetry,
  TaskModifier.isRunahead,
  TaskModifier.isQueued,
  TaskModifier.isWallclock,
  TaskModifier.isXtrigger,
]

export const WaitingStateModifierNames = WaitingStateModifiers.map(({ field }) => field)

export const GenericModifiers = [
  TaskModifier.isSkip,
  TaskModifier.isHeld,
]

export const GenericModifierNames = GenericModifiers.map(({ field }) => field)

export default TaskState
