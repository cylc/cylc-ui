/*
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

// Dynamic mock data for simple workflow: foo[-P1] => foo

const { simulatedDelay } = require('../util.cjs')

function timestamp (date = new Date()) {
  return `${date.toISOString().slice(0, -5)}Z`
}

const outputs = {
  submitted: { label: 'submitted', message: 'submitted', __typename: 'Output' },
  started: { label: 'started', message: 'started', __typename: 'Output' },
  succeeded: { label: 'succeeded', message: 'succeeded', __typename: 'Output' },
}

const modifiers = {
  isHeld: false,
  isQueued: false,
  isRunahead: false,
  isRetry: false,
  isWallclock: false,
  isXtriggered: false,
}

const runtime = {
  runMode: 'Simulation',
  __typename: 'Runtime',
}

const task = {
  meanElapsedTime: 10,
  __typename: 'Task',
}

const initial = {
  deltas: {
    id: '~user/linear',
    added: {
      workflow: {
        id: '~user/linear',
        host: 'localhost',
        owner: 'user',
        status: 'running',
        statusMsg: 'running',
        nEdgeDistance: 1,
        cylcVersion: '8.7.0',
        runMode: 'simulation',
        reloaded: true,
        port: 43080,
        stateTotals: {
          waiting: 0,
          expired: 0,
          preparing: 0,
          'submit-failed': 0,
          submitted: 0,
          running: 1,
          failed: 0,
          succeeded: 0,
        },
        containsHeld: false,
        containsRetry: false,
        logRecords: [],
        latestStateTasks: {
          failed: [],
          preparing: [],
          'submit-failed': [],
          submitted: [],
          running: ['1/foo'],
        },
        __typename: 'Workflow',
      },
      familyProxies: [
        {
          __typename: 'FamilyProxy',
          id: '~user/linear//1/root',
          state: 'running',
          ancestors: [],
          childTasks: [
            {
              id: '~user/linear//1/foo',
              __typename: 'TaskProxy',
            },
          ],
          ...modifiers,
        },
        {
          __typename: 'FamilyProxy',
          id: '~user/linear//2/root',
          state: 'waiting',
          ancestors: [],
          childTasks: [
            {
              id: '~user/linear//2/foo',
              __typename: 'TaskProxy',
            },
          ],
          ...modifiers,
        },
      ],
      taskProxies: [
        {
          id: '~user/linear//1/foo',
          state: 'running',
          ...modifiers,
          task,
          firstParent: {
            id: '~user/linear//1/root',
            __typename: 'FamilyProxy',
          },
          runtime,
          flowNums: '[1]',
          name: 'foo',
          __typename: 'TaskProxy',
        },
        {
          id: '~user/linear//2/foo',
          state: 'waiting',
          ...modifiers,
          task,
          firstParent: {
            id: '~user/linear//2/root',
            __typename: 'FamilyProxy',
          },
          runtime,
          flowNums: '[]',
          name: 'foo',
          __typename: 'TaskProxy',
        },
      ],
      jobs: [
        {
          id: '~user/linear//1/foo/01',
          jobRunnerName: '',
          jobId: '',
          platform: 'simulation',
          startedTime: timestamp(),
          submittedTime: timestamp(new Date(Date.now() + 2e3)),
          finishedTime: '',
          estimatedFinishTime: timestamp(new Date(Date.now() + 10e3)),
          state: 'running',
          submitNum: 1,
          messages: [
            'started',
          ],
          taskProxy: {
            outputs: [outputs.submitted, outputs.started],
            __typename: 'TaskProxy',
          },
          name: 'foo',
          __typename: 'Job',
        },
      ],
      edges: [
        {
          id: '~user/linear//$edge|1/foo|2/foo',
          source: '~user/linear//1/foo',
          target: '~user/linear//2/foo',
          __typename: 'Edge',
        },
      ],
      __typename: 'Added',
    },
    updated: { __typename: 'Updated' },
    pruned: { __typename: 'Pruned' },
    __typename: 'Deltas',
  },
}

const finishCycle = (cycle) => ({
  deltas: {
    id: '~user/linear',
    added: {
      familyProxies: [
        {
          __typename: 'FamilyProxy',
          id: `~user/linear//${cycle + 2}/root`,
          state: 'waiting',
          ancestors: [],
          childTasks: [
            {
              id: `~user/linear//${cycle + 2}/foo`,
              __typename: 'TaskProxy',
            },
          ],
          ...modifiers,
        },
      ],
      taskProxies: [
        {
          id: `~user/linear//${cycle + 2}/foo`,
          state: 'waiting',
          ...modifiers,
          task,
          firstParent: {
            id: `~user/linear//${cycle + 2}/root`,
            __typename: 'FamilyProxy',
          },
          runtime,
          flowNums: '[]',
          name: 'foo',
          __typename: 'TaskProxy',
        },
      ],
      jobs: [],
      edges: [
        {
          id: `~user/linear//$edge|${cycle + 1}/foo|${cycle + 2}/foo`,
          source: `~user/linear//${cycle + 1}/foo`,
          target: `~user/linear//${cycle + 2}/foo`,
          __typename: 'Edge',
        },
      ],
      __typename: 'Added',
    },
    updated: {
      workflow: {
        id: '~user/linear',
        __typename: 'Workflow',
      },
      familyProxies: [
        {
          __typename: 'FamilyProxy',
          id: `~user/linear//${cycle + 2}/root`,
          state: 'waiting',
          childTasks: [
            {
              id: `~user/linear//${cycle + 2}/foo`,
              __typename: 'TaskProxy',
            },
          ],
          ...modifiers,
        },
        {
          __typename: 'FamilyProxy',
          id: `~user/linear//${cycle}/root`,
          state: 'succeeded',
          childTasks: [
            {
              id: `~user/linear//${cycle}/foo`,
              __typename: 'TaskProxy',
            },
          ],
          ...modifiers,
        },
        {
          __typename: 'FamilyProxy',
          id: `~user/linear//${cycle + 1}/root`,
          state: 'preparing',
          childTasks: [
            {
              id: `~user/linear//${cycle + 1}/foo`,
              __typename: 'TaskProxy',
            },
          ],
          ...modifiers,
        },
      ],
      taskProxies: [
        {
          id: `~user/linear//${cycle}/foo`,
          state: 'succeeded',
          task,
          firstParent: {
            id: `~user/linear//${cycle}/root`,
            __typename: 'FamilyProxy',
          },
          __typename: 'TaskProxy',
        },
        {
          id: `~user/linear//${cycle + 1}/foo`,
          state: 'preparing',
          ...modifiers,
          task,
          firstParent: {
            id: `~user/linear//${cycle + 1}/root`,
            __typename: 'FamilyProxy',
          },
          runtime,
          flowNums: '[1]',
          __typename: 'TaskProxy',
        },
        {
          id: `~user/linear//${cycle + 2}/foo`,
          task,
          firstParent: {
            id: `~user/linear//${cycle + 2}/root`,
            __typename: 'FamilyProxy',
          },
          __typename: 'TaskProxy',
        },
      ],
      jobs: [
        {
          id: `~user/linear//${cycle}/foo/01`,
          finishedTime: timestamp(),
          state: 'succeeded',
          messages: ['started', 'succeeded'],
          taskProxy: {
            outputs,
            __typename: 'TaskProxy',
          },
          __typename: 'Job',
        },
      ],
      __typename: 'Updated',
    },
    pruned: cycle > 1
      ? {
          familyProxies: [`~user/linear//${cycle - 1}/root`],
          taskProxies: [`~user/linear//${cycle - 1}/foo`],
          jobs: [`~user/linear//${cycle - 1}/foo/01`],
          edges: [`~user/linear//$edge|${cycle - 1}/foo|${cycle}/foo`],
          __typename: 'Pruned',
        }
      : {},
    __typename: 'Deltas',
  },
})

const startCycle = (cycle) => {
  const now = Date.now()
  return {
    deltas: {
      id: '~user/linear',
      added: {
        familyProxies: [],
        taskProxies: [],
        jobs: [
          {
            id: `~user/linear//${cycle}/foo/01`,
            jobRunnerName: '',
            jobId: '',
            platform: 'simulation',
            startedTime: timestamp(),
            submittedTime: timestamp(new Date(now + 2e3)),
            finishedTime: '',
            estimatedFinishTime: timestamp(new Date(now + 10e3)),
            state: 'running',
            submitNum: 1,
            messages: ['started'],
            taskProxy: {
              outputs: [outputs.submitted, outputs.started],
              __typename: 'TaskProxy',
            },
            name: 'foo',
            __typename: 'Job',
          },
        ],
        edges: [],
        __typename: 'Added',
      },
      updated: {
        workflow: {
          id: '~user/linear',
          __typename: 'Workflow',
        },
        familyProxies: [
          {
            __typename: 'FamilyProxy',
            id: `~user/linear//${cycle}/root`,
            state: 'running',
            childTasks: [
              {
                id: `~user/linear//${cycle}/foo`,
                __typename: 'TaskProxy',
              },
            ],
            ...modifiers,
          },
        ],
        taskProxies: [
          {
            id: `~user/linear//${cycle}/foo`,
            state: 'running',
            isQueued: false,
            task,
            firstParent: {
              id: `~user/linear//${cycle}/root`,
              __typename: 'FamilyProxy',
            },
            __typename: 'TaskProxy',
          },
        ],
        jobs: [],
        __typename: 'Updated',
      },
      pruned: { __typename: 'Pruned' },
      __typename: 'Deltas',
    },
  }
}

/**
 * Generate successive workflow deltas for the linear mock workflow.
 * Yields the initial delta, then procedurally yields subsequent deltas as the mock workflow advances.
 */
async function* next () {
  yield initial
  for (let cycle = 1; cycle < 100; cycle++) {
    await simulatedDelay(10e3, { CI: 1e3 })
    yield finishCycle(cycle)
    await simulatedDelay(2e3, { CI: 500 })
    yield startCycle(cycle + 1)
  }
}

module.exports = {
  initial,
  next,
}
