import { expect } from 'chai'
import store from '@/store'
import sinon from 'sinon'

describe('store', () => {
  let workflows = []
  beforeEach(() => {
    workflows = [
      {
        id: 'cylc|one',
        name: 'one',
        status: 'running',
        taskProxies: [
          {
            id: 'cylc|one|20000101T0000Z|sleepy',
            state: 'running',
            task: {
              meanElapsedTime: 1.0
            },
            firstParent: {
              id: 'cylc|one|20000101T0000Z|root',
              state: 'running'
            },
            jobs: [
              {
                id: 'cylc|one|20000101T0000Z|sleepy|03',
                startedTime: '2019-08-21T01:31:30Z',
                state: 'running',
                submitNum: 3
              },
              {
                id: 'cylc|one|20000101T0000Z|sleepy|02',
                startedTime: '2018-08-21T01:31:30Z',
                state: 'running',
                submitNum: 2
              },
              {
                id: 'cylc|one|20000101T0000Z|sleepy|01',
                startedTime: '2017-08-21T01:31:30Z',
                state: 'running',
                submitNum: 1
              }
            ]
          }
        ],
        familyProxies: [
          {
            id: 'cylc|one|20000101T0000Z|root',
            state: 'running',
            firstParent: null
          }
        ]
      }
    ]
  })
  describe('workflows', () => {
    it('should set the workflowTree for a valid workflows', () => {
      store.dispatch('workflows/set', workflows)
      expect(store.state.workflows.workflowTree).to.not.equal([])
      // 1 workflow
      expect(store.state.workflows.workflowTree.length).to.equal(1)
      // 1 cycle point
      expect(store.state.workflows.workflowTree[0].children.length).to.equal(1)
      /// 1 task
      expect(store.state.workflows.workflowTree[0].children[0].children.length).to.equal(1)
      // 3 jobs
      expect(store.state.workflows.workflowTree[0].children[0].children[0].children.length).to.equal(3)
    })
    it('should set the progress to 0 when meanElapsedTime is 0', () => {
      workflows[0].taskProxies[0].task.meanElapsedTime = 0
      store.dispatch('workflows/set', workflows)
      const workflowTree = store.state.workflows.workflowTree
      const task = workflowTree[0].children[0].children[0]
      expect(task.progress).to.equal(0)
    })
    it('should set the progress to 0 when startedTime is greater than now', () => {
      // dispatching here will call new Date() to calculate now, so let's mock it...
      const stub = sinon.stub(Date, 'now').returns(0)
      // now the clock is set back to moment 0 (19700101...) by sinon, so Date.now() or new Date().getTime()
      // will return the clock object and the moment 0...
      store.dispatch('workflows/set', workflows)
      const workflowTree = store.state.workflows.workflowTree
      const task = workflowTree[0].children[0].children[0]
      expect(task.progress).to.equal(0)
      // remove the mock
      stub.restore()
    })
    it('should set the progress to 100 when now() is greater than elapsedTime', () => {
      // dispatching here will call new Date() to calculate now, so let's mock it...
      const startedTime = Date.parse(workflows[0].taskProxies[0].jobs[0].startedTime)
      const meanElapsedTime = workflows[0].taskProxies[0].task.meanElapsedTime
      const timeExpectedToComplete = startedTime + meanElapsedTime * 1000
      // even if 0.1 greater than the timeExpectedToComplete, it will be 100
      const stub = sinon.stub(Date, 'now').returns(timeExpectedToComplete + 0.1)
      // now the clock is set back to moment 0 (19700101...) by sinon, so Date.now() or new Date().getTime()
      // will return the clock object and the moment 0...
      store.dispatch('workflows/set', workflows)
      const workflowTree = store.state.workflows.workflowTree
      const task = workflowTree[0].children[0].children[0]
      expect(task.progress).to.equal(100)
      // remove the mock
      stub.restore()
    })
    it('should compute the progress percent', () => {
      // dispatching here will call new Date() to calculate now, so let's mock it...
      const startedTime = Date.parse(workflows[0].taskProxies[0].jobs[0].startedTime)
      const stub = sinon.stub(Date, 'now').returns(startedTime + 500) // so let's make the now() function return started time plus 500 ms (half of meanElapsedTime * 1000)
      // now the clock is set back to moment 0 (19700101...) by sinon, so Date.now() or new Date().getTime()
      // will return the clock object and the moment 0...
      store.dispatch('workflows/set', workflows)
      const workflowTree = store.state.workflows.workflowTree
      const task = workflowTree[0].children[0].children[0]
      expect(task.progress).to.equal(50)
      // remove the mock
      stub.restore()
    })
  })
})
