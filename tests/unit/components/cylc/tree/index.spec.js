import { convertGraphQLWorkflowToTree } from '@/components/cylc/tree/index'
import { expect } from 'chai'

const workflow = {
  id: 'cylc|one',
  name: 'one',
  status: 'running',
  owner: 'cylc',
  host: 'ranma',
  port: 43066,
  taskProxies: [
    {
      id: 'cylc|one|20000101T0000Z|eventually_succeeded',
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      latestMessage: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|SUCCEEDED',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        meanElapsedTime: 0.5,
        name: 'eventually_succeeded'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|eventually_succeeded|4',
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
        meanElapsedTime: 1.0,
        name: 'sleepy'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|sleepy|1',
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
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      latestMessage: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|SUCCEEDED',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        meanElapsedTime: 1.0,
        name: 'succeeded'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|succeeded|1',
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
      state: 'succeeded',
      cyclePoint: '20000101T0000Z',
      latestMessage: 'failed, retrying in PT5M (after 2019-10-23T07:07:39Z)',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|BAD',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        meanElapsedTime: 0.0,
        name: 'retrying'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|retrying|1',
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
        meanElapsedTime: 7.0,
        name: 'checkpoint'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|checkpoint|1',
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
      state: 'failed',
      cyclePoint: '20000101T0000Z',
      latestMessage: 'failed/EXIT',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|BAD',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000101T0000Z'
      },
      task: {
        meanElapsedTime: 0.0,
        name: 'failed'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|failed|1',
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
        meanElapsedTime: 1.0,
        name: 'waiting'
      },
      jobs: [
        {
          id: 'cylc|one|20000101T0000Z|waiting|1',
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
      state: 'waiting',
      cyclePoint: '20000102T0000Z',
      latestMessage: '',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        meanElapsedTime: 1.0,
        name: 'sleepy'
      },
      jobs: []
    },
    {
      id: 'cylc|one|20000102T0000Z|succeeded',
      state: 'succeeded',
      cyclePoint: '20000102T0000Z',
      latestMessage: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|SUCCEEDED',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        meanElapsedTime: 1.0,
        name: 'succeeded'
      },
      jobs: [
        {
          id: 'cylc|one|20000102T0000Z|succeeded|1',
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
      state: 'failed',
      cyclePoint: '20000102T0000Z',
      latestMessage: 'failed/EXIT',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|BAD',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        meanElapsedTime: 0.0,
        name: 'failed'
      },
      jobs: [
        {
          id: 'cylc|one|20000102T0000Z|failed|1',
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
      state: 'waiting',
      cyclePoint: '20000102T0000Z',
      latestMessage: '',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        meanElapsedTime: 1.0,
        name: 'waiting'
      },
      jobs: []
    },
    {
      id: 'cylc|one|20000102T0000Z|checkpoint',
      state: 'running',
      cyclePoint: '20000102T0000Z',
      latestMessage: 'started',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        meanElapsedTime: 7.0,
        name: 'checkpoint'
      },
      jobs: [
        {
          id: 'cylc|one|20000102T0000Z|checkpoint|1',
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
      id: 'cylc|one|20000102T0000Z|eventually_succeeded',
      state: 'succeeded',
      cyclePoint: '20000102T0000Z',
      latestMessage: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|SUCCEEDED',
        state: 'succeeded',
        name: 'SUCCEEDED',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        meanElapsedTime: 0.5,
        name: 'eventually_succeeded'
      },
      jobs: [
        {
          id: 'cylc|one|20000102T0000Z|eventually_succeeded|4',
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
      state: 'retrying',
      cyclePoint: '20000102T0000Z',
      latestMessage: 'failed, retrying in PT5M (after 2019-10-23T07:08:10Z)',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|BAD',
        state: 'failed',
        name: 'BAD',
        cyclePoint: '20000102T0000Z'
      },
      task: {
        meanElapsedTime: 0.0,
        name: 'retrying'
      },
      jobs: [
        {
          id: 'cylc|one|20000102T0000Z|retrying|1',
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
      name: 'root',
      cyclePoint: '20000102T0000Z',
      state: 'failed',
      firstParent: null
    },
    {
      id: 'cylc|one|20000101T0000Z|root',
      name: 'root',
      cyclePoint: '20000101T0000Z',
      state: 'failed',
      firstParent: null
    },
    {
      id: 'cylc|one|20000101T0000Z|SUCCEEDED',
      name: 'SUCCEEDED',
      cyclePoint: '20000101T0000Z',
      state: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|GOOD',
        state: 'succeeded',
        name: 'GOOD',
        cyclePoint: '20000101T0000Z'
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|BAD',
      name: 'BAD',
      cyclePoint: '20000101T0000Z',
      state: 'failed',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|root',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      }
    },
    {
      id: 'cylc|one|20000101T0000Z|GOOD',
      name: 'GOOD',
      cyclePoint: '20000101T0000Z',
      state: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000101T0000Z|root',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000101T0000Z'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|SUCCEEDED',
      name: 'SUCCEEDED',
      cyclePoint: '20000102T0000Z',
      state: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|GOOD',
        state: 'succeeded',
        name: 'GOOD',
        cyclePoint: '20000102T0000Z'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|GOOD',
      name: 'GOOD',
      cyclePoint: '20000102T0000Z',
      state: 'succeeded',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        state: 'failed',
        name: 'root',
        cyclePoint: '20000102T0000Z'
      }
    },
    {
      id: 'cylc|one|20000102T0000Z|BAD',
      name: 'BAD',
      cyclePoint: '20000102T0000Z',
      state: 'failed',
      firstParent: {
        id: 'cylc|one|20000102T0000Z|root',
        name: 'root',
        cyclePoint: '20000102T0000Z',
        state: 'failed'
      }
    }
  ]
}

const CYCLEPOINT_TYPE = 'cyclepoint'
const FAMILY_TYPE = 'family'
const TASK_TYPE = 'task'

describe('Tree component functions', () => {
  const workflowTree = convertGraphQLWorkflowToTree(workflow)[0]
  it('should add cycle points as direct children of the workflow', () => {
    expect(workflowTree.children.length).to.equal(2)
    expect(workflowTree.children[0].__type).to.equal(CYCLEPOINT_TYPE)
    expect(workflowTree.children[1].__type).to.equal(CYCLEPOINT_TYPE)
  })
  it('should add families and tasks as children to cycle points correctly', () => {
    // the first cycle point in the example data contains two families, and two tasks
    const firstCyclePoint = workflowTree.children[0]
    const children = firstCyclePoint.children
    expect(children[0].__type).to.equal(FAMILY_TYPE)
    expect(children[1].__type).to.equal(FAMILY_TYPE)
    expect(children[2].__type).to.equal(TASK_TYPE)
    expect(children[2].__type).to.equal(TASK_TYPE)
  })
  it('should add families as children to families correctly', () => {
    const firstCyclePoint = workflowTree.children[0]
    const children = firstCyclePoint.children
    expect(children[1].__type).to.equal(FAMILY_TYPE)
    expect(children[1].name).to.equal('GOOD')
    expect(children[1].children[0].__type).to.equal(FAMILY_TYPE)
    expect(children[1].children[0].name).to.equal('SUCCEEDED')
  })
})
