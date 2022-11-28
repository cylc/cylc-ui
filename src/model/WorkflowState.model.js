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

import {
  mdiHelpCircle,
  mdiPauseCircle,
  mdiPlayCircle,
  mdiSkipNextCircle,
  mdiStopCircle
} from '@mdi/js'

/**
 * Cylc valid workflow states.
 */
export class WorkflowState extends Enumify {
  static RUNNING = new WorkflowState('running', mdiPlayCircle)
  static PAUSED = new WorkflowState('paused', mdiPauseCircle)
  static STOPPING = new WorkflowState('stopping', mdiSkipNextCircle)
  static STOPPED = new WorkflowState('stopped', mdiStopCircle)
  static ERROR = new WorkflowState('error', mdiHelpCircle)
  static _ = this.closeEnum()

  /**
   * Constructor.
   * @param {String} name
   * @param {String} icon
   */
  constructor (name, icon) {
    super()
    this.name = name
    this.icon = icon
  }
}

/**
 * Workflow states ordered for display purposes.
 * @type {Map} - Using a map to prevent more unexpected sorting issues
 * @see https://stackoverflow.com/questions/5525795/does-javascript-guarantee-object-property-order/38218582#38218582
 */
export const WorkflowStateOrder = new Map([
  [WorkflowState.RUNNING.name, 1],
  [WorkflowState.PAUSED.name, 1],
  [WorkflowState.STOPPING.name, 1],
  [WorkflowState.STOPPED.name, 2],
  [undefined, 9]
])

export default WorkflowState
