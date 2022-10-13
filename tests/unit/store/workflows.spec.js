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
import Vue from 'vue'
import Vuex from 'vuex'
import storeOptions from '@/store/options'
// import { Tokens } from '@/utils/uid'

Vue.use(Vuex)

/**
 * Tests for the store/workflows module.
 */
describe('workflows', () => {
  const store = new Vuex.Store(storeOptions)
  if (!global.localStorage) {
    global.localStorage = {}
  }
  const resetState = () => {
    store.state.workflows.lookup = {}
    store.state.workflows.workflow = {
      tree: {},
      lookup: {}
    }
    store.state.workflows.workflows = []
    store.state.workflows.workflowName = null
  }
  beforeEach(resetState)
  afterEach(resetState)
  describe('State', () => {
    it('should start with empty lookup, empty workflow, no workflows, and no workflow name', () => {
      expect(Object.keys(store.state.workflows.lookup).length).to.deep.equal(0)
      expect(store.state.workflows.workflow).to.deep.equal({ tree: {}, lookup: {} })
      expect(store.state.workflows.workflows.length).to.equal(0)
      expect(store.state.workflows.workflowName).to.equal(null)
    })
  })
  describe('Getters', () => {
    it('should get the current workflow', () => {
      expect(store.getters['workflows/currentWorkflow']).to.equal(null)
      const workflows = {
        '~cylc/cylc': {
          id: '~cylc/cylc',
          name: 'cylc'
        }
      }
      store.commit('workflows/SET_WORKFLOWS', workflows)
      store.commit('workflows/SET_WORKFLOW_NAME', workflows['~cylc/cylc'].name)
      expect(store.getters['workflows/currentWorkflow']).to.deep.equal(workflows['~cylc/cylc'])
    })
  })
  describe('Mutations', () => {
    it('should set workflows', () => {
      const workflows = {
        '~cylc/cylc': {
          id: '~cylc/cylc',
          name: 'cylc'
        }
      }
      store.commit('workflows/SET_WORKFLOWS', workflows)
      expect(store.state.workflows.workflows).to.deep.equal(workflows)
    })
    it('should set workflow name', () => {
      const workflowName = 'cylc'
      store.commit('workflows/SET_WORKFLOW_NAME', workflowName)
      expect(store.state.workflows.workflowName).to.equal(workflowName)
    })
    it('should set workflow', () => {
      const workflow = {
        tree: {
          test: 1
        },
        lookup: {
          test: 1
        }
      }
      store.commit('workflows/SET_WORKFLOW', workflow)
      expect(store.state.workflows.workflow).to.deep.equal(workflow)
    })
    it('should set lookup', () => {
      const lookup = {
        test: 1
      }
      store.commit('workflows/SET_LOOKUP', lookup)
      expect(store.state.workflows.lookup).to.deep.equal(lookup)
    })
    it('should clear workflow', () => {
      const workflow = {
        tree: {
          test: 1
        },
        lookup: {
          test: 1
        }
      }
      store.commit('workflows/SET_WORKFLOW', workflow)
      expect(store.state.workflows.workflow).to.deep.equal(workflow)
      store.commit('workflows/CLEAR_WORKFLOW', workflow)
      expect(store.state.workflows.workflow).to.not.deep.equal(workflow)
    })
  })
})

// new stuff

