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

import CylcTree, { FAMILY_ROOT } from '@/components/cylc/tree/cylc-tree'
import { expect } from 'chai'
import {
  createCyclePointNode,
  createFamilyProxyNode,
  createJobNode,
  createTaskProxyNode,
  createWorkflowNode
} from '@/components/cylc/tree/tree-nodes'
import sinon from 'sinon'
import TaskState from '@/model/TaskState.model'

/**
 * Tests for the CylcTree class.
 */
describe('CylcTree', () => {
  const WORKFLOW_ID = 'cylc|workflow'
  it('Should create a tree with a given workflow', () => {
    const cylcTree = new CylcTree(createWorkflowNode({
      id: WORKFLOW_ID
    }))
    expect(cylcTree.root.id).to.equal(WORKFLOW_ID)
  })
  it('Should create a tree without a workflow', () => {
    const cylcTree = new CylcTree()
    expect(cylcTree.root.id).to.equal('')
  })
  it('Should set a new workflow in the tree', () => {
    const workflowId = WORKFLOW_ID
    const cylcTree = new CylcTree()
    cylcTree.setWorkflow({
      id: workflowId
    })
    expect(cylcTree.root.id).to.equal(workflowId)
  })
  it('Should fail to set an invalid workflow', () => {
    const cylcTree = new CylcTree()
    expect(cylcTree.setWorkflow).to.throw(Error)
  })
  it('Should clear the tree and lookup map', () => {
    const cylcTree = new CylcTree(createWorkflowNode({
      id: WORKFLOW_ID
    }))
    cylcTree.lookup.set('name', 'abc')
    cylcTree.clear()
    expect(cylcTree.lookup.size).to.equal(0)
    expect(cylcTree.root.id).to.equal('')
  })
  it('Should return true for isEmpty if empty, false otherwise', () => {
    const cylcTree = new CylcTree(createWorkflowNode({
      id: '1'
    }))
    expect(cylcTree.isEmpty()).to.equal(false)
    cylcTree.clear()
    expect(cylcTree.isEmpty()).to.equal(true)
  })
  // cycle points
  describe('Cycle points', () => {
    let cylcTree
    beforeEach(() => {
      const workflow = createWorkflowNode({
        id: WORKFLOW_ID
      })
      cylcTree = new CylcTree(workflow)
    })
    it('Should add cycle points', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      const cyclePoint2 = createCyclePointNode({
        id: `${WORKFLOW_ID}|2|root`,
        cyclePoint: '2'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      expect(cylcTree.root.children.length).to.equal(1)
      expect(cylcTree.root.children[0].id).to.equal(`${WORKFLOW_ID}|1`)

      cylcTree.addCyclePoint(cyclePoint2)
      expect(cylcTree.root.children.length).to.equal(2)
      expect(cylcTree.root.children[0].id).to.equal(`${WORKFLOW_ID}|2`)
      expect(cylcTree.root.children[1].id).to.equal(`${WORKFLOW_ID}|1`)
    })
    it('Should not add a cycle point twice', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      cylcTree.addCyclePoint(cyclePoint1)
      expect(cylcTree.root.children.length).to.equal(1)
    })
    it('Should update cycle points', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      expect(cylcTree.root.children.length).to.equal(1)
      expect(cylcTree.root.children[0].id).to.equal(`${WORKFLOW_ID}|1`)
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      cyclePoint1.children.push({
        id: 10
      })
      cylcTree.updateCyclePoint(cyclePoint1)
      expect(cylcTree.root.children.length).to.equal(1)
      expect(cylcTree.root.children[0].id).to.equal(`${WORKFLOW_ID}|1`)
      expect(cylcTree.root.children[0].children.length).to.equal(1)
    })
    it('Should not update a cycle point if not already in the tree', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      cylcTree.updateCyclePoint(cyclePoint1)
      expect(cylcTree.root.children.length).to.equal(0)
    })
    it('Should remove cycle points', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      const cyclePoint2 = createCyclePointNode({
        id: `${WORKFLOW_ID}|2|root`,
        cyclePoint: '2'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      cylcTree.addCyclePoint(cyclePoint2)
      cylcTree.removeCyclePoint(cyclePoint1.id)
      expect(cylcTree.root.children.length).to.equal(1)
    })
    it('Should remove cycle points', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      const cyclePoint2 = createCyclePointNode({
        id: `${WORKFLOW_ID}|2|root`,
        cyclePoint: '2'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      cylcTree.addCyclePoint(cyclePoint2)
      cylcTree.removeCyclePoint(cyclePoint1.id)
      expect(cylcTree.root.children.length).to.equal(1)
    })
    it('Should ignore if the cycle point to remove is not in the tree', () => {
      const cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      cylcTree.removeCyclePoint(cyclePoint1.id)
      expect(cylcTree.root.children.length).to.equal(0)
    })
  })
  // family proxies
  describe('Family proxies', () => {
    let cylcTree
    let cyclePoint1
    let cyclePoint2
    beforeEach(() => {
      const workflow = createWorkflowNode({
        id: WORKFLOW_ID
      })
      cylcTree = new CylcTree(workflow)
      cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      cyclePoint2 = createCyclePointNode({
        id: `${WORKFLOW_ID}|2|root`,
        cyclePoint: '2'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      cylcTree.addCyclePoint(cyclePoint2)
    })
    it('Should add family proxies even without a parent', () => {
      // This is because we may have a family proxy found in a task proxy first parent, or in another
      // family proxy first parent, that is not in the tree yet.
      const familyProxy1 = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|fam`
      })
      cylcTree.addFamilyProxy(familyProxy1)
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      expect(cylcTree.root.children[1].children.length).to.equal(0)
      expect(cylcTree.lookup.get(familyProxy1.id)).to.not.equal(null)
    })
    it('Should add family proxies even if already in the tree, merging it', () => {
      // This is because we may have a family proxy found in another family proxy first parent,
      // then the next time we add it, it is because we found it in the family proxy part of the
      // graphql response. When that happens, we must actually add-update it, merging with the
      // extra data found in graphql family proxies entry.
      const familyProxyId1 = `${WORKFLOW_ID}|${cyclePoint1.node.name}|fam1`
      const familyProxyId2 = `${WORKFLOW_ID}|${cyclePoint1.node.name}|fam2`
      const familyProxy1 = createFamilyProxyNode({
        id: familyProxyId1,
        firstParent: {
          id: familyProxyId2
        }
      })
      cylcTree.addFamilyProxy(familyProxy1)
      expect(cylcTree.lookup.get(familyProxyId2).id).to.not.equal(null)
      expect(cylcTree.lookup.get(familyProxy1.id).node.state).to.equal('')
      const familyProxy1Again = createFamilyProxyNode({
        id: familyProxyId1,
        state: TaskState.WAITING.name
      })
      cylcTree.addFamilyProxy(familyProxy1Again)
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      expect(cylcTree.root.children[1].children.length).to.equal(0)
      expect(cylcTree.lookup.get(familyProxy1.id).id).to.not.equal(null)
      expect(cylcTree.lookup.get(familyProxy1.id).node.state).to.equal(TaskState.WAITING.name)
    })
    it('Should add family proxies under the cycle point when first parent is root', () => {
      const familyProxyId1 = `${WORKFLOW_ID}|${cyclePoint1.node.name}|fam1`
      const familyProxy1 = createFamilyProxyNode({
        id: familyProxyId1,
        cyclePoint: cyclePoint1.node.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|${FAMILY_ROOT}`,
          name: FAMILY_ROOT
        }
      })
      cylcTree.addFamilyProxy(familyProxy1)
      expect(cylcTree.root.children[1].children[0].id).to.equal(familyProxyId1)
    })
    it('Should add family proxies under another family proxy successfully', () => {
      const familyProxyId1 = `${WORKFLOW_ID}|${cyclePoint1.node.name}|fam1`
      const familyProxyId2 = `${WORKFLOW_ID}|${cyclePoint1.node.name}|fam2`
      const familyProxy1 = createFamilyProxyNode({
        id: familyProxyId1,
        cyclePoint: cyclePoint1.node.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|${FAMILY_ROOT}`,
          name: FAMILY_ROOT
        }
      })
      cylcTree.addFamilyProxy(familyProxy1)
      const familyProxy2 = createFamilyProxyNode({
        id: familyProxyId2,
        firstParent: {
          id: familyProxy1.id
        }
      })
      cylcTree.addFamilyProxy(familyProxy2)
      expect(cylcTree.root.children[1].children[0].id).to.equal(familyProxyId1)
      expect(cylcTree.root.children[1].children[0].children[0].id).to.equal(familyProxyId2)
    })
    it('Should add family proxies under another family proxy successfully (even if the parent family proxy does not exist in the tree yet!)', () => {
      // We may have a child family proxy, before the parent family proxy is created. In this case, we have to create the
      // parent family proxy, add to the tree, and link parent-child family proxies.
      const familyProxyId1 = `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam1`
      const familyProxyId2 = `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam1`
      const familyProxy2 = createFamilyProxyNode({
        id: familyProxyId2,
        firstParent: {
          id: familyProxyId1
        }
      })
      cylcTree.addFamilyProxy(familyProxy2)
      expect(cylcTree.lookup.get(familyProxyId1).id).to.equal(familyProxyId1)
      expect(cylcTree.lookup.get(familyProxyId1).children[0].id).to.equal(familyProxyId2)
    })
    it('Should not add a family proxy twice to lookup, nor to its parent', () => {
      const familyProxy1 = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam1`,
        cyclePoint: cyclePoint2.node.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|${FAMILY_ROOT}`,
          name: FAMILY_ROOT
        }
      })
      cylcTree.addFamilyProxy(familyProxy1)
      cylcTree.addFamilyProxy(familyProxy1)
      console.log(cyclePoint2.id)
      console.log(cylcTree.root.children[0])
      expect(cylcTree.root.children[0].children.length).to.equal(1)
    })
    it('Should update family proxies', () => {
      const familyProxy1 = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam1`
      })
      cylcTree.addFamilyProxy(familyProxy1)
      expect(cylcTree.lookup.get(familyProxy1.id).state).to.equal(undefined)
      familyProxy1.state = TaskState.WAITING.name
      cylcTree.updateFamilyProxy(familyProxy1)
      expect(cylcTree.lookup.get(familyProxy1.id).state).to.equal(TaskState.WAITING.name)
    })
    it('Should not update a family proxy if it is not in the tree', () => {
      const familyProxy1 = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam1`
      })
      cylcTree.updateFamilyProxy(familyProxy1)
      expect(cylcTree.lookup.get(familyProxy1.id)).to.equal(undefined)
    })
    it('Should remove family proxies', () => {
      const rootFamilyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|${FAMILY_ROOT}`,
        name: FAMILY_ROOT,
        cyclePoint: cyclePoint2.id,
        firstParent: {
          id: cyclePoint2.id
        }
      })
      cylcTree.addFamilyProxy(rootFamilyProxy)
      expect(cylcTree.root.children.length).to.equal(2)
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      expect(cylcTree.root.children[1].children.length).to.equal(0)

      const childFamilyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam2`,
        cyclePoint: cyclePoint2.id,
        firstParent: {
          id: rootFamilyProxy.id,
          name: FAMILY_ROOT
        }
      })
      cylcTree.addFamilyProxy(childFamilyProxy)
      expect(cylcTree.root.children.length).to.equal(2)
      expect(cylcTree.root.children[0].children.length).to.equal(1)
      expect(cylcTree.root.children[1].children.length).to.equal(0)
      expect(cylcTree.root.children[0].children[0].children.length).to.equal(0)

      const grandChildFamilyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|fam3`,
        cyclePoint: cyclePoint2.id,
        firstParent: {
          id: childFamilyProxy.id
        }
      })
      cylcTree.addFamilyProxy(grandChildFamilyProxy)
      expect(cylcTree.root.children.length).to.equal(2)
      expect(cylcTree.root.children[0].children.length).to.equal(1)
      expect(cylcTree.root.children[1].children.length).to.equal(0)
      expect(cylcTree.root.children[0].children[0].children.length).to.equal(1)
      expect(cylcTree.root.children[0].children[0].children[0].children.length).to.equal(0)

      cylcTree.removeFamilyProxy((grandChildFamilyProxy.id))
      expect(cylcTree.root.children[0].children[0].children.length).to.equal(0)
      cylcTree.removeFamilyProxy((childFamilyProxy.id))
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      cylcTree.removeFamilyProxy(rootFamilyProxy.id)
      // the cycle point 2 was removed as its root family was removed (i.e. now the cycle point must be empty!)
      expect(cylcTree.root.children.length).to.equal(1)
    })
  })
  // task proxies
  describe('Task Proxies', () => {
    let cylcTree
    let cyclePoint
    let rootFamilyProxy
    let familyProxy
    beforeEach(() => {
      const workflow = createWorkflowNode({
        id: WORKFLOW_ID
      })
      cylcTree = new CylcTree(workflow)
      cyclePoint = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint)
      rootFamilyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}|${FAMILY_ROOT}`,
        name: FAMILY_ROOT,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: cyclePoint.id
        }
      })
      cylcTree.addFamilyProxy(rootFamilyProxy)
      familyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}|FAM1`,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name
        }
      })
      cylcTree.addFamilyProxy(familyProxy)
    })
    it('Should add task proxies', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: TaskState.RUNNING.name
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      expect(task.id).to.equal(taskProxyId)
    })
    it('Should not add task proxies twice', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: TaskState.RUNNING.name
      })
      cylcTree.addTaskProxy(taskProxy)
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      expect(family.children.length).to.equal(1)
    })
    it('Should add task proxies under root family', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.node.name}|foo`
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name
        },
        cyclePoint: cyclePoint.node.name,
        state: TaskState.RUNNING.name
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const rootFamily = cyclepoint.children[0]
      expect(rootFamily.children.length).to.equal(0)
      // NOTE: the root family is not added, so we have the family and the task here, as the
      // task's parent was the root family.
      expect(cyclepoint.children.length).to.equal(2)
      const family = cyclepoint.children[0]
      expect(family.children.length).to.equal(0)
      const task = cyclepoint.children[1]
      expect(task.id).to.equal(taskProxyId)
    })
    it('Should add task proxies under a family that is under the root family', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: TaskState.RUNNING.name
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      expect(family.children.length).to.equal(1)
      const task = family.children[0]
      expect(task.id).to.equal(taskProxyId)
    })
    it('Should add task proxies and report if the parent is invalid', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: '-1'
        },
        state: TaskState.RUNNING.name
      })
      const sandbox = sinon.createSandbox()
      sandbox.stub(console, 'error')
      cylcTree.addTaskProxy(taskProxy)
      expect(console.error.calledOnce).to.equal(true)
      const task = cylcTree.lookup.get(taskProxyId)
      expect(task.id).to.equal(taskProxyId)
      sandbox.restore()
    })
    it('Should update task proxies', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxyState = TaskState.RUNNING.name
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      expect(task.node.state).to.equal(taskProxyState)
      taskProxy.node.state = TaskState.WAITING.name
      cylcTree.updateTaskProxy(taskProxy)
      expect(cylcTree.root.children[0].children[0].children[0].node.state).to.equal(TaskState.WAITING.name)
    })
    it('Should not change the state of an existing task proxy when updating it', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxyState = TaskState.RUNNING.name
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      cylcTree.addTaskProxy(taskProxy)
      expect(cylcTree.root.children[0].children[0].children[0].node.state).to.equal(TaskState.RUNNING.name)

      // state="running", now a delta without state should NOT change the existing state
      const updateTaskProxy = createTaskProxyNode({
        id: taskProxyId
      })
      cylcTree.updateTaskProxy(updateTaskProxy)
      expect(cylcTree.root.children[0].children[0].children[0].node.state).to.equal(TaskState.RUNNING.name)
    })
    it('Should not update an task proxy if it is not in the tree', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxyState = TaskState.RUNNING.name
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      expect(task.node.state).to.equal(taskProxyState)
      const orphanTaskProxy = createTaskProxyNode({
        id: 'NA',
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      cylcTree.updateTaskProxy(orphanTaskProxy)
      expect(cylcTree.root.children[0].children[0].children[0].node.state).to.equal(taskProxyState)
    })
    it('Should remove task proxies', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxyState = TaskState.RUNNING.name
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      expect(task.node.state).to.equal(taskProxyState)
      cylcTree.removeTaskProxy(taskProxy.id)
      expect(cylcTree.root.children[0].children[0].children.length).to.equal(0)
    })
    it('Should remove task proxies if added to the root family', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.node.name}|foo`
      const taskProxyState = TaskState.RUNNING.name
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name
        },
        cyclePoint: cyclePoint.id,
        state: taskProxyState
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      // NOTE: 0 is the fam family, 1 is the task proxy that was added to the
      // cycle point because its parent is the root family
      const task = cyclepoint.children[1]
      expect(task.node.state).to.equal(taskProxyState)
      cylcTree.removeTaskProxy(taskProxy.id)
      expect(cylcTree.root.children[0].children.length).to.equal(1)
      expect(cylcTree.root.children[0].children[0].children.length).to.equal(0)
      expect(cylcTree.root.children[0].children[0].id).to.equal(familyProxy.id)
    })
    it('Should not remove task proxies if not added to the tree', () => {
      const taskProxyId = `${WORKFLOW_ID}|${cyclePoint.id}|foo`
      const taskProxyState = TaskState.RUNNING.name
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name,
          cyclePoint: cyclePoint.id
        },
        cyclePoint: cyclePoint.id,
        state: taskProxyState
      })
      cylcTree.removeTaskProxy(taskProxy.id)
      expect(cylcTree.root.children[0].children.length).to.equal(1)
      expect(cylcTree.root.children[0].children[0].children.length).to.equal(0)
      expect(cylcTree.root.children[0].children[0].id).to.equal(familyProxy.id)
    })
  })
  // jobs
  describe('Jobs', () => {
    let cylcTree
    let cyclePoint
    let rootFamilyProxy
    let familyProxy
    let taskProxy
    beforeEach(() => {
      const workflow = createWorkflowNode({
        id: WORKFLOW_ID
      })
      cylcTree = new CylcTree(workflow)
      cyclePoint = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint)
      rootFamilyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}|${FAMILY_ROOT}`,
        name: FAMILY_ROOT,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: cyclePoint.id
        }
      })
      cylcTree.addFamilyProxy(rootFamilyProxy)
      familyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}|FAM1`,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name
        }
      })
      cylcTree.addFamilyProxy(familyProxy)
      taskProxy = createTaskProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}|foo`,
        firstParent: {
          id: familyProxy.id
        },
        task: {
          meanElapsedTime: 3.0
        },
        state: TaskState.RUNNING.name
      })
      cylcTree.addTaskProxy(taskProxy)
    })
    it('Should add jobs', () => {
      expect(taskProxy.node.progress).to.equal(0)
      const jobId = `${taskProxy.id}|1`
      const fmt = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' })
      const startedDate = new Date()
      const startedTime = fmt.format(startedDate)
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.FAILED.name,
        startedTime
      })
      const sandbox = sinon.createSandbox()
      sandbox.stub(Date, 'now').returns(startedDate.getTime() + 15000)
      cylcTree.addJob(job)
      sandbox.restore()
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
      // should have updated the parent progress now
      expect(taskProxy.node.progress).to.be.greaterThan(0)
    })
    it('Should not add jobs twice', () => {
      const jobId = `${taskProxy.id}|1`
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.RUNNING.name
      })
      cylcTree.addJob(job)
      cylcTree.addJob(job)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
      expect(task.children.length).to.equal(1)
    })
    it('Should update jobs', () => {
      const jobId = `${taskProxy.id}|1`
      const state = TaskState.RUNNING.name
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: state
      })
      cylcTree.addJob(job)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.node.state).to.equal(state)
      job.node.state = TaskState.WAITING.name
      cylcTree.updateJob(job)
      expect(task.children[0].node.state).equal(TaskState.WAITING.name)
    })
    it('Should not update a job if it is not in the tree', () => {
      const jobId = `${taskProxy.id}|1`
      const state = TaskState.RUNNING.name
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: state
      })
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      expect(task.children.length).equal(0)
      cylcTree.updateJob(job)
      expect(task.children.length).equal(0)
    })
    it('Should remove jobs', () => {
      const jobId = `${taskProxy.id}|1`
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.RUNNING.name
      })
      cylcTree.addJob(job)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
      cylcTree.removeJob(job.id)
      expect(cylcTree.root.children[0].children[0].children[0].children.length).to.equal(0)
    })
    it('Should not remove invalid jobs', () => {
      const jobId = `${taskProxy.id}|1`
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.RUNNING.name
      })
      cylcTree.addJob(job)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
      cylcTree.removeJob(null)
      expect(cylcTree.root.children[0].children[0].children[0].children.length).to.equal(1)
    })
    it('Should not remove if job is not in the tree', () => {
      const jobId = `${taskProxy.id}|1`
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.RUNNING.name
      })
      cylcTree.addJob(job)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
      cylcTree.removeJob('-1')
      expect(cylcTree.root.children[0].children[0].children[0].children.length).to.equal(1)
    })
    it('Should set progress as zero even if there is no meanElapsedTime (and not NaN)', () => {
      expect(taskProxy.node.progress).to.equal(0)
      // a TaskProxy may not have a meanElapsedTime until it has had previous executions to calculate it
      delete taskProxy.node.task.meanElapsedTime
      const jobId = `${taskProxy.id}|1`
      const fmt = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' })
      const startedDate = new Date()
      const startedTime = fmt.format(startedDate)
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.FAILED.name,
        startedTime
      })
      const sandbox = sinon.createSandbox()
      sandbox.stub(Date, 'now').returns(startedDate.getTime() + 15000)
      cylcTree.addJob(job)
      sandbox.restore()
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
      // the calculation will have failed since there is no meanElapsedTime, so the progress remains at 0
      expect(taskProxy.node.progress).to.equal(0)
    })
  })
  describe('Recursive delete nodes', () => {
    let cylcTree
    let cyclePoint
    let rootFamilyProxy
    let familyProxy
    let taskProxy
    beforeEach(() => {
      const workflow = createWorkflowNode({
        id: WORKFLOW_ID
      })
      cylcTree = new CylcTree(workflow)
      cyclePoint = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint)
      rootFamilyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.id}|${FAMILY_ROOT}`,
        name: FAMILY_ROOT,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: cyclePoint.id
        }
      })
      cylcTree.addFamilyProxy(rootFamilyProxy)
      familyProxy = createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}||FAM1`,
        cyclePoint: cyclePoint.node.name,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name
        }
      })
      cylcTree.addFamilyProxy(familyProxy)
      taskProxy = createTaskProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint.node.name}|foo`,
        firstParent: {
          id: familyProxy.id
        },
        state: TaskState.RUNNING.name
      })
      cylcTree.addTaskProxy(taskProxy)
    })
    it('Should recursively delete children nodes', () => {
      const jobId = `${taskProxy.id}|1`
      const job = createJobNode({
        id: jobId,
        firstParent: {
          id: taskProxy.id
        },
        state: TaskState.RUNNING.name
      })
      cylcTree.addJob(job)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      const task = family.children[0]
      const createdJob = task.children[0]
      expect(createdJob.id).to.equal(jobId)
      cylcTree.removeCyclePoint(cyclePoint.id)
      expect(cylcTree.root.children.length).to.equal(0)
    })
  })
  describe('Tally cycle point states', () => {
    // NOTE: we are using two cycle points with two families each for now, but we can
    // add more later. In this case, we are also using RUNNING and WAITING,
    // as these two influence the state based on whether the isStopped is true or
    // false, i.e. in one case RUNNING will come first, in the other WAITING.
    let cylcTree
    let cyclePoint1
    let cyclePoint2
    beforeEach(() => {
      const workflow = createWorkflowNode({
        id: WORKFLOW_ID
      })
      cylcTree = new CylcTree(workflow)
      cyclePoint1 = createCyclePointNode({
        id: `${WORKFLOW_ID}|1|root`,
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      cylcTree.addFamilyProxy(createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|FAM1`,
        name: 'FAM1',
        state: TaskState.RUNNING.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|${FAMILY_ROOT}`,
          name: FAMILY_ROOT
        },
        cyclePoint: cyclePoint1.id
      }))
      cylcTree.addFamilyProxy(createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|FAM2`,
        name: 'FAM2',
        state: TaskState.WAITING.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint1.node.name}|${FAMILY_ROOT}`,
          name: FAMILY_ROOT
        },
        cyclePoint: cyclePoint1.id
      }))
      cyclePoint2 = createCyclePointNode({
        id: `${WORKFLOW_ID}|2|root`,
        cyclePoint: '2'
      })
      cylcTree.addCyclePoint(cyclePoint2)
      cylcTree.addFamilyProxy(createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|FAM1`,
        name: 'FAM1',
        state: TaskState.WAITING.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|${FAMILY_ROOT}`,
          name: FAMILY_ROOT
        },
        cyclePoint: cyclePoint2.id
      }))
      cylcTree.addFamilyProxy(createFamilyProxyNode({
        id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|FAM2`,
        name: 'FAM2',
        state: TaskState.RUNNING.name,
        firstParent: {
          id: `${WORKFLOW_ID}|${cyclePoint2.node.name}|${FAMILY_ROOT}`,
          name: FAMILY_ROOT
        },
        cyclePoint: cyclePoint2.id
      }))
    })
    it('Should tally the cycle point states if stopped', () => {
      expect(cylcTree.root.children.length).to.equal(2)
      expect(cylcTree.root.children[0].state).to.equal(undefined)
      expect(cylcTree.root.children[1].state).to.equal(undefined)
      cylcTree.tallyCyclePointStates()
      expect(cylcTree.root.children[0].node.state).to.equal(TaskState.RUNNING.name)
      expect(cylcTree.root.children[1].node.state).to.equal(TaskState.RUNNING.name)
    })
  })
})
