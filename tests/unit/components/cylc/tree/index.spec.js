import { convertGraphQLWorkflowToTree } from '@/components/cylc/tree/index'
import { expect } from 'chai'
import sinon from 'sinon'
import { sampleWorkflow1 } from './tree.data'

const CYCLEPOINT_TYPE = 'CyclePoint'
const FAMILY_TYPE = 'FamilyProxy'
const TASK_TYPE = 'TaskProxy'

describe('Tree component functions', () => {
  const workflowTree = convertGraphQLWorkflowToTree(sampleWorkflow1)
  it('should add cycle points as direct children of the workflow', () => {
    expect(workflowTree.length).to.equal(2)
    expect(workflowTree[0].__typename).to.equal(CYCLEPOINT_TYPE)
    expect(workflowTree[1].__typename).to.equal(CYCLEPOINT_TYPE)
  })
  it('should add families and tasks as children to cycle points correctly', () => {
    // the first cycle point in the example data contains two families, and two tasks
    const firstCyclePoint = workflowTree[0]
    const children = firstCyclePoint.children
    expect(children[0].__typename).to.equal(FAMILY_TYPE)
    expect(children[1].__typename).to.equal(FAMILY_TYPE)
    expect(children[2].__typename).to.equal(TASK_TYPE)
    expect(children[2].__typename).to.equal(TASK_TYPE)
  })
  it('should add families as children to families correctly', () => {
    const firstCyclePoint = workflowTree[0]
    const children = firstCyclePoint.children
    expect(children[1].__typename).to.equal(FAMILY_TYPE)
    expect(children[1].name).to.equal('GOOD')
    expect(children[1].children[0].__typename).to.equal(FAMILY_TYPE)
    expect(children[1].children[0].name).to.equal('SUCCEEDED')
  })
  it('should set the progress to 0 when meanElapsedTime is 0', () => {
    expect(sampleWorkflow1.taskProxies[11].task.meanElapsedTime).to.equal(7.0)
    expect(sampleWorkflow1.taskProxies[12].task.meanElapsedTime).to.equal(0)
    // when parsed, these two task proxies will become these children of a cyclepoint (was root family before)
    expect(workflowTree[1].children[4].progress).to.not.equal(0)
    expect(workflowTree[1].children[5].progress).to.equal(0)
  })
  it('should set the progress to 0 when startedTime is greater than now', () => {
    // dispatching here will call new Date() to calculate now, so let's mock it...
    const stub = sinon.stub(Date, 'now').returns(0)
    // now the clock is set back to moment 0 (19700101...) by sinon, so Date.now() or new Date().getTime()
    // will return the clock object and the moment 0...
    const workflowTree = convertGraphQLWorkflowToTree(sampleWorkflow1)
    // see test above, where the value is **not** equal 0
    expect(workflowTree[1].children[4].progress).to.equal(0)
    // remove the mock
    stub.restore()
  })
  it('should set the progress to 100 when now() is greater than elapsedTime', () => {
    // avoid changing original test data
    const copy = Object.assign({}, sampleWorkflow1)
    // dispatching here will call new Date() to calculate now, so let's mock it...
    const startedTime = Date.parse(copy.taskProxies[11].jobs[0].startedTime)
    copy.taskProxies[11].task.meanElapsedTime = 1.0
    const meanElapsedTime = copy.taskProxies[11].task.meanElapsedTime
    const timeExpectedToComplete = startedTime + meanElapsedTime * 1000
    // even if 0.1 greater than the timeExpectedToComplete, it will be 100
    const stub = sinon.stub(Date, 'now').returns(timeExpectedToComplete + 0.1)
    // now the clock is set back to moment 0 (19700101...) by sinon, so Date.now() or new Date().getTime()
    // will return the clock object and the moment 0...
    const workflowTree = convertGraphQLWorkflowToTree(copy)
    const task = workflowTree[1].children[4]
    expect(task.progress).to.equal(100)
    // remove the mock
    stub.restore()
  })
  it('should compute the progress percent', () => {
    // avoid changing original test data
    const copy = Object.assign({}, sampleWorkflow1)
    // dispatching here will call new Date() to calculate now, so let's mock it...
    const startedTime = Date.parse(copy.taskProxies[11].jobs[0].startedTime)
    copy.taskProxies[11].task.meanElapsedTime = 1.0
    const stub = sinon.stub(Date, 'now').returns(startedTime + 500) // so let's make the now() function return started time plus 500 ms (half of meanElapsedTime * 1000)
    // now the clock is set back to moment 0 (19700101...) by sinon, so Date.now() or new Date().getTime()
    // will return the clock object and the moment 0...
    const workflowTree = convertGraphQLWorkflowToTree(copy)
    const task = workflowTree[1].children[4]
    expect(task.progress).to.equal(50)
    // remove the mock
    stub.restore()
  })
})
