/*
 * Test data for Tree component tests.
 */

const simpleWorkflowTree4Nodes = [
  {
    id: 'user/workflow1',
    node: {
      __typename: 'Workflow',
      name: 'workflow1',
      state: 'running'
    },
    children: [
      {
        id: '20100101T0000Z',
        node: {
          __typename: 'CyclePoint',
          name: '20100101T0000Z',
          state: 'failed'
        },
        children: [
          {
            id: 'user/workflow1/20100101T0000Z/foo',
            node: {
              __typename: 'TaskProxy',
              name: 'foo',
              state: 'failed'
            },
            expanded: false,
            children: [
              {
                id: 'user/workflow1/20100101T0000Z/foo/01',
                node: {
                  __typename: 'Job',
                  name: '1',
                  startedTime: '2019-08-19T22:44:42Z',
                  state: 'failed',
                  submitNum: 1
                }
              }
            ]
          }
        ]
      }
    ]
  }
]

const sampleWorkflow1 = {
  id: 'cylc|one',
  __typename: 'Workflow',
  name: 'one',
  status: 'running',
  owner: 'cylc',
  host: 'ranma',
  port: 43066,
  cyclePoints: [
    {
      __typename: 'FamilyProxy',
      cyclePoint: '20000101T0000Z'
    },
    {
      __typename: 'FamilyProxy',
      cyclePoint: '20000102T0000Z'
    }
  ],
  taskProxies: [
    {
      id: 'cylc|one|20000101T0000Z|eventually_succeeded',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      latestMessage: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|SUCCEEDED',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.5,
        name: 'eventually_succeeded'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|eventually_succeeded|4',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16134',
          host: 'localhost',
          startedTime: '2019-10-23T07:02:50Z',
          submittedTime: '2019-10-23T07:02:50Z',
          finishedTime: '2019-10-23T07:02:51Z',
          state: 'succeeded',
          submitNum: 4
        },
        {
          id: 'cylc|one|20000101T0000Z|eventually_succeeded|3',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16094',
          host: 'localhost',
          startedTime: '2019-10-23T07:02:46Z',
          submittedTime: '2019-10-23T07:02:46Z',
          finishedTime: '2019-10-23T07:02:47Z',
          state: 'failed',
          submitNum: 3
        },
        {
          id: 'cylc|one|20000101T0000Z|eventually_succeeded|2',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16056',
          host: 'localhost',
          startedTime: '2019-10-23T07:02:42Z',
          submittedTime: '2019-10-23T07:02:42Z',
          finishedTime: '2019-10-23T07:02:43Z',
          state: 'failed',
          submitNum: 2
        },
        {
          id: 'cylc|one|20000101T0000Z|eventually_succeeded|1',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '15947',
          host: 'localhost',
          startedTime: '2019-10-23T07:02:38Z',
          submittedTime: '2019-10-23T07:02:38Z',
          finishedTime: '2019-10-23T07:02:39Z',
          state: 'failed',
          submitNum: 1
        }
      ]
    },
    {
      id: 'cylc|one|20000101T0000Z|sleepy',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      latestMessage: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|root',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'sleepy'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|sleepy|1',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16331',
          host: 'localhost',
          startedTime: '2019-10-23T07:03:05Z',
          submittedTime: '2019-10-23T07:03:05Z',
          finishedTime: '2019-10-23T07:03:06Z',
          state: 'succeeded',
          submitNum: 1
        }
      ]
    },
    {
      id: 'cylc|one|20000101T0000Z|succeeded',
      __typename: 'Job',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      latestMessage: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|SUCCEEDED',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'succeeded'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|succeeded|1',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '15951',
          host: 'localhost',
          startedTime: '2019-10-23T07:02:38Z',
          submittedTime: '2019-10-23T07:02:38Z',
          finishedTime: '2019-10-23T07:02:39Z',
          state: 'succeeded',
          submitNum: 1
        }
      ]
    },
    {
      id: 'cylc|one|20000101T0000Z|retrying',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      latestMessage: 'failed, retrying in PT5M (after 2019-10-23T07:07:39Z)',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|BAD',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'retrying'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|retrying|1',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '15948',
          host: 'localhost',
          startedTime: '2019-10-23T07:02:38Z',
          submittedTime: '2019-10-23T07:02:38Z',
          finishedTime: '2019-10-23T07:02:39Z',
          state: 'failed',
          submitNum: 1
        }
      ]
    },
    {
      id: 'cylc|one|20000101T0000Z|checkpoint',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      latestMessage: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 7.0,
        name: 'checkpoint'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|checkpoint|1',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16213',
          host: 'localhost',
          startedTime: '2019-10-23T07:02:56Z',
          submittedTime: '2019-10-23T07:02:56Z',
          finishedTime: '2019-10-23T07:03:03Z',
          state: 'succeeded',
          submitNum: 1
        }
      ]
    },
    {
      id: 'cylc|one|20000101T0000Z|failed',
      __typename: 'TaskProxy',
      state: 'failed',
      cyclePoint: '20000101T0000Z',
      latestMessage: 'failed/EXIT',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|BAD',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'failed'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|failed|1',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16173',
          host: 'localhost',
          startedTime: '2019-10-23T07:02:53Z',
          submittedTime: '2019-10-23T07:02:53Z',
          finishedTime: '2019-10-23T07:02:54Z',
          state: 'failed',
          submitNum: 1
        }
      ]
    },
    {
      id: 'cylc|one|20000101T0000Z|waiting',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      latestMessage: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'waiting'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|waiting|1',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16332',
          host: 'localhost',
          startedTime: '2019-10-23T07:03:05Z',
          submittedTime: '2019-10-23T07:03:05Z',
          finishedTime: '2019-10-23T07:03:06Z',
          state: 'succeeded',
          submitNum: 1
        }
      ]
    },
    {
      id: 'cylc|one|20000102T0000Z|sleepy',
      __typename: 'TaskProxy',
      state: 'waiting',
      cyclePoint: '20000102T0000Z',
      latestMessage: '',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'sleepy'
      },
      jobs: []
    },
    {
      id: 'cylc|one|20000102T0000Z|succeeded',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000102T0000Z',
      latestMessage: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|SUCCEEDED',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'succeeded'
      },
      jobs: [
        {
          id: 'cylc|one|20000102T0000Z|succeeded|1',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16424',
          host: 'localhost',
          startedTime: '2019-10-23T07:03:09Z',
          submittedTime: '2019-10-23T07:03:09Z',
          finishedTime: '2019-10-23T07:03:10Z',
          state: 'succeeded',
          submitNum: 1
        }
      ]
    },
    {
      id: 'cylc|one|20000102T0000Z|failed',
      __typename: 'TaskProxy',
      state: 'failed',
      cyclePoint: '20000102T0000Z',
      latestMessage: 'failed/EXIT',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|BAD',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'failed'
      },
      jobs: [
        {
          id: 'cylc|one|20000102T0000Z|failed|1',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16646',
          host: 'localhost',
          startedTime: '2019-10-23T07:03:25Z',
          submittedTime: '2019-10-23T07:03:24Z',
          finishedTime: '2019-10-23T07:03:25Z',
          state: 'failed',
          submitNum: 1
        }
      ]
    },
    {
      id: 'cylc|one|20000102T0000Z|waiting',
      __typename: 'TaskProxy',
      state: 'waiting',
      cyclePoint: '20000102T0000Z',
      latestMessage: '',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 1.0,
        name: 'waiting'
      },
      jobs: []
    },
    {
      id: 'cylc|one|20000102T0000Z|checkpoint',
      __typename: 'TaskProxy',
      state: 'running',
      cyclePoint: '20000102T0000Z',
      latestMessage: 'started',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 7.0,
        name: 'checkpoint'
      },
      jobs: [
        {
          id: 'cylc|one|20000102T0000Z|checkpoint|1',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16684',
          host: 'localhost',
          startedTime: '2019-10-23T07:03:28Z',
          submittedTime: '2019-10-23T07:03:27Z',
          finishedTime: '',
          state: 'running',
          submitNum: 1
        }
      ]
    },
    {
      id: 'cylc|one|20000102T0000Z|checkpoint2',
      __typename: 'TaskProxy',
      state: 'running',
      cyclePoint: '20000102T0000Z',
      latestMessage: 'started',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'checkpoint2'
      },
      jobs: [
        {
          id: 'cylc|one|20000102T0000Z|checkpoint2|1',
          __typename: 'TaskProxy',
          batchSysName: 'background',
          batchSysJobId: '16688',
          host: 'localhost',
          startedTime: '2019-10-23T07:03:28Z',
          submittedTime: '2019-10-23T07:03:27Z',
          finishedTime: '',
          state: 'running',
          submitNum: 1
        }
      ]
    },
    {
      id: 'cylc|one|20000102T0000Z|eventually_succeeded',
      __typename: 'TaskProxy',
      state: 'succeeded',
      cyclePoint: '20000102T0000Z',
      latestMessage: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|SUCCEEDED',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.5,
        name: 'eventually_succeeded'
      },
      jobs: [
        {
          id: 'cylc|one|20000102T0000Z|eventually_succeeded|4',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16607',
          host: 'localhost',
          startedTime: '2019-10-23T07:03:22Z',
          submittedTime: '2019-10-23T07:03:21Z',
          finishedTime: '2019-10-23T07:03:22Z',
          state: 'succeeded',
          submitNum: 4
        },
        {
          id: 'cylc|one|20000102T0000Z|eventually_succeeded|3',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16569',
          host: 'localhost',
          startedTime: '2019-10-23T07:03:18Z',
          submittedTime: '2019-10-23T07:03:17Z',
          finishedTime: '2019-10-23T07:03:18Z',
          state: 'failed',
          submitNum: 3
        },
        {
          id: 'cylc|one|20000102T0000Z|eventually_succeeded|2',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16529',
          host: 'localhost',
          startedTime: '2019-10-23T07:03:13Z',
          submittedTime: '2019-10-23T07:03:13Z',
          finishedTime: '2019-10-23T07:03:14Z',
          state: 'failed',
          submitNum: 2
        },
        {
          id: 'cylc|one|20000102T0000Z|eventually_succeeded|1',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16420',
          host: 'localhost',
          startedTime: '2019-10-23T07:03:09Z',
          submittedTime: '2019-10-23T07:03:09Z',
          finishedTime: '2019-10-23T07:03:10Z',
          state: 'failed',
          submitNum: 1
        }
      ]
    },
    {
      id: 'cylc|one|20000102T0000Z|retrying',
      __typename: 'TaskProxy',
      state: 'retrying',
      cyclePoint: '20000102T0000Z',
      latestMessage: 'failed, retrying in PT5M (after 2019-10-23T07:08:10Z)',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|BAD',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        __typename: 'Task',
        meanElapsedTime: 0.0,
        name: 'retrying'
      },
      jobs: [
        {
          id: 'cylc|one|20000102T0000Z|retrying|1',
          __typename: 'Job',
          batchSysName: 'background',
          batchSysJobId: '16421',
          host: 'localhost',
          startedTime: '2019-10-23T07:03:09Z',
          submittedTime: '2019-10-23T07:03:09Z',
          finishedTime: '2019-10-23T07:03:10Z',
          state: 'failed',
          submitNum: 1
        }
      ]
    }
  ],
  familyProxies: [
    {
      id: 'cylc|one|20000102T0000Z|root',
      __typename: 'FamilyProxy',
      name: 'root',
      cyclePoint: '20000102T0000Z',
      state: 'failed',
      firstParent: null
    },
    {
      id: 'cylc|one|20000101T0000Z|root',
      __typename: 'FamilyProxy',
      name: 'root',
      cyclePoint: '20000101T0000Z',
      state: 'failed',
      firstParent: null
    },
    {
      id: 'cylc|one|20000101T0000Z|SUCCEEDED',
      __typename: 'FamilyProxy',
      name: 'SUCCEEDED',
      cyclePoint: '20000101T0000Z',
      state: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|GOOD',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'GOOD',
        cyclePoint: '20000101T0000Z'
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|BAD',
      __typename: 'FamilyProxy',
      name: 'BAD',
      cyclePoint: '20000101T0000Z',
      state: 'failed',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|GOOD',
      __typename: 'FamilyProxy',
      name: 'GOOD',
      cyclePoint: '20000101T0000Z',
      state: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|SUCCEEDED',
      __typename: 'FamilyProxy',
      name: 'SUCCEEDED',
      cyclePoint: '20000102T0000Z',
      state: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|GOOD',
        __typename: 'FamilyProxy',
        state: 'succeeded',
        name: 'GOOD',
        cyclePoint: '20000102T0000Z'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|GOOD',
      __typename: 'FamilyProxy',
      name: 'GOOD',
      cyclePoint: '20000102T0000Z',
      state: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        __typename: 'FamilyProxy',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|BAD',
      __typename: 'FamilyProxy',
      name: 'BAD',
      cyclePoint: '20000102T0000Z',
      state: 'failed',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        __typename: 'FamilyProxy',
        name: 'root',
        cyclePoint: '20000102T0000Z',
        state: 'failed'
      }
    }
  ]
}

const simpleWorkflowNode = simpleWorkflowTree4Nodes[0]
const simpleCyclepointNode = simpleWorkflowTree4Nodes[0].children[0]
const simpleTaskNode = simpleCyclepointNode.children[0]
const simpleJobNode = simpleTaskNode.children[0]

export {
  simpleWorkflowTree4Nodes,
  simpleWorkflowNode,
  simpleCyclepointNode,
  simpleTaskNode,
  simpleJobNode,
  sampleWorkflow1
}
