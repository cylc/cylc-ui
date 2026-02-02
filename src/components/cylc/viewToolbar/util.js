/*
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
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

import { upperFirst } from 'lodash-es'
import {
  GenericModifiers,
  TaskModifier,
  TaskState,
  TaskStateNames,
  WaitingStateModifiers,
} from '@/model/TaskState.model'

function getProps (modifier) {
  const ret = {}
  if (modifier === TaskModifier.isSkip) {
    ret.runtime = { runMode: 'Skip' }
  } else {
    ret[modifier.field] = true
  }
  return ret
}

export const taskStateItems = [
  {
    title: upperFirst(TaskState.WAITING.name),
    value: TaskState.WAITING.name,
    taskProps: { state: TaskState.WAITING.name },
    children: WaitingStateModifiers
      .map((modifier) => {
        return {
          title: upperFirst(modifier.title),
          value: modifier.field,
          taskProps: getProps(modifier)
        }
      })
  },
  ...TaskStateNames
    .filter((name) => name !== TaskState.WAITING.name)
    .map((name) => {
      return {
        title: upperFirst(name),
        value: name,
        taskProps: { state: name }
      }
    }),
  { type: 'divider' },
  ...GenericModifiers
    .map((modifier) => {
      return {
        title: upperFirst(modifier.title),
        value: modifier.field,
        taskProps: getProps(modifier)
      }
    }),
]