describe.only('cylc tree', () => {
  const store = new Vuex.Store(storeOptions)
  if (!global.localStorage) {
    global.localStorage = {}
  }
  const resetState = () => {
    store.state.workflows.cylcTree = undefined
  }
  beforeEach(resetState)
  afterEach(resetState)
  function getTree () {
    return store.getters['workflows/getTree']
  }
  function getNode (id) {
    return store.state.workflows.cylcTree.$index[id]
  }
  function getIndex () {
    return Object.keys(store.state.workflows.cylcTree.$index).sort()
  }

  it('initiates and clears', () => {
    // CREATE should initialise the store
    store.commit('workflows/CREATE')
    const tree = store.state.workflows.cylcTree
    expect(tree.children).to.deep.equal([])
    expect(Object.keys(tree.$index)).to.deep.equal([])
    expect(getTree()).to.deep.equal({})

    // add a job to the store
    store.commit('workflows/UPDATE', { id: '~a/b//c/d/e' })
    expect(getTree()).to.deep.equal({
      a: {
        b: {
          c: {
            d: {
              e: {}
            }
          }
        }
      }
    })

    // CLEAR should wipe the store
    store.commit('workflows/CLEAR')
    expect(tree.children).to.deep.equal([]) // children removed at top level
    expect(Object.keys(tree.$index)).to.deep.equal([]) // tree empty
    expect(getTree()).to.deep.equal({}) // index empty
  })

  it('adds', () => {
    // new nodes should be added to the correct place in the tree
    store.commit('workflows/CREATE')

    // add a job
    store.commit('workflows/UPDATE', { id: '~a/b//c/d/e' })
    expect(getTree()).to.deep.equal({
      a: {
        b: {
          c: {
            d: {
              e: {}
            }
          }
        }
      }
    })
    expect(getIndex()).to.deep.equal([
      '~a',
      '~a/b',
      '~a/b//c',
      '~a/b//c/d',
      '~a/b//c/d/e'
    ])

    // add another job for the same task
    store.commit('workflows/UPDATE', { id: '~a/b//c/d/f' })
    expect(getTree()).to.deep.equal({
      a: {
        b: {
          c: {
            d: {
              e: {},
              f: {}
            }
          }
        }
      }
    })
    expect(getIndex()).to.deep.equal([
      '~a',
      '~a/b',
      '~a/b//c',
      '~a/b//c/d',
      '~a/b//c/d/e',
      '~a/b//c/d/f'
    ])

    // add another cycle for the same workflow
    store.commit('workflows/UPDATE', { id: '~a/b//g' })
    expect(getTree()).to.deep.equal({
      a: {
        b: {
          c: {
            d: {
              e: {},
              f: {}
            }
          },
          g: {}
        }
      }
    })
    expect(getIndex()).to.deep.equal([
      '~a',
      '~a/b',
      '~a/b//c',
      '~a/b//c/d',
      '~a/b//c/d/e',
      '~a/b//c/d/f',
      '~a/b//g'
    ])
  })

  it('removes', () => {
    // it should remove nodes and housekeep the tree via the REMOVE interface
    store.commit('workflows/CREATE')

    // add some nodes to the tree
    function addNodes () {
      store.commit('workflows/UPDATE', { id: '~a/b//c/d/e' })
      store.commit('workflows/UPDATE', { id: '~a/b//c/d/f' })
      store.commit('workflows/UPDATE', { id: '~a/b//g' })
      expect(getTree()).to.deep.equal({
        a: {
          b: {
            c: {
              d: {
                e: {},
                f: {}
              }
            },
            g: {}
          }
        }
      })
      expect(getIndex()).to.deep.equal([
        '~a',
        '~a/b',
        '~a/b//c',
        '~a/b//c/d',
        '~a/b//c/d/e',
        '~a/b//c/d/f',
        '~a/b//g'
      ])
    }

    // remove a user from the tree
    addNodes()
    store.commit('workflows/REMOVE', '~a')
    expect(getTree()).to.deep.equal({})
    expect(getIndex()).to.deep.equal([])

    // remove a workflow from the tree
    addNodes()
    store.commit('workflows/REMOVE', '~a/b')
    expect(getTree()).to.deep.equal({})
    expect(getIndex()).to.deep.equal([])

    // remove a cycle from the tree
    addNodes()
    store.commit('workflows/REMOVE', '~a/b//c')
    expect(getTree()).to.deep.equal({
      a: {
        b: {
          g: {}
        }
      }
    })
    expect(getIndex()).to.deep.equal([
      '~a',
      '~a/b',
      '~a/b//g'
    ])

    // remove a task from the tree
    addNodes()
    store.commit('workflows/REMOVE', '~a/b//c/d')
    expect(getTree()).to.deep.equal({
      a: {
        b: {
          g: {}
        }
      }
    })
    expect(getIndex()).to.deep.equal([
      '~a',
      '~a/b',
      '~a/b//g'
    ])

    // remove a job from the tree
    addNodes()
    store.commit('workflows/REMOVE', '~a/b//c/d/e')
    expect(getTree()).to.deep.equal({
      a: {
        b: {
          c: {
            d: {
              f: {}
            }
          },
          g: {}
        }
      }
    })
    expect(getIndex()).to.deep.equal([
      '~a',
      '~a/b',
      '~a/b//c',
      '~a/b//c/d',
      '~a/b//c/d/f',
      '~a/b//g'
    ])
  })

  it('updates', () => {
    // existing nodes can be updated when new data becomes available
    // adding/updating is performed via the same UPDATE interface
    store.commit('workflows/CREATE')

    // add a node
    store.commit(
      'workflows/UPDATE',
      {
        id: '~a',
        foo: 1,
        bar: 2
      }
    )
    expect(getNode('~a').node).to.deep.equal({
      id: '~a',
      foo: 1,
      bar: 2
    })

    // update a node
    store.commit(
      'workflows/UPDATE',
      {
        id: '~a',
        bar: 3, // update
        baz: 4 // add
      }
    )
    expect(getNode('~a').node).to.deep.equal({
      id: '~a',
      foo: 1, // old (not updated)
      bar: 3, // new (updated)
      baz: 4 // new (added)
    })
  })

  it('whatever', () => {
    store.commit('workflows/CREATE')

    store.commit('workflows/UPDATE', { id: '~a/b//c/d/e', a: 1 })
    store.commit('workflows/UPDATE', { id: '~a/b//c/d/e', a: 2 })
    store.commit('workflows/UPDATE', { id: '~a/b//c/d/e', a: 2 })

    const _tree = store.state.workflows.cylcTree
    expect(_tree.id).to.equal('$root')
    expect(_tree.type).to.equal(undefined)
    expect(_tree.children.length).to.equal(1)

    const user = _tree.children[0]
    expect(user.id).to.equal('~a')
    expect(user.type).to.equal('user')
    expect(user.children.length).to.equal(1)

    const workflow = user.children[0]
    expect(workflow.id).to.equal('~a/b')
    expect(workflow.type).to.equal('workflow')
    expect(workflow.children.length).to.equal(1)

    const cycle = workflow.children[0]
    expect(cycle.id).to.equal('~a/b//c')
    expect(cycle.type).to.equal('cycle')
    expect(cycle.children.length).to.equal(1)

    const task = cycle.children[0]
    expect(task.id).to.equal('~a/b//c/d')
    expect(task.type).to.equal('task')
    expect(task.children.length).to.equal(1)
  })

  it('indexes', () => {
    // most of the data we store fits into the the Cylc hierarchy
    //   ~user/workflow//cycle[/FAMILY...]/task/job
    // but some things don't e.g. edges and namespaces (aka task/fam definitions)
    // for these things we maintain addition indexes at the workflow level
    store.commit('workflows/CREATE')

    // add a workflow
    store.commit('workflows/UPDATE', { id: '~a/b' })
    // add a task definition for a task called "foo"
    store.commit('workflows/UPDATE', { id: '~a/b//$namespace|foo' })
    // add an edge for 1/foo => 2/foo
    store.commit('workflows/UPDATE', { id: '~a/b//$edge|1/foo|2/foo' })

    const _tree = store.state.workflows.cylcTree
    const user = _tree.children[0]
    const workflow = user.children[0]

    // the special nodes should appear in the global index
    expect(_tree.$index['~a/b//$namespace|foo'].id).to.equal(
      '~a/b//$namespace|foo'
    )
    expect(_tree.$index['~a/b//$edge|1/foo|2/foo'].id).to.equal(
      '~a/b//$edge|1/foo|2/foo'
    )

    // they should also appear in the workflow's special indexes
    expect(workflow.$namespaces.length).to.equal(1)
    expect(workflow.$namespaces[0].id).to.equal('~a/b//$namespace|foo')
    expect(workflow.$edges.length).to.equal(1)
    expect(workflow.$edges[0].id).to.equal('~a/b//$edge|1/foo|2/foo')

    // these indexes should be updated when they are removed
    store.commit('workflows/REMOVE', '~a/b//$namespace|foo')
    store.commit('workflows/REMOVE', '~a/b//$edge|1/foo|2/foo')
    expect(workflow.$namespaces.length).to.equal(0)
    expect(workflow.$edges.length).to.equal(0)
  })

  it('sorts', () => {
    // new nodes should be added to the tree in sort order
    // (note the $index is not sorted)
    store.commit('workflows/CREATE')

    // insert users
    store.commit('workflows/UPDATE', { id: '~b' })
    store.commit('workflows/UPDATE', { id: '~a' })
    store.commit('workflows/UPDATE', { id: '~c' })
    const _tree = store.state.workflows.cylcTree
    expect(_tree.children.map(n => n.id)).to.deep.equal([
      '~a',
      '~b',
      '~c'
    ])

    // insert workflows
    store.commit('workflows/UPDATE', { id: '~a/a1x' })
    store.commit('workflows/UPDATE', { id: '~a/a5x' })
    store.commit('workflows/UPDATE', { id: '~a/a10x' })
    const user = _tree.children[0]
    expect(user.children.map(n => n.id)).to.deep.equal([
      '~a/a1x',
      '~a/a5x',
      '~a/a10x'
    ])

    // insert cycles
    store.commit('workflows/UPDATE', { id: '~a/a1x//10T0' })
    store.commit('workflows/UPDATE', { id: '~a/a1x//5T0' })
    store.commit('workflows/UPDATE', { id: '~a/a1x//20T0' })
    const workflow = user.children[0]
    expect(workflow.children.map(n => n.id)).to.deep.equal([
      '~a/a1x//5T0',
      '~a/a1x//10T0',
      '~a/a1x//20T0'
    ])

    // insert tasks
    store.commit('workflows/UPDATE', { id: '~a/a1x//5T0/f1d' })
    store.commit('workflows/UPDATE', { id: '~a/a1x//5T0/f10d' })
    store.commit('workflows/UPDATE', { id: '~a/a1x//5T0/f5d' })
    const cycle = workflow.children[0]
    expect(cycle.children.map(n => n.id)).to.deep.equal([
      '~a/a1x//5T0/f1d',
      '~a/a1x//5T0/f5d',
      '~a/a1x//5T0/f10d'
    ])

    // insert jobs
    store.commit('workflows/UPDATE', { id: '~a/a1x//5T0/f1d/01' })
    store.commit('workflows/UPDATE', { id: '~a/a1x//5T0/f1d/03' })
    store.commit('workflows/UPDATE', { id: '~a/a1x//5T0/f1d/02' })
    const task = cycle.children[0]
    expect(task.children.map(n => n.id)).to.deep.equal([
      '~a/a1x//5T0/f1d/01',
      '~a/a1x//5T0/f1d/02',
      '~a/a1x//5T0/f1d/03'
    ])

    // insert edges
    // ($edges should be sorted)
    store.commit('workflows/UPDATE', { id: '~a/a1x//$edge|1/c|2/c' })
    store.commit('workflows/UPDATE', { id: '~a/a1x//$edge|1/a|2/a' })
    store.commit('workflows/UPDATE', { id: '~a/a1x//$edge|1/b|2/b' })
    expect(workflow.$edges.map(n => n.id)).to.deep.equal([
      '~a/a1x//$edge|1/a|2/a',
      '~a/a1x//$edge|1/b|2/b',
      '~a/a1x//$edge|1/c|2/c'
    ])

    // insert namespaces
    // ($namespaces should be sorted)
    store.commit('workflows/UPDATE', { id: '~a/a1x//$namespace|c' })
    store.commit('workflows/UPDATE', { id: '~a/a1x//$namespace|a' })
    store.commit('workflows/UPDATE', { id: '~a/a1x//$namespace|b' })
    expect(workflow.$namespaces.map(n => n.id)).to.deep.equal([
      '~a/a1x//$namespace|a',
      '~a/a1x//$namespace|b',
      '~a/a1x//$namespace|c'
    ])
  })

  it('has family values', () => {
    store.commit('workflows/CREATE')

    // insert a nested family in a single operation
    store.commit(
      'workflows/UPDATE',
      {
        id: '~u/w//1/PENGUIN',
        name: 'PENGUIN',
        ancestors: [
          { name: 'root' },
          { name: 'ANIMAL' }
        ],
        __typename: 'FamilyProxy'
      }
    )

    // the family tree can be found on the cycle node
    const cycle = store.state.workflows.cylcTree.$index['~u/w//1']
    expect(cycle.type).to.equal('cycle')
    expect(cycle.id).to.equal('~u/w//1')
    expect(cycle.children).to.deep.equal([])
    expect(cycle.familyTree.length).to.equal(1)

    // the tree contains "first parent" family tree starting at root...
    const root = cycle.familyTree[0]
    expect(root.name).to.equal('root')
    expect(root.type).to.equal('family')
    expect(root.children.length).to.equal(1)

    // ...including all intermediate families...
    const animal = root.children[0]
    expect(animal.name).to.equal('ANIMAL')
    expect(animal.type).to.equal('family')
    expect(animal.children.length).to.equal(1)

    // ...down to the bottom level family
    const penguin = animal.children[0]
    expect(penguin.name).to.equal('PENGUIN')
    expect(penguin.type).to.equal('family')
    expect(penguin.children.length).to.equal(0)

    // add families which are already present to test handing of duplicate
    // additions
    store.commit('workflows/UPDATE', { id: '~u/w//1/root', foo: 1 })
    store.commit('workflows/UPDATE', { id: '~u/w//1/ANIMAL', foo: 2 })
    store.commit('workflows/UPDATE', { id: '~u/w//1/PENGUIN', foo: 3 })

    // the nodes should be updated with the new information
    // no duplicate nodes should have been created
    expect(cycle.children).to.deep.equal([])
    expect(cycle.familyTree.length).to.equal(1)
    expect(root.type).to.equal('family')
    expect(root.children.length).to.equal(1)
    expect(root.node.foo).to.equal(1)
    expect(animal.type).to.equal('family')
    expect(animal.children.length).to.equal(1)
    expect(animal.node.foo).to.equal(2)
    expect(penguin.children.length).to.equal(0)
    expect(penguin.node.foo).to.equal(3)

    // test adding tasks
    store.commit('workflows/UPDATE', { id: '~u/w//1/adelie' })
    store.commit('workflows/UPDATE', { id: '~u/w//1/gentoo' })
    store.commit('workflows/UPDATE', { id: '~u/w//1/jeffes' })
    store.commit('workflows/UPDATE', { id: '~u/w//1/great-auk' })
    store.commit(
      'workflows/UPDATE',
      {
        id: '~u/w//1/PENGUIN',
        childTasks: [
          { id: '~u/w//1/adelie' },
          { id: '~u/w//1/gentoo' },
          { id: '~u/w//1/jeffes' }
        ]
      }
    )
    store.commit(
      'workflows/UPDATE',
      {
        id: '~u/w//1/ANIMAL',
        childTasks: [
          { id: '~u/w//1/great-auk' }
        ]
      }
    )

    // the tasks should be added under the correct families in the familyTree
    expect(cycle.children.length).to.equal(4)
    expect(cycle.familyTree.length).to.equal(1)
    expect(root.children.length).to.equal(1)
    expect(animal.children.map(node => node.id)).to.deep.equal([
      '~u/w//1/great-auk',
      '~u/w//1/PENGUIN'
    ])
    expect(penguin.children.map(node => node.id)).to.deep.equal([
      '~u/w//1/adelie',
      '~u/w//1/gentoo',
      '~u/w//1/jeffes'
    ])

    // test removing task (1/adelie)
    store.commit(
      'workflows/UPDATE',
      {
        id: '~u/w//1/PENGUIN',
        childTasks: [
          // the childTasks should change triggering an update
          { id: '~u/w//1/gentoo' },
          { id: '~u/w//1/jeffes' }
        ]
      }
    )
    store.commit('workflows/REMOVE', '~u/w//1/adelie')

    // 1/adelie should have been removed from both the regular and family trees
    expect(cycle.children.length).to.equal(3)
    expect(penguin.children.map(node => node.id)).to.deep.equal([
      '~u/w//1/gentoo',
      '~u/w//1/jeffes'
    ])
  })

  it('has family divisions', () => {
    store.commit('workflows/CREATE')

    // add a family and some tasks
    store.commit('workflows/UPDATE', { id: '~u/w//1/adelie' })
    store.commit('workflows/UPDATE', { id: '~u/w//1/gentoo' })
    store.commit('workflows/UPDATE', { id: '~u/w//1/jeffes' })
    store.commit('workflows/UPDATE', { id: '~u/w//1/great-auk' })
    store.commit(
      'workflows/UPDATE',
      {
        id: '~u/w//1/PENGUIN',
        childTasks: [
          { id: '~u/w//1/adelie' },
          { id: '~u/w//1/gentoo' },
          { id: '~u/w//1/jeffes' }
        ],
        ancestors: [
          { name: 'root' }
        ],
        __typename: 'FamilyProxy'
      }
    )
    // remove a family
    store.commit('workflows/REMOVE', '~u/w//1/PENGUIN')
    const cycle = store.state.workflows.cylcTree.$index['~u/w//1']

    // the family tree should be destroyed...
    expect(cycle.familyTree.map(node => node.id)).to.deep.equal([
      '~u/w//1/root'
    ])
    expect(cycle.familyTree[0].children.map(node => node.id)).to.deep.equal([])

    // ... however, the task tree should remain
    expect(cycle.children.map(node => node.id)).to.deep.equal([
      '~u/w//1/adelie',
      '~u/w//1/gentoo',
      '~u/w//1/great-auk',
      '~u/w//1/jeffes'
    ])
  })

  it('welcomes cycles to the family', () => {
    // we subscribe to cycle points by subscribing to instances of the "root"
    // family
    // we need to ensure that these cycle point nodes don't mess with family
    // logic
    store.commit('workflows/CREATE')

    // add a family and some tasks
    store.commit(
      'workflows/UPDATE',
      {
        id: '~u/w//1/root',
        __typename: 'FamilyProxy'
      }
    )

    const cycle = store.state.workflows.cylcTree.$index['~u/w//1']
    expect(cycle.children.length).to.equal(0)
    expect(cycle.familyTree.map(c => c.id)).to.deep.equal([
      '~u/w//1/root'
    ])
  })

  it('should not duplicate workflows between subscriptions', () => {
    // We have per-workflow and global subscriptions, both of which will
    // request workflow data. We need to make sure these don't result in
    // duplicated nodes.
    store.commit('workflows/CREATE')

    store.commit(
      'workflows/UPDATE',
      {
        id: '~u/a/b/c'
      }
    )

    store.commit(
      'workflows/UPDATE',
      {
        id: '~u/a/b/c//1/x'
      }
    )

    const user = store.state.workflows.cylcTree.$index['~u']
    expect(user.children.map(c => c.id)).to.deep.equal([
      '~u/a'
    ])
    const workflowA = user.children[0]
    expect(workflowA.children.map(c => c.id)).to.deep.equal([
      '~u/a/b'
    ])
    const workflowB = workflowA.children[0]
    expect(workflowB.children.map(c => c.id)).to.deep.equal([
      '~u/a/b/c'
    ])
  })
})
