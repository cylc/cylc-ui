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

import {
  createTaskProxyNode,
  populateTreeFromGraphQLData
} from '@/components/cylc/tree/index'
import { expect } from 'chai'
import sinon from 'sinon'
import { sampleWorkflow1 } from './tree.data'
import CylcTree from '@/components/cylc/tree/tree'

const CYCLEPOINT_TYPE = 'cyclepoint'
const FAMILY_TYPE = 'family-proxy'
const TASK_TYPE = 'task-proxy'

describe('Tree component functions', () => {
  const cylcTree = new CylcTree()
  let workflowTree
  before(() => {
    cylcTree.clear()
    populateTreeFromGraphQLData(cylcTree, sampleWorkflow1)
    workflowTree = cylcTree.root.children
  })
  it('should add cycle points as direct children of the workflow', () => {
    expect(workflowTree.length).to.equal(2)
    expect(workflowTree[0].type).to.equal(CYCLEPOINT_TYPE)
    expect(workflowTree[1].type).to.equal(CYCLEPOINT_TYPE)
  })
  it('should add families and tasks as children to cycle points correctly', () => {
    // the first cycle point in the example data contains two families, and two tasks
    const firstCyclePoint = workflowTree[0]
    const children = firstCyclePoint.children
    expect(children[0].type).to.equal(FAMILY_TYPE)
    expect(children[1].type).to.equal(FAMILY_TYPE)
    expect(children[2].type).to.equal(TASK_TYPE)
    expect(children[2].type).to.equal(TASK_TYPE)
  })
  it('should add families as children to families correctly', () => {
    const workflowTree = cylcTree.root.children
    const firstCyclePoint = workflowTree[0]
    const children = firstCyclePoint.children
    expect(children[1].type).to.equal(FAMILY_TYPE)
    expect(children[1].node.name).to.equal('GOOD')
    expect(children[1].children[0].type).to.equal(FAMILY_TYPE)
    expect(children[1].children[0].node.name).to.equal('SUCCEEDED')
  })
  it('should set the progress to 0 when meanElapsedTime is 0', () => {
    expect(sampleWorkflow1.taskProxies[11].task.meanElapsedTime).to.equal(7.0)
    expect(sampleWorkflow1.taskProxies[12].task.meanElapsedTime).to.equal(0)
    // when parsed, these two task proxies will become these children of a cyclepoint (was root family before)
    expect(workflowTree[1].children[4].node.progress).to.not.equal(0)
    expect(workflowTree[1].children[5].node.progress).to.equal(0)
  })
  it('should set the progress to 0 when startedTime is greater than now', () => {
    // dispatching here will call new Date() to calculate now, so let's mock it...
    const stub = sinon.stub(Date, 'now').returns(0)
    // now the clock is set back to moment 0 (19700101...) by sinon, so Date.now() or new Date().getTime()
    // will return the clock object and the moment 0...
    const cylcTree = new CylcTree()
    populateTreeFromGraphQLData(cylcTree, sampleWorkflow1)
    const workflowTree = cylcTree.root.children
    // see test above, where the value is **not** equal 0
    expect(workflowTree[1].children[4].node.progress).to.equal(0)
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
    const cylcTree = new CylcTree()
    populateTreeFromGraphQLData(cylcTree, sampleWorkflow1)
    const task = workflowTree[1].children[4]
    expect(task.node.progress).to.equal(100)
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
    const cylcTree = new CylcTree()
    populateTreeFromGraphQLData(cylcTree, sampleWorkflow1)
    const task = workflowTree[1].children[4]
    expect(task.node.progress).to.equal(50)
    // remove the mock
    stub.restore()
  })
  it('should initialize the task proxy state if undefined', () => {
    const taskProxy = sampleWorkflow1.taskProxies[0]
    delete taskProxy.state
    const taskProxyNode = createTaskProxyNode(taskProxy)
    expect(taskProxyNode.node.state).to.equal('')
  })
  it('should throw an error when the workflow to be populated is invalid', () => {
    const tree = {}
    const workflow = {}
    expect(populateTreeFromGraphQLData, null, workflow).to.throw(Error)
    expect(populateTreeFromGraphQLData, tree, null).to.throw(Error)
    expect(populateTreeFromGraphQLData, tree, workflow).to.throw(Error)
  })
})
