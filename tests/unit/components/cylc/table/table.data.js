/**
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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

const wflow = new Tokens('~cylc/workflow')
const cycle1 = wflow.clone({ cycle: '20000101T0000Z' })
const taskA = cycle1.clone({ task: 'taskA' })
const cycle2 = wflow.clone({ cycle: '20000102T0000Z' })
const taskB = cycle2.clone({ task: 'taskB' })
const cycle3 = wflow.clone({ cycle: '20000103T0000Z' })
const taskC = cycle3.clone({ task: 'taskC' })

export const simpleTableWorkflows = [
  {
    id: wflow.id,
    tokens: wflow,
    children: [
      {
        id: cycle1.id,
        tokens: cycle1,
        children: [
          {
            id: taskA.id,
            name: taskA.task,
            tokens: taskA,
            node: {
              id: taskA.id,
              state: TaskState.RUNNING.name,
              task: {
                meanElapsedTime: 2,
              },
            },
            children: [
              {
                id: taskA.clone({ job: '01' }).id,
                name: '01',
                tokens: taskA.clone({ job: '01' }),
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
              {
                id: taskA.clone({ job: '02' }).id,
                name: '02',
                tokens: taskA.clone({ job: '02' }),
                node: {
                  platform: 'localhost',
                  jobRunnerName: 'background',
                  jobId: '2',
                  submittedTime: new Date().toISOString(),
                  startedTime: new Date().toISOString(),
                  finishedTime: new Date().toISOString(),
                  state: JobState.FAILED.name,
                },
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: cycle2.id,
        tokens: cycle2,
        children: [
          {
            id: taskB.id,
            name: taskB.task,
            tokens: taskB,
            node: {
              id: taskB.id,
              state: TaskState.WAITING.name,
            },
            children: [],
          },
        ],
      },
      {
        id: cycle3.id,
        tokens: cycle3,
        children: [
          {
            id: taskC.id,
            name: taskC.task,
            tokens: taskC,
            node: {
              id: taskC.id,
              state: TaskState.SUBMITTED.name,
            },
            children: [],
          },
        ],
      },
    ],
  },
]

export const simpleTableTasks = simpleTableWorkflows.flatMap(
  (workflows) => workflows.children.flatMap(
    (cycles) => cycles.children
  )
)
