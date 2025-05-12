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

import { Tokens } from '@/utils/uid'

/*
 * Test data for Tree component tests.
 */

export const stateTotalsTestWorkflowNodes = {
  id: '~cylc/double',
  name: 'double',
  node: {
    id: '~cylc/double'
  },
  parent: '~cylc',
  tokens: {
    user: 'cylc',
    workflow: 'double',
    id: '~cylc/double',
    workflowID: '~cylc/double',
    relativeID: ''
  },
  type: 'workflow-part',
  children: [
    {
      id: '~cylc/double/mid',
      name: 'mid',
      node: {
        id: '~cylc/double/mid'
      },
      parent: '~cylc/double',
      tokens: {
        user: 'cylc',
        workflow: 'double/mid',
        id: '~cylc/double/mid',
        workflowID: '~cylc/double/mid',
        relativeID: ''
      },
      type: 'workflow-part',
      children: [
        {
          id: '~cylc/double/mid/first',
          name: 'first',
          node: {
            id: '~cylc/double/mid/first'
          },
          parent: '~cylc/double/mid',
          tokens: {
            user: 'cylc',
            workflow: 'double/mid/first',
            id: '~cylc/double/mid/first',
            workflowID: '~cylc/double/mid/first',
            relativeID: ''
          },
          type: 'workflow-part',
          children: [
            {
              id: '~cylc/double/mid/first/run1',
              tokens: {
                user: 'cylc',
                workflow: 'double/mid/first/run1',
                id: '~cylc/double/mid/first/run1',
                workflowID: '~cylc/double/mid/first/run1',
                relativeID: ''
              },
              name: 'run1',
              type: 'workflow',
              parent: '~cylc/double/mid/first',
              node: {
                id: '~cylc/double/mid/first/run1',
                status: 'running',
                statusMsg: 'running',
                owner: 'cylc',
                host: 'localhost',
                port: 43055,
                stateTotals: {
                  waiting: 7,
                  expired: 0,
                  preparing: 0,
                  'submit-failed': 0,
                  submitted: 3,
                  running: 6,
                  failed: 0,
                  succeeded: 0
                },
                latestStateTasks: {
                  failed: [],
                  preparing: [
                    '2022-03-19/get-data',
                    '2022-03-15/prep',
                    '2022-03-15/get-data',
                    '2022-03-16/get-data',
                    '2022-03-17/get-data'
                  ],
                  'submit-failed': [],
                  submitted: [
                    '2022-03-19/get-data',
                    '2022-03-18/get-data',
                    '2022-03-17/get-data',
                    '2022-03-16/get-data',
                    '2022-03-15/prep'
                  ],
                  running: [
                    '2022-03-17/get-data',
                    '2022-03-19/get-data',
                    '2022-03-18/get-data',
                    '2022-03-16/get-data',
                    '2022-03-15/get-data'
                  ]
                },
                __typename: 'Workflow'
              },
              children: [],
              $edges: [],
              $namespaces: []
            }
          ]
        },
        {
          id: '~cylc/double/mid/second',
          name: 'second',
          node: {
            id: '~cylc/double/mid/second'
          },
          parent: '~cylc/double/mid',
          tokens: {
            user: 'cylc',
            workflow: 'double/mid/second',
            id: '~cylc/double/mid/second',
            workflowID: '~cylc/double/mid/second',
            relativeID: ''
          },
          type: 'workflow-part',
          children: [
            {
              id: '~cylc/double/mid/second/run1',
              tokens: {
                user: 'cylc',
                workflow: 'double/mid/second/run1',
                id: '~cylc/double/mid/second/run1',
                workflowID: '~cylc/double/mid/second/run1',
                relativeID: ''
              },
              name: 'run1',
              type: 'workflow',
              parent: '~cylc/double/mid/second',
              node: {
                id: '~cylc/double/mid/second/run1',
                status: 'running',
                statusMsg: 'running',
                owner: 'cylc',
                host: 'localhost',
                port: 43038,
                stateTotals: {
                  waiting: 7,
                  expired: 0,
                  preparing: 0,
                  'submit-failed': 0,
                  submitted: 2,
                  running: 6,
                  failed: 0,
                  succeeded: 0
                },
                latestStateTasks: {
                  failed: [],
                  preparing: [
                    '2022-01-19/get-data',
                    '2022-01-15/prep',
                    '2022-01-15/get-data',
                    '2022-01-16/get-data',
                    '2022-01-17/get-data'
                  ],
                  'submit-failed': [],
                  submitted: [
                    '2022-01-19/get-data',
                    '2022-01-18/get-data',
                    '2022-01-17/get-data',
                    '2022-01-16/get-data',
                    '2022-01-15/prep'
                  ],
                  running: [
                    '2022-01-19/get-data',
                    '2022-01-18/get-data',
                    '2022-01-17/get-data',
                    '2022-01-15/prep',
                    '2022-01-16/get-data'
                  ]
                },
                __typename: 'Workflow'
              },
              children: [],
              $edges: [],
              $namespaces: []
            }
          ]
        }
      ]
    }
  ]
}

