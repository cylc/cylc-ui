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
import TaskState from '@/model/TaskState.model'
import JobState from '@/model/JobState.model'
import { Tokens } from '@/utils/uid'

const BASE_TOKENS = new Tokens('~cylc/workflow//1')

const simpleTableTasks = [
  {
    id: BASE_TOKENS.clone({ task: 'taskA' }).id,
    node: {
      id: BASE_TOKENS.clone({ task: 'taskA' }).id,
      state: TaskState.RUNNING.name,
      name: 'taskA',
      meanElapsedTime: 2000,
      cyclePoint: '20000101T0000Z'
    },
    children: [
      {
        id: BASE_TOKENS.clone({ task: 'taskA', job: '01' }).id,
        node: {
          platform: 'localhost',
          jobRunnerName: 'background',
          jobId: '1',
          submittedTime: new Date().toISOString(),
          startedTime: new Date().toISOString(),
          finishedTime: null,
          state: JobState.RUNNING.name
        },
        children: []
      }
    ]
  },
  {
    id: BASE_TOKENS.clone({ task: 'taskB' }).id,
    node: {
      id: BASE_TOKENS.clone({ task: 'taskB' }).id,
      state: TaskState.WAITING.name,
      name: 'taskB',
      cyclePoint: '20000102T0000Z'
    },
    children: []
  },
  {
    id: BASE_TOKENS.clone({ task: 'taskC' }).id,
    node: {
      id: BASE_TOKENS.clone({ task: 'taskC' }).id,
      state: TaskState.SUBMITTED.name,
      name: 'taskC',
      cyclePoint: '20000103T0000Z'
    },
    children: []
  }
]

export {
  simpleTableTasks
}
