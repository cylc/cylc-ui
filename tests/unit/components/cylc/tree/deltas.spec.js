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

import { expect } from 'chai'
import sinon from 'sinon'
import TaskState from '@/model/TaskState.model'
import WorkflowState from '@/model/WorkflowState.model'
import * as CylcTree from '@/components/cylc/tree/index'
import { Tokens } from '@/utils/uid'
import {
  applyDeltasAdded as applyWorkflowDeltasAdded,
  applyDeltasUpdated as applyWorkflowDeltasUpdated,
  applyDeltasPruned as applyWorkflowDeltasPruned
} from '@/components/cylc/common/deltas'
import {
  before as beforeApplyingTreeDeltas,
  after as afterApplyingTreeDeltas,
  applyDeltasAdded as applyTreeDeltasAdded,
  applyDeltasUpdated as applyTreeDeltasUpdated,
  applyDeltasPruned as applyTreeDeltasPruned
} from '@/components/cylc/tree/deltas'
import { createCyclePointNode, createFamilyProxyNode, createWorkflowNode } from '@/components/cylc/tree/nodes'

const sandbox = sinon.createSandbox()

/**
 * Tests for the tree deltas module.
 */
describe('Deltas', () => {
  let workflow
  let lookup
  beforeEach(() => {
    workflow = {
      tree: {},
      lookup: {}
    }
    lookup = {}
    sandbox.stub(console, 'log')
  })
  afterEach(() => {
    sandbox.restore()
  })
  const expectNoErrors = (result) => {
    expect(result.errors.length).to.equal(0, result.errors.join('. '))
  }
  const WORKFLOW_ID = '~cylc/workflow'
  const WORKFLOW_TOKENS = new Tokens(WORKFLOW_ID)
  it('Should skip if no deltas provided', () => {
    expect(() => applyTreeDeltasAdded(null, null, null, null)).to.throw(Error)
  })
  it('Should clear the tree if the workflow started', () => {
    const workflowNode = createWorkflowNode({
      id: WORKFLOW_ID
    })
    CylcTree.addWorkflow(workflowNode, workflow, {})
    const cyclePointNode = createCyclePointNode({
      id: WORKFLOW_TOKENS.clone({ cycle: '1' }).id,
      cyclePoint: 1
    })
    CylcTree.addCyclePoint(cyclePointNode, workflow, {})
    // The lookup now has the workflow and the cycle point nodes
    expect(Object.keys(workflow.lookup).length).to.equal(2)
    // Then we send a delta with the workflow added, and with the state
    // of running.
    const deltas = {
      id: WORKFLOW_ID,
      added: {
        workflow: {
          id: WORKFLOW_ID,
          status: WorkflowState.RUNNING.name
        }
      }
    }
    expectNoErrors(beforeApplyingTreeDeltas(deltas, workflow, lookup))
    expectNoErrors(applyWorkflowDeltasAdded(deltas.added, lookup))
    expectNoErrors(applyTreeDeltasAdded(deltas.added, workflow, lookup, {}))
    // The tree will have been cleared, and the new workflow node added, so
    // the lookup now will have only one node (the workflow).
    expect(Object.keys(workflow.lookup).length).to.equal(1)
  })
  it('Should not tally the cycle point states unless deltas were provided', () => {
    const workflowNode = createWorkflowNode({
      id: WORKFLOW_ID
    })
    const fakeTree = sandbox.spy(CylcTree)
    fakeTree.addWorkflow(workflowNode, workflow, {})
    const data = {
      deltas: {
        id: WORKFLOW_ID,
        shutdown: false
      }
    }
    let result = beforeApplyingTreeDeltas(data, workflow, lookup)
    expectNoErrors(result)
    result = applyTreeDeltasAdded(data, workflow, lookup, {})
    expectNoErrors(result)
    result = afterApplyingTreeDeltas(data, workflow, lookup)
    expectNoErrors(result)
    expect(fakeTree.tallyCyclePointStates.called).to.equal(false)
  })
  it('Should warn if the initial data burst has invalid data', () => {
    const result = beforeApplyingTreeDeltas({
      deltas: {
        shutdown: false
      }
    }, workflow, lookup, {})
    expect(result.errors.length).to.equal(1)
    expect(result.errors[0][0]).to.contain('delta before the workflow')
  })
  it('Should log to console and throw an error if it fails to handle deltas', () => {
    const deltas = {
      id: WORKFLOW_ID,
      shutdown: false,
      added: {
        workflow: {
          id: WORKFLOW_ID
        },
        cyclePoints: [
          {
            id: WORKFLOW_TOKENS.clone({
              cycle: '1',
              task: CylcTree.FAMILY_ROOT
            }).id,
            cyclePoint: WORKFLOW_TOKENS.clone({ cycle: '1' }).id
          }
        ]
      }
    }
    // let's force the tree to throw an error when adding cycle points, simulating a runtime exception
    sandbox.stub(CylcTree, 'addCyclePoint').throws(new Error('fake error'))
    expectNoErrors(applyWorkflowDeltasAdded(deltas.added, lookup))
    const result = applyTreeDeltasAdded(deltas.added, workflow, lookup, {})
    expect(result.errors.length).to.equal(1)
    expect(result.errors[0][0]).to.contain('added-delta')
  })
  it('Should log to console and throw an error if it fails to handle deltas on the first data burst', () => {
    const deltas = {
      id: WORKFLOW_ID,
      shutdown: false,
      added: {
        workflow: {
          id: `~user/${WORKFLOW_ID}`
        }
      }
    }
    sandbox.stub(CylcTree, 'tallyCyclePointStates').throws(new Error('fake error'))
    // let's force the tree to throw an error when handling the first data burst, simulating a runtime exception
    const result = afterApplyingTreeDeltas(deltas, workflow, lookup)
    expect(result.errors.length).to.equal(1)
    expect(result.errors[0][0].toLowerCase()).to.contain('error tallying')
  })
  describe('Initial data burst', () => {
    it('Should create the CylcTree structure using the initial data burst', () => {
      const deltasWithInitialDataBurst = {
        id: WORKFLOW_ID,
        shutdown: false,
        added: {
          workflow: {
            id: WORKFLOW_ID
          },
          cyclePoints: [],
          familyProxies: [],
          taskProxies: []
        }
      }
      applyWorkflowDeltasAdded(deltasWithInitialDataBurst.added, lookup)
      applyTreeDeltasAdded(deltasWithInitialDataBurst.added, workflow, lookup, {})
      expect(workflow.tree.id).to.equal(WORKFLOW_ID)
    })
  })
  describe('Added', () => {
    beforeEach(() => {
      CylcTree.addWorkflow(createWorkflowNode({
        id: WORKFLOW_ID
      }), workflow, {})
    })
    it('Should apply added deltas', () => {
      const cyclePointTokens = WORKFLOW_TOKENS.clone({ cycle: '1' })
      const cyclePointId = cyclePointTokens.id
      const deltas = {
        id: WORKFLOW_ID,
        shutdown: false,
        added: {
          cyclePoints: [
            {
              id: cyclePointId,
              cyclePoint: '1'
            }
          ]
        }
      }
      applyWorkflowDeltasAdded(deltas.added, lookup)
      applyTreeDeltasAdded(deltas.added, workflow, lookup, {})
      expect(workflow.tree.children[0].id).to.equal(cyclePointId)
    })
    it('should collect errors', () => {
      const cyclePointId = WORKFLOW_TOKENS.clone({ cycle: '1' }).id
      const deltas = {
        id: WORKFLOW_ID,
        shutdown: false,
        added: {
          cyclePoints: [
            {
              id: cyclePointId,
              cyclePoint: '1'
            }
          ]
        }
      }
      applyWorkflowDeltasAdded(deltas.added, lookup)
      const stub = sandbox.stub(CylcTree, 'addCyclePoint')
      stub.callsFake(() => {
        throw new Error('test')
      })
      const result = applyTreeDeltasAdded(deltas.added, workflow, lookup, {})
      expect(result.errors.length).to.equal(1)
      expect(result.errors[0][1].message).to.contain('test')
    })
  })
  describe('Updated', () => {
    let workflowNode
    let cyclePoint
    let familyProxy
    beforeEach(() => {
      workflowNode = createWorkflowNode({
        id: WORKFLOW_ID
      })
      CylcTree.addWorkflow(workflowNode, workflow, {})
      cyclePoint = createCyclePointNode({
        id: WORKFLOW_TOKENS.clone({
          cycle: '1',
          task: CylcTree.FAMILY_ROOT
        }).id,
        cyclePoint: '1'
      })
      CylcTree.addCyclePoint(cyclePoint, workflow, {})
      familyProxy = createFamilyProxyNode({
        id: WORKFLOW_TOKENS.clone({
          cycle: cyclePoint.node.name,
          task: 'FAM'
        }).id,
        state: TaskState.RUNNING.name,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: WORKFLOW_TOKENS.clone({
            cycle: cyclePoint.node.name,
            task: CylcTree.FAMILY_ROOT
          }).id,
          name: CylcTree.FAMILY_ROOT
        }
      })
      CylcTree.addFamilyProxy(familyProxy, workflow, {})
    })
    it('should apply updated deltas', () => {
      const deltas = {
        id: WORKFLOW_ID,
        shutdown: false,
        updated: {
          familyProxies: [
            {
              id: familyProxy.id,
              state: TaskState.FAILED.name
            }
          ]
        }
      }
      expectNoErrors(applyWorkflowDeltasUpdated(deltas.updated, lookup))
      expectNoErrors(applyTreeDeltasUpdated(deltas.updated, workflow, lookup, {}))
      expect(workflow.tree.children[0].children[0].node.state).to.equal(TaskState.FAILED.name)
    })
    it('should throw an error if updating an item that is not in the global lookup', () => {
      const deltas = {
        id: WORKFLOW_ID,
        shutdown: false,
        updated: {
          familyProxies: [
            {
              id: familyProxy.id,
              state: TaskState.FAILED.name
            }
          ]
        }
      }
      // applyWorkflowDeltas(deltasUpdated, lookup)
      const result = applyTreeDeltasUpdated(deltas.updated, workflow, lookup, {})
      expect(result.errors.length).to.equal(1)
      expect(result.errors[0][0]).to.contain('not found')
    })
    it('should collect errors', () => {
      const deltas = {
        id: WORKFLOW_ID,
        shutdown: false,
        updated: {
          familyProxies: [
            {
              id: familyProxy.id,
              state: TaskState.FAILED.name
            }
          ]
        }
      }
      lookup[familyProxy.id] = familyProxy
      applyTreeDeltasUpdated(deltas.updated, workflow, lookup, {})
      const stub = sandbox.stub(CylcTree, 'updateFamilyProxy')
      stub.callsFake(() => {
        throw new Error('test')
      })
      const result = applyTreeDeltasUpdated(deltas.updated, workflow, lookup, {})
      expect(result.errors.length).to.equal(1)
      expect(result.errors[0][1].message).to.contain('test')
    })
  })
  describe('Pruned', () => {
    let cyclePoint
    let familyProxy
    beforeEach(() => {
      const workflowNode = createWorkflowNode({
        id: WORKFLOW_ID
      })
      CylcTree.addWorkflow(workflowNode, workflow, {})
      cyclePoint = createCyclePointNode({
        id: WORKFLOW_TOKENS.clone({
          cycle: '1',
          task: CylcTree.FAMILY_ROOT
        }).id,
        cyclePoint: '1'
      })
      CylcTree.addCyclePoint(cyclePoint, workflow, {})
      familyProxy = createFamilyProxyNode({
        id: WORKFLOW_TOKENS.clone({
          cycle: cyclePoint.node.name,
          task: 'FAM'
        }).id,
        state: TaskState.RUNNING.name,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: WORKFLOW_TOKENS.clone({
            cycle: cyclePoint.node.name,
            task: CylcTree.FAMILY_ROOT
          }).id,
          name: CylcTree.FAMILY_ROOT
        }
      })
      CylcTree.addFamilyProxy(familyProxy, workflow, {})
    })
    it('Should apply pruned deltas', () => {
      // cyclepoint 1 has 1 family
      expect(workflow.tree.children[0].children.length).to.equal(1)
      // family is empty, note that root family is never added to the tree
      expect(workflow.tree.children[0].children[0].children.length).to.equal(0)
      const deltasPruningFamily = {
        id: WORKFLOW_ID,
        shutdown: false,
        pruned: {
          familyProxies: [
            familyProxy.id
          ]
        }
      }
      applyWorkflowDeltasPruned(deltasPruningFamily.pruned, lookup)
      applyTreeDeltasPruned(deltasPruningFamily.pruned, workflow, lookup, {})
      // cycle point is now empty
      expect(workflow.tree.children[0].children.length).to.equal(0)

      // when you prune the root family, the cycle point must be removed too
      const deltasPruningCyclePoint = {
        id: WORKFLOW_ID,
        shutdown: false,
        pruned: {
          familyProxies: [
            familyProxy.node.firstParent.id
          ]
        }
      }
      const result = applyTreeDeltasPruned(deltasPruningCyclePoint.pruned, workflow, lookup, {})
      expectNoErrors(result)
      // now the cycle point was removed as well!
      expect(workflow.tree.children.length).to.equal(0)
    })
    it('should collect errors', () => {
      const deltasPruningFamily = {
        id: WORKFLOW_ID,
        shutdown: false,
        pruned: {
          familyProxies: [
            familyProxy.id
          ]
        }
      }
      const stub = sandbox.stub(CylcTree, 'removeFamilyProxy')
      stub.callsFake(() => {
        throw new Error('test')
      })
      const result = applyTreeDeltasPruned(deltasPruningFamily.pruned, workflow, lookup, {})
      expect(result.errors.length).to.equal(1)
      expect(result.errors[0][1].message).to.contain('test')
    })
  })
})