export const simpleWorkflowTree4Nodes = [
  {
    id: '~user/workflow1',
    name: 'workflow1',
    tokens: new Tokens('~user/workflow1'),
    type: 'workflow',
    node: {
      __typename: 'Workflow',
      state: 'running',
      node: {
        status: 'running'
      }
    },
    children: [
      {
        id: '~user/workflow1//20100101T0000Z',
        name: '20100101T0000Z',
        tokens: new Tokens('~user/workflow1//20100101T0000Z'),
        type: 'cycle',
        node: {
          __typename: 'CyclePoint',
          state: 'failed'
        },
        children: ['stub'],
        familyTree: [
          {
            id: '~user/workflow1//20100101T0000Z/root',
            name: 'root',
            tokens: new Tokens('~user/workflow1//20100101T0000Z/root'),
            type: 'family',
            node: {
              state: 'failed'
            },
            children: [
              {
                id: '~user/workflow1//20100101T0000Z/foo',
                name: 'foo',
                tokens: new Tokens('~user/workflow1//20100101T0000Z/foo'),
                type: 'task',
                node: {
                  __typename: 'TaskProxy',
                  state: 'failed'
                },
                children: [
                  {
                    id: '~user/workflow1//20100101T0000Z/foo/02',
                    name: '02',
                    tokens: new Tokens('~user/workflow1//20100101T0000Z/foo/02'),
                    type: 'job',
                    node: {
                      __typename: 'Job',
                      startedTime: '2019-08-19T22:51:06Z',
                      state: 'submit-failed',
                      submitNum: 2,
                      customOutputs: []
                    },
                    children: []
                  },
                  {
                    id: '~user/workflow1//20100101T0000Z/foo/01',
                    name: '01',
                    tokens: new Tokens('~user/workflow1//20100101T0000Z/foo/01'),
                    type: 'job',
                    node: {
                      __typename: 'Job',
                      startedTime: '2019-08-19T22:44:42Z',
                      state: 'failed',
                      submitNum: 1,
                      customOutputs: [
                        {
                          label: 'out1',
                          message: 'Aliquam a lectus euismod, vehicula leo vel, ultricies odio.'
                        }
                      ]
                    },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]

export const simpleWorkflowNode = simpleWorkflowTree4Nodes[0]
export const simpleCyclepointNode = simpleWorkflowTree4Nodes[0].children[0]
export const simpleTaskNode = simpleCyclepointNode.familyTree[0].children[0]
export const simpleJobNode = simpleTaskNode.children.at(-1)

export const sampleWorkflow1 = {
  workflow: {
    id: '~cylc/one',
    __typename: 'Workflow',
    status: 'running',
    owner: 'cylc',
    host: 'ranma',
    port: 43066
  },
  cyclePoints: [
    {
      __typename: 'FamilyProxy',
      id: '~cylc/one//20000101T0000Z/root',
      cyclePoint: '20000101T0000Z'
    },
    {
      __typename: 'FamilyProxy',
      id: '~cylc/one//20000102T0000Z/root',
      cyclePoint: '20000102T0000Z'
    }
  ],
  familyProxies: [
    {
      id: '~cylc/one//20000101T0000Z/SUCCEEDED',
      __typename: 'FamilyProxy',
      name: 'SUCCEEDED',
      cyclePoint: '20000101T0000Z',
      state: 'succeeded',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/GOOD',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'GOOD',
        cyclePoint: '20000101T0000Z'
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/BAD',
      __typename: 'FamilyProxy',
      name: 'BAD',
      cyclePoint: '20000101T0000Z',
      state: 'failed',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/GOOD',
      __typename: 'FamilyProxy',
      name: 'GOOD',
      cyclePoint: '20000101T0000Z',
      state: 'succeeded',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/SUCCEEDED',
      __typename: 'FamilyProxy',
      name: 'SUCCEEDED',
      cyclePoint: '20000102T0000Z',
      state: 'succeeded',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/GOOD',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'GOOD',
        cyclePoint: '20000102T0000Z'
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/GOOD',
      __typename: 'FamilyProxy',
      name: 'GOOD',
      cyclePoint: '20000102T0000Z',
      state: 'succeeded',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/BAD',
      __typename: 'FamilyProxy',
      name: 'BAD',
      cyclePoint: '20000102T0000Z',
      state: 'failed',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/root',
        __typename: 'FamilyProxy',
        name: 'root',
        cyclePoint: '20000102T0000Z',
        state: 'failed'
      }
    }
  ],
  taskProxies: [
    {
      id: '~cylc/one//20000101T0000Z/eventually_succeeded',
      __typename: 'TaskProxy',
      name: 'eventually_succeeded',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/SUCCEEDED',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.5,
        name: 'eventually_succeeded'
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/sleepy',
      name: 'sleepy',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/root',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'sleepy'
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/succeeded',
      name: 'succeeded',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/SUCCEEDED',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'succeeded'
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/retrying',
      name: 'retrying',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/BAD',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'retrying'
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/checkpoint',
      name: 'checkpoint',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 7.0,
        name: 'checkpoint'
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/failed',
      name: 'failed',
      __typename: 'TaskProxy',
      state: 'failed',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/BAD',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'failed'
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/waiting',
      name: 'waiting',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'waiting'
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/sleepy',
      name: 'sleepy',
      __typename: 'TaskProxy',
      state: 'waiting',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'sleepy'
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/succeeded',
      name: 'succeeded',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/SUCCEEDED',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'succeeded'
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/failed',
      name: 'failed',
      __typename: 'TaskProxy',
      state: 'failed',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/BAD',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'failed'
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/waiting',
      name: 'waiting',
      __typename: 'TaskProxy',
      state: 'waiting',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'waiting'
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/checkpoint',
      name: 'checkpoint',
      __typename: 'TaskProxy',
      state: 'running',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 7.0,
        name: 'checkpoint'
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/checkpoint2',
      name: 'checkpoint2',
      __typename: 'TaskProxy',
      state: 'running',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'checkpoint2'
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/eventually_succeeded',
      name: 'eventually_succeeded',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/SUCCEEDED',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.5,
        name: 'eventually_succeeded'
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/retrying',
      name: 'retrying',
      __typename: 'TaskProxy',
      state: 'waiting',
      cyclePoint: '20000102T0000Z',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/BAD',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'retrying'
      }
    }
  ],
  jobs: [
    {
      id: '~cylc/one//20000101T0000Z/eventually_succeeded/04',
      name: '04',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16134',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:50Z',
      submittedTime: '2019-10-23T07:02:50Z',
      finishedTime: '2019-10-23T07:02:51Z',
      state: 'succeeded',
      submitNum: 4,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          },
          {
            label: 'out1',
            message: 'Aliquam a lectus euismod, vehicula leo vel, ultricies odio.'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/eventually_succeeded/03',
      name: '03',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16094',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:46Z',
      submittedTime: '2019-10-23T07:02:46Z',
      finishedTime: '2019-10-23T07:02:47Z',
      state: 'failed',
      submitNum: 3,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/eventually_succeeded/02',
      name: '02',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16056',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:42Z',
      submittedTime: '2019-10-23T07:02:42Z',
      finishedTime: '2019-10-23T07:02:43Z',
      state: 'failed',
      submitNum: 2,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/eventually_succeeded/01',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '15947',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:38Z',
      submittedTime: '2019-10-23T07:02:38Z',
      finishedTime: '2019-10-23T07:02:39Z',
      state: 'failed',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/sleepy/01',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/sleepy',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16331',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:05Z',
      submittedTime: '2019-10-23T07:03:05Z',
      finishedTime: '2019-10-23T07:03:06Z',
      state: 'succeeded',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/succeeded/1',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '15951',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:38Z',
      submittedTime: '2019-10-23T07:02:38Z',
      finishedTime: '2019-10-23T07:02:39Z',
      state: 'succeeded',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/retrying/01',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/retrying',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '15948',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:38Z',
      submittedTime: '2019-10-23T07:02:38Z',
      finishedTime: '2019-10-23T07:02:39Z',
      state: 'failed',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/checkpoint/01',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/checkpoint',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16213',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:56Z',
      submittedTime: '2019-10-23T07:02:56Z',
      finishedTime: '2019-10-23T07:03:03Z',
      state: 'succeeded',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/failed/01',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/failed',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16173',
      platform: 'localhost',
      startedTime: '2019-10-23T07:02:53Z',
      submittedTime: '2019-10-23T07:02:53Z',
      finishedTime: '2019-10-23T07:02:54Z',
      state: 'failed',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000101T0000Z/waiting/01',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000101T0000Z/waiting',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16332',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:05Z',
      submittedTime: '2019-10-23T07:03:05Z',
      finishedTime: '2019-10-23T07:03:06Z',
      state: 'succeeded',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/succeeded/01',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16424',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:09Z',
      submittedTime: '2019-10-23T07:03:09Z',
      finishedTime: '2019-10-23T07:03:10Z',
      state: 'succeeded',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/failed/01',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/failed',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16646',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:25Z',
      submittedTime: '2019-10-23T07:03:24Z',
      finishedTime: '2019-10-23T07:03:25Z',
      state: 'failed',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/checkpoint/01',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/checkpoint',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16684',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:28Z',
      submittedTime: '2019-10-23T07:03:27Z',
      finishedTime: '',
      state: 'running',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/checkpoint2/01',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/checkpoint2',
        __typename: 'TaskProxy'
      },
      __typename: 'TaskProxy',
      jobRunnerName: 'background',
      jobId: '16688',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:28Z',
      submittedTime: '2019-10-23T07:03:27Z',
      finishedTime: '',
      state: 'running',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/eventually_succeeded/04',
      name: '04',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16607',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:22Z',
      submittedTime: '2019-10-23T07:03:21Z',
      finishedTime: '2019-10-23T07:03:22Z',
      state: 'succeeded',
      submitNum: 4,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'succeeded',
            message: 'succeeded'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/eventually_succeeded/03',
      name: '03',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16569',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:18Z',
      submittedTime: '2019-10-23T07:03:17Z',
      finishedTime: '2019-10-23T07:03:18Z',
      state: 'failed',
      submitNum: 3,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/eventually_succeeded/02',
      name: '02',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16529',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:13Z',
      submittedTime: '2019-10-23T07:03:13Z',
      finishedTime: '2019-10-23T07:03:14Z',
      state: 'failed',
      submitNum: 2,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/eventually_succeeded/01',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/eventually_succeeded',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16420',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:09Z',
      submittedTime: '2019-10-23T07:03:09Z',
      finishedTime: '2019-10-23T07:03:10Z',
      state: 'failed',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    },
    {
      id: '~cylc/one//20000102T0000Z/retrying/01',
      name: '01',
      firstParent: {
        id: '~cylc/one//20000102T0000Z/retrying',
        __typename: 'TaskProxy'
      },
      __typename: 'Job',
      jobRunnerName: 'background',
      jobId: '16421',
      platform: 'localhost',
      startedTime: '2019-10-23T07:03:09Z',
      submittedTime: '2019-10-23T07:03:09Z',
      finishedTime: '2019-10-23T07:03:10Z',
      state: 'failed',
      submitNum: 1,
      taskProxy: {
        outputs: [
          {
            label: 'submitted',
            message: 'submitted'
          },
          {
            label: 'started',
            message: 'started'
          },
          {
            label: 'failed',
            message: 'failed'
          }
        ]
      }
    }
  ]
}
