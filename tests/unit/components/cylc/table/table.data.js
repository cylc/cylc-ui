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

const tk = {
  taskA: new Tokens('~cylc/workflow//20000101T0000Z/taskA'),
  taskB: new Tokens('~cylc/workflow//20000102T0000Z/taskB'),
  taskC: new Tokens('~cylc/workflow//20000103T0000Z/taskC'),
}

export const simpleTableTasks = [
  {
    task: {
      id: tk.taskA.id,
      name: 'taskA',
      tokens: tk.taskA,
      node: {
        id: tk.taskA.id,
        state: TaskState.RUNNING.name,
        task: {
          meanElapsedTime: 2,
        },
      },
      children: [
        {
          id: tk.taskA.clone({ job: '01' }).id,
          name: '01',
          tokens: tk.taskA.clone({ job: '01' }),
          node: {
            platform: 'localhost',
            jobRunnerName: 'background',
            jobId: '1',
            submittedTime: new Date().toISOString(),
            startedTime: new Date().toISOString(),
            finishedTime: null,
            state: JobState.RUNNING.name,
          },
          children: [],
        },
      ],
    },
    latestJob: {
      id: tk.taskA.clone({ job: '01' }).id,
      name: '01',
      tokens: tk.taskA.clone({ job: '01' }),
      node: {
        platform: 'localhost',
        jobRunnerName: 'background',
        jobId: '1',
        submittedTime: new Date().toISOString(),
        startedTime: new Date().toISOString(),
        finishedTime: null,
        state: JobState.RUNNING.name,
      },
      children: [],
    },
    previousJob: null,
  },
  {
    task: {
      id: tk.taskB.id,
      name: 'taskB',
      tokens: tk.taskB,
      node: {
        id: tk.taskB.id,
        state: TaskState.WAITING.name,
        name: 'taskB',
      },
      children: [],
    },
    latestJob: null,
    previousJob: null,
  },
  {
    task: {
      id: tk.taskC.id,
      name: 'taskC',
      tokens: tk.taskC,
      node: {
        id: tk.taskC.id,
        state: TaskState.SUBMITTED.name,
        name: 'taskC',
      },
      children: [],
    },
    latestJob: null,
    previousJob: null,
  },
]
