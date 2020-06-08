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

import CylcTree from '@/components/cylc/tree/tree'
import { expect } from 'chai'
import {
  createCyclePointNode,
  createFamilyProxyNode,
  createTaskProxyNode,
  createWorkflowNode
} from '@/components/cylc/tree'
import sinon from 'sinon'

describe('CylcTree', () => {
  it('Should create a tree with a given workflow', () => {
    const cylcTree = new CylcTree({
      id: 1
    })
    expect(cylcTree.root.id).to.equal(1)
  })
  it('Should create a tree without a workflow', () => {
    const cylcTree = new CylcTree()
    expect(cylcTree.root.id).to.equal('')
  })
  it('Should set a new workflow in the tree', () => {
    const cylcTree = new CylcTree()
    cylcTree.setWorkflow({
      id: 1
    })
    expect(cylcTree.root.id).to.equal(1)
  })
  it('Should fail to set an invalid workflow', () => {
    const cylcTree = new CylcTree()
    expect(cylcTree.setWorkflow).to.throw(Error)
  })
  it('Should clear the tree and lookup map', () => {
    const cylcTree = new CylcTree({
      id: 1
    })
    cylcTree.lookup.set('name', 'abc')
    cylcTree.clear()
    expect(cylcTree.lookup.size).to.equal(0)
    expect(cylcTree.root.id).to.equal('')
  })
  it('Should return true for isEmpty if empty, false otherwise', () => {
    const cylcTree = new CylcTree({
      id: 1
    })
    expect(cylcTree.isEmpty()).to.equal(false)
    cylcTree.clear()
    expect(cylcTree.isEmpty()).to.equal(true)
  })
  // cycle points
  describe('Cycle points', () => {
    let cylcTree
    beforeEach(() => {
      const workflow = createWorkflowNode({
        id: 'cylc|workflow'
      })
      cylcTree = new CylcTree(workflow)
    })
    it('Should add cycle points', () => {
      const cyclePoint1 = createCyclePointNode({
        cyclePoint: '1'
      })
      const cyclePoint2 = createCyclePointNode({
        cyclePoint: '2'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      expect(cylcTree.root.children.length).to.equal(1)
      expect(cylcTree.root.children[0].id).to.equal('1')

      cylcTree.addCyclePoint(cyclePoint2)
      expect(cylcTree.root.children.length).to.equal(2)
      expect(cylcTree.root.children[1].id).to.equal('2')
    })
    it('Should not add invalid cycle points', () => {
      expect(cylcTree.root.children.length).to.equal(0)
      cylcTree.addCyclePoint(null)
      expect(cylcTree.root.children.length).to.equal(0)
    })
    it('Should not add a cycle point twice', () => {
      const cyclePoint1 = createCyclePointNode({
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      cylcTree.addCyclePoint(cyclePoint1)
      expect(cylcTree.root.children.length).to.equal(1)
    })
    it('Should update cycle points', () => {
      const cyclePoint1 = createCyclePointNode({
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      expect(cylcTree.root.children.length).to.equal(1)
      expect(cylcTree.root.children[0].id).to.equal('1')
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      cyclePoint1.children.push({
        id: 10
      })
      cylcTree.updateCyclePoint(cyclePoint1)
      expect(cylcTree.root.children.length).to.equal(1)
      expect(cylcTree.root.children[0].id).to.equal('1')
      expect(cylcTree.root.children[0].children.length).to.equal(1)
    })
    it('Should not update a cycle point if not already in the tree', () => {
      const cyclePoint1 = createCyclePointNode({
        cyclePoint: '1'
      })
      cylcTree.updateCyclePoint(cyclePoint1)
      expect(cylcTree.root.children.length).to.equal(0)
    })
    it('Should not update a cycle point if invalid', () => {
      cylcTree.updateCyclePoint(null)
      expect(cylcTree.root.children.length).to.equal(0)
    })
    it('Should remove cycle points', () => {
      const cyclePoint1 = createCyclePointNode({
        cyclePoint: '1'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      const cyclePoint2 = createCyclePointNode({
        cyclePoint: '2'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      cylcTree.addCyclePoint(cyclePoint2)
      cylcTree.removeCyclePoint(cyclePoint1.id)
      expect(cylcTree.root.children.length).to.equal(1)
    })
    it('Should ignore if the cycle point to remove is not in the tree', () => {
      const cyclePoint1 = createCyclePointNode({
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
        id: 'cylc|workflow'
      })
      cylcTree = new CylcTree(workflow)
      cyclePoint1 = createCyclePointNode({
        cyclePoint: '1'
      })
      cyclePoint2 = createCyclePointNode({
        cyclePoint: '2'
      })
      cylcTree.addCyclePoint(cyclePoint1)
      cylcTree.addCyclePoint(cyclePoint2)
    })
    it('Should add family proxies even without a parent', () => {
      // This is because we may have a family proxy found in a task proxy first parent, or in another
      // family proxy first parent, that is not in the tree yet.
      const familyProxy1 = createFamilyProxyNode({
        id: 'fam1'
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
      const familyProxy1 = createFamilyProxyNode({
        id: 'fam1'
      })
      cylcTree.addFamilyProxy(familyProxy1)
      expect(cylcTree.lookup.get(familyProxy1.id).node.state).to.equal(undefined)
      const familyProxy1Again = createFamilyProxyNode({
        id: 'fam1',
        state: 'waiting'
      })
      cylcTree.addFamilyProxy(familyProxy1Again)
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      expect(cylcTree.root.children[1].children.length).to.equal(0)
      expect(cylcTree.lookup.get(familyProxy1.id).id).to.not.equal(null)
      expect(cylcTree.lookup.get(familyProxy1.id).node.state).to.equal('waiting')
    })
    it('Should add family proxies under the cycle point when first parent is root', () => {
      const familyProxy1 = createFamilyProxyNode({
        id: 'fam1',
        cyclePoint: cyclePoint1.id,
        firstParent: {
          id: 'root',
          name: 'root'
        }
      })
      cylcTree.addFamilyProxy(familyProxy1)
      expect(cylcTree.root.children[0].children[0].id).to.equal('fam1')
    })
    it('Should add family proxies under another family proxy successfully', () => {
      const familyProxy1 = createFamilyProxyNode({
        id: 'fam1',
        cyclePoint: cyclePoint1.id,
        firstParent: {
          id: 'root',
          name: 'root'
        }
      })
      cylcTree.addFamilyProxy(familyProxy1)
      const familyProxy2 = createFamilyProxyNode({
        id: 'fam2',
        firstParent: {
          id: familyProxy1.id
        }
      })
      cylcTree.addFamilyProxy(familyProxy2)
      expect(cylcTree.root.children[0].children[0].id).to.equal('fam1')
      expect(cylcTree.root.children[0].children[0].children[0].id).to.equal('fam2')
    })
    it('Should add family proxies under another family proxy successfully (even if the parent family proxy does not exist in the tree yet!)', () => {
      // We may have a child family proxy, before the parent family proxy is created. In this case, we have to create the
      // parent family proxy, add to the tree, and link parent-child family proxies.
      const familyProxy2 = createFamilyProxyNode({
        id: 'fam2',
        firstParent: {
          id: 'fam1'
        }
      })
      cylcTree.addFamilyProxy(familyProxy2)
      expect(cylcTree.lookup.get('fam1').id).to.equal('fam1')
      expect(cylcTree.lookup.get('fam1').children[0].id).to.equal('fam2')
    })
    it('Should not add invalid family proxies', () => {
      const lookupSize = cylcTree.lookup.size
      cylcTree.addCyclePoint(null)
      // root has its two cycle points
      expect(cylcTree.root.children.length).to.equal(2)
      // the cycle points are child-less
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      // nothing added to the lookup map
      expect(cylcTree.lookup.size).to.equal(lookupSize)
    })
    it('Should not add a family proxy twice to lookup, nor to its parent', () => {
      const familyProxy1 = createFamilyProxyNode({
        id: 'fam1',
        cyclePoint: cyclePoint2.id,
        firstParent: {
          id: 'root',
          name: 'root'
        }
      })
      cylcTree.addFamilyProxy(familyProxy1)
      cylcTree.addFamilyProxy(familyProxy1)
      expect(cylcTree.root.children[1].children.length).to.equal(1)
    })
    it('Should update family proxies', () => {
      const familyProxy1 = createFamilyProxyNode({
        id: 'fam1'
      })
      cylcTree.addFamilyProxy(familyProxy1)
      expect(cylcTree.lookup.get(familyProxy1.id).state).to.equal(undefined)
      familyProxy1.state = 'waiting'
      cylcTree.updateFamilyProxy(familyProxy1)
      expect(cylcTree.lookup.get(familyProxy1.id).state).to.equal('waiting')
    })
    it('Should not update a family proxy if it is not in the tree', () => {
      const familyProxy1 = createFamilyProxyNode({
        id: 'fam1'
      })
      cylcTree.updateFamilyProxy(familyProxy1)
      expect(cylcTree.lookup.get(familyProxy1.id)).to.equal(undefined)
    })
    it('Should not update a family proxy if invalid', () => {
      cylcTree.updateFamilyProxy(null)
      expect(cylcTree.root.children.length).to.equal(2)
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      expect(cylcTree.root.children[1].children.length).to.equal(0)
    })
    it('Should remove family proxies', () => {
      const familyProxy1 = createFamilyProxyNode({
        id: 'cylc|workflow|1|root',
        cyclePoint: cyclePoint2.id,
        firstParent: {
          id: 'root',
          name: 'root'
        }
      })
      cylcTree.addFamilyProxy(familyProxy1)
      expect(cylcTree.root.children.length).to.equal(2)
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      expect(cylcTree.root.children[1].children.length).to.equal(1)
      expect(cylcTree.root.children[1].children[0].children.length).to.equal(0)

      const familyProxy2 = createFamilyProxyNode({
        id: 'fam2',
        firstParent: {
          id: familyProxy1.id,
          name: familyProxy1.id
        }
      })
      cylcTree.addFamilyProxy(familyProxy2)
      expect(cylcTree.root.children.length).to.equal(2)
      expect(cylcTree.root.children[0].children.length).to.equal(0)
      expect(cylcTree.root.children[1].children.length).to.equal(1)
      expect(cylcTree.root.children[1].children[0].children.length).to.equal(1)

      cylcTree.removeFamilyProxy((familyProxy2.id))
      expect(cylcTree.root.children[1].children[0].children.length).to.equal(0)
      cylcTree.removeFamilyProxy(familyProxy1.id)
      // the cycle point was removed as it was empty
      expect(cylcTree.root.children.length).to.equal(1)
    })
  })
  describe('Task Proxies', () => {
    let cylcTree
    let cyclePoint
    let rootFamilyProxy
    let familyProxy
    beforeEach(() => {
      const workflow = createWorkflowNode({
        id: 'cylc|workflow'
      })
      cylcTree = new CylcTree(workflow)
      cyclePoint = createCyclePointNode({
        cyclePoint: 'cylc|workflow|1'
      })
      cylcTree.addCyclePoint(cyclePoint)
      rootFamilyProxy = createFamilyProxyNode({
        id: 'cylc|workflow|1|root',
        name: 'root',
        cyclePoint: cyclePoint.id,
        firstParent: {
          id: cyclePoint.id
        }
      })
      cylcTree.addFamilyProxy(rootFamilyProxy)
      familyProxy = createFamilyProxyNode({
        id: 'cylc|workflow|1|FAM1',
        cyclePoint: cyclePoint.id,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name
        }
      })
      cylcTree.addFamilyProxy(familyProxy)
    })
    it('Should add task proxies', () => {
      const taskProxyId = 'cylc|workflow|1|foo'
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: 'running'
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[1]
      const task = family.children[0]
      expect(task.id).to.equal(taskProxyId)
    })
    it('Should not add task proxies twice', () => {
      const taskProxyId = 'cylc|workflow|1|foo'
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: 'running'
      })
      cylcTree.addTaskProxy(taskProxy)
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[1]
      expect(family.children.length).to.equal(1)
    })
    it('Should not add invalid task proxies', () => {
      cylcTree.addTaskProxy(null)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[0]
      expect(family.children.length).to.equal(0)
    })
    it('Should add task proxies under root family', () => {
      const taskProxyId = 'cylc|workflow|1|foo'
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: rootFamilyProxy.id,
          name: rootFamilyProxy.node.name,
          cyclePoint: cyclePoint.id
        },
        state: 'running'
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const rootFamily = cyclepoint.children[0]
      expect(rootFamily.children.length).to.equal(0)
      // the cycle point now has root [0], FAM family [1], and foo task [2]
      expect(cyclepoint.children.length).to.equal(3)
      const task = cyclepoint.children[2]
      expect(task.id).to.equal(taskProxyId)
      const family = cyclepoint.children[0]
      expect(family.children.length).to.equal(0)
    })
    it('Should add task proxies under a family that is under the root family', () => {
      const taskProxyId = 'cylc|workflow|1|foo'
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: 'running'
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const rootFamily = cyclepoint.children[0]
      expect(rootFamily.children.length).to.equal(0)
      const family = cyclepoint.children[1]
      expect(family.children.length).to.equal(1)
      const task = family.children[0]
      expect(task.id).to.equal(taskProxyId)
    })
    it('Should add task proxies and report if the parent is invalid', () => {
      const taskProxyId = 'cylc|workflow|1|foo'
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: '-1'
        },
        state: 'running'
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
      const taskProxyId = 'cylc|workflow|1|foo'
      const taskProxyState = 'running'
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[1]
      const task = family.children[0]
      expect(task.node.state).to.equal(taskProxyState)
      taskProxy.node.state = 'waiting'
      cylcTree.updateTaskProxy(taskProxy)
      expect(cylcTree.root.children[0].children[1].children[0].node.state).to.equal('waiting')
    })
    it('Should not update an invalid task proxy', () => {
      const taskProxyId = 'cylc|workflow|1|foo'
      const taskProxyState = 'running'
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[1]
      const task = family.children[0]
      expect(task.node.state).to.equal(taskProxyState)
      cylcTree.updateTaskProxy(null)
      expect(cylcTree.root.children[0].children[1].children[0].node.state).to.equal(taskProxyState)
    })
    it('Should not update an task proxy if it is not in the tree', () => {
      const taskProxyId = 'cylc|workflow|1|foo'
      const taskProxyState = 'running'
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[1]
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
      expect(cylcTree.root.children[0].children[1].children[0].node.state).to.equal(taskProxyState)
    })
    it('Should remove task proxies', () => {
      const taskProxyId = 'cylc|workflow|1|foo'
      const taskProxyState = 'running'
      const taskProxy = createTaskProxyNode({
        id: taskProxyId,
        firstParent: {
          id: familyProxy.id
        },
        state: taskProxyState
      })
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const family = cyclepoint.children[1]
      const task = family.children[0]
      expect(task.node.state).to.equal(taskProxyState)
      cylcTree.removeTaskProxy(taskProxy.id)
      expect(cylcTree.root.children[0].children[1].children.length).to.equal(0)
    })
    it('Should remove task proxies if added to the root family', () => {
      const taskProxyId = 'cylc|workflow|1|foo'
      const taskProxyState = 'running'
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
      cylcTree.addTaskProxy(taskProxy)
      const cyclepoint = cylcTree.root.children[0]
      const task = cyclepoint.children[2]
      expect(task.node.state).to.equal(taskProxyState)
      cylcTree.removeTaskProxy(taskProxy.id)
      expect(cylcTree.root.children[0].children[0].children.length).to.equal(0)
      expect(cylcTree.root.children[0].children[0].id).to.equal(rootFamilyProxy.id)
      expect(cylcTree.root.children[0].children[1].children.length).to.equal(0)
      expect(cylcTree.root.children[0].children[1].id).to.equal(familyProxy.id)
    })
    it('Should not remove task proxies if not added to the tree', () => {
      const taskProxyId = 'cylc|workflow|1|foo'
      const taskProxyState = 'running'
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
      expect(cylcTree.root.children[0].children[0].children.length).to.equal(0)
      expect(cylcTree.root.children[0].children[0].id).to.equal(rootFamilyProxy.id)
      expect(cylcTree.root.children[0].children[1].children.length).to.equal(0)
      expect(cylcTree.root.children[0].children[1].id).to.equal(familyProxy.id)
    })
  })
})
