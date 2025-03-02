/* Copyright (C) NIWA & British Crown (Met Office) & Contributors.
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
 * along with this program.  If not, see <http://www.gnu.org/licenses/>. */

import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import sinon from 'sinon'
import storeOptions from '@/store/options'
import Graph, { childArray } from '@/views/Graph.vue'
import User from '@/model/User.model'
import WorkflowService from '@/services/workflow.service'
import { workflows, cylcTree, nodes, edges, namespaces } from './graph-utils.js'

chai.config.truncateThreshold = 0

describe('Graph view', () => {
  let store, $workflowService
  beforeEach(() => {
    store = createStore(storeOptions)
    const user = new User({ username: 'cylc', permissions: [], owner: 'owner' })
    store.commit('user/SET_USER', user)
    $workflowService = sinon.createStubInstance(WorkflowService)
    sinon.stub(Graph.methods, 'mountSVGPanZoom')
  })
  afterEach(() => { sinon.restore() })

  it('gets cycles', async () => {
    const wrapper = mount(Graph, {
      shallow: true,
      global: {
        plugins: [store],
        mocks: { $workflowService }
      },
      props: {
        workflowName: 'one',
      },
      computed: {
        workflows () {
          return workflows
        },
        namespaces () {
          return namespaces()
        },
        cylcTree () {
          return cylcTree
        }
      }
    })

    expect(wrapper.vm.getCycles(nodes)).toMatchObject(
      {
        1: [
          {
            id: 'user/one/run1//1/failed',
            name: 'failed',
            node: {
              firstParent: {
                id: 'user/one/run1//1/BAD'
              }
            },
            tokens: {
              cycle: '1'
            }
          },
          {
            id: 'user/one/run1//1/retrying',
            name: 'retrying',
            node: {
              firstParent: {
                id: 'user/one/run1//1/BAD'
              }
            },
            tokens: {
              cycle: '1'
            }
          }
        ],
        2: [
          {
            id: 'user/one/run1//2/sleepy',
            name: 'sleepy',
            node: {
              firstParent: {
                id: 'user/one/run1//1/root'
              }
            },
            tokens: {
              cycle: '2'
            }
          },
          {
            id: 'user/one/run1//2/succeeded',
            name: 'succeeded',
            node: {
              firstParent: {
                id: 'user/one/run1//2/SUCCEEDED'
              }
            },
            tokens: {
              cycle: '2'
            }
          }
        ]
      }
    )
  })

  it('it gets tree', async () => {
    const wrapper = mount(Graph, {
      shallow: true,
      global: {
        plugins: [store],
        mocks: { $workflowService }
      },
      props: {
        workflowName: 'one',
      },
      computed: {
        workflows () {
          return workflows
        },
        namespaces () {
          return namespaces()
        },
        cylcTree () {
          return cylcTree
        },
        allParentLookUp () {
          return {
            BAD: [
              'root'
            ],
            GOOD: [
              'root'
            ],
            root: [],
            SUCCEEDED: [
              'GOOD',
              'root'
            ]
          }
        }
      }
    })

    // wrapper.vm.nextTick()
    expect(wrapper.vm.getTree()).toMatchObject(
      [
        {
          children: [
            {
              children: [],
              disabled: false,
              id: 3,
              name: 'SUCCEEDED',
            },
          ],
          disabled: false,
          id: 2,
          name: 'GOOD',
        },
        {
          children: [],
          disabled: false,
          id: 4,
          name: 'BAD',
        },
      ]
    )
  })

  it('it checks for edge by source', async () => {
    const wrapper = mount(Graph, {
      shallow: true,
      global: {
        plugins: [store],
        mocks: { $workflowService }
      },
      props: {
        workflowName: 'one',
      },
      computed: {
        workflows () {
          return workflows
        },
        namespaces () {
          return namespaces()
        },
        cylcTree () {
          return cylcTree
        },
        workflowIDs () {
          return ['user/one/run1']
        }
      }
    })
    expect(wrapper.vm.checkForEdgeBySource('failed', '1', edges)).toMatchObject(
      [
        {
          id: 'user/one/run1//$edge|1/failed|1/checkpoint',
          name: 'user/one/run1//$edge|1/failed|1/checkpoint',
          parent: 'user/one/run1',
          node: {
            id: 'user/one/run1//$edge|1/failed|1/checkpoint',
            source: 'user/one/run1//1/failed',
            target: 'user/one/run1//1/checkpoint',
            __typename: 'Edge'
          }
        }
      ]
    )
  })

  it('it checks for edge by target', async () => {
    const wrapper = mount(Graph, {
      shallow: true,
      global: {
        plugins: [store],
        mocks: { $workflowService }
      },
      props: {
        workflowName: 'one',
      },
      computed: {
        workflows () {
          return workflows
        },
        namespaces () {
          return namespaces()
        },
        cylcTree () {
          return cylcTree
        },
        workflowIDs () {
          return ['user/one/run1']
        }
      }
    })
    expect(wrapper.vm.checkForEdgeByTarget('checkpoint', '1', edges)).toMatchObject(
      [
        {
          id: 'user/one/run1//$edge|1/failed|1/checkpoint',
          name: 'user/one/run1//$edge|1/failed|1/checkpoint',
          parent: 'user/one/run1',
          node: {
            id: 'user/one/run1//$edge|1/failed|1/checkpoint',
            source: 'user/one/run1//1/failed',
            target: 'user/one/run1//1/checkpoint',
            __typename: 'Edge'
          }
        }
      ]
    )
  })

  it('it removes edge node by source', async () => {
    const wrapper = mount(Graph, {
      shallow: true,
      global: {
        plugins: [store],
        mocks: { $workflowService }
      },
      props: {
        workflowName: 'one',
      },
      computed: {
        workflows () {
          return workflows
        },
        namespaces () {
          return namespaces()
        },
        cylcTree () {
          return cylcTree
        },
        workflowIDs () {
          return ['user/one/run1']
        },
        allChildrenLookUp () {
          return {
            'user/one/run1//1/succeeded': [
              {
                id: 'user/one/run1//2/succeeded',
                name: 'succeeded',
                children: []
              }
            ],
            'user/one/run1//2/sleepy': [{ id: 'user/one/run1//2/sleepy', name: 'sleepy', children: [] }],
            'user/one/run1//1/retrying': [
              {
                id: 'user/one/run1//1/retrying',
                name: 'retrying',
                children: [Array]
              },
              {
                id: 'user/one/run1//1/retrying/01',
                name: 'retrying',
                children: undefined
              },
              {
                id: 'user/one/run1//1/retrying/02',
                name: 'retrying',
                children: undefined
              }
            ],
            'user/one/run1//1/failed': [
              {
                id: 'user/one/run1//1/failed',
                name: 'failed',
                children: undefined
              }
            ],
            'user/one/run1//$namespace|root': [
              {
                id: 'user/one/run1//$namespace|root',
                name: 'root',
                children: undefined
              }
            ],
            'user/one/run1//$namespace|BAD': [
              {
                id: 'user/one/run1//$namespace|BAD',
                name: 'BAD',
                children: undefined
              }
            ],
            'user/one/run1//$namespace|GOOD': [
              {
                id: 'user/one/run1//$namespace|GOOD',
                name: 'GOOD',
                children: undefined
              }
            ],
            'user/one/run1//$namespace|SUCCEEDED': [
              {
                id: 'user/one/run1//$namespace|SUCCEEDED',
                name: 'SUCCEEDED',
                children: undefined
              }
            ]
          }
        }
      }
    })
    // in this test we remove the first edge with a source of 'user/one/run1//1/sleepy'
    const config = wrapper.vm.allChildrenLookUp['user/one/run1//2/sleepy'][0]
    const edgeCheckSource = wrapper.vm.checkForEdgeBySource(config.name, '2', edges)
    const removedEdges = []

    expect(wrapper.vm.removeEdgeBySource(edgeCheckSource, edges, removedEdges, config, '2')).toMatchObject(
      [
        // the returned edges array with the edge removed
        [
          {
            id: 'user/one/run1//$edge|1/succeeded|1/failed',
            name: 'user/one/run1//$edge|1/succeeded|1/failed',
            parent: 'user/one/run1',
            node: {
              id: 'user/one/run1//$edge|1/succeeded|1/failed',
              source: 'user/one/run1//1/succeeded',
              target: 'user/one/run1//1/failed',
              __typename: 'Edge'
            }
          },
          {
            id: 'user/one/run1//$edge|1/failed|1/checkpoint',
            name: 'user/one/run1//$edge|1/failed|1/checkpoint',
            parent: 'user/one/run1',
            node: {
              id: 'user/one/run1//$edge|1/failed|1/checkpoint',
              source: 'user/one/run1//1/failed',
              target: 'user/one/run1//1/checkpoint',
              __typename: 'Edge'
            }
          }
        ],
        // the returned removed edges array
        [
          {
            id: 'user/one/run1//$edge|2/sleepy|1/failed',
            name: 'user/one/run1//$edge|2/sleepy|1/failed',
            parent: 'user/one/run1',
            node: {
              id: 'user/one/run1//$edge|2/sleepy|1/failed',
              source: 'user/one/run1//2/sleepy',
              target: 'user/one/run1//1/failed',
              __typename: 'Edge'
            }
          }
        ]
      ]
    )
  })

  it('it removes edge node by target', async () => {
    const wrapper = mount(Graph, {
      shallow: true,
      global: {
        plugins: [store],
        mocks: { $workflowService }
      },
      props: {
        workflowName: 'one',
      },
      computed: {
        workflows () {
          return workflows
        },
        namespaces () {
          return namespaces()
        },
        cylcTree () {
          return cylcTree
        },
        workflowIDs () {
          return ['user/one/run1']
        },
        allChildrenLookUp () {
          return {
            'user/one/run1//1/succeeded': [
              {
                id: 'user/one/run1//2/succeeded',
                name: 'succeeded',
                children: [],
              }
            ],
            'user/one/run1//2/sleepy': [
              {
                id: 'user/one/run1//2/sleepy',
                name: 'sleepy',
                children: [],
              }
            ],
            'user/one/run1//1/retrying': [
              {
                id: 'user/one/run1//1/retrying',
                name: 'retrying',
                children: [
                  {
                    id: 'user/one/run1//1/retrying/01',
                    name: 'retrying',
                  },
                  {
                    id: 'user/one/run1//1/retrying/02',
                    name: 'retrying',
                  }
                ],
              },
              {
                id: 'user/one/run1//1/retrying/01',
                name: 'retrying',
                children: undefined,
              },
              {
                id: 'user/one/run1//1/retrying/02',
                name: 'retrying',
                children: undefined,
              }
            ],
            'user/one/run1//1/failed': [
              {
                id: 'user/one/run1//1/failed',
                name: 'failed',
                children: undefined,
              }
            ],
            'user/one/run1//$namespace|root': [
              {
                id: 'user/one/run1//$namespace|root',
                name: 'root',
                children: undefined,
              }
            ],
            'user/one/run1//$namespace|BAD': [
              {
                id: 'user/one/run1//$namespace|BAD',
                name: 'BAD',
                children: undefined,
              }
            ],
            'user/one/run1//$namespace|GOOD': [
              {
                id: 'user/one/run1//$namespace|GOOD',
                name: 'GOOD',
                children: undefined,
              }
            ],
            'user/one/run1//$namespace|SUCCEEDED': [
              {
                id: 'user/one/run1//$namespace|SUCCEEDED',
                name: 'SUCCEEDED',
                children: undefined,
              }
            ]
          }
        }
      }
    })
    await wrapper.vm.$nextTick()
    // in this test we remove the first edge with a target of 'user/one/run1//1/failed'
    const config = wrapper.vm.allChildrenLookUp['user/one/run1//1/failed'][0]
    const edgeCheckTarget = wrapper.vm.checkForEdgeByTarget(config.name, '1', edges)
    const removedEdges = []

    expect(wrapper.vm.removeEdgeByTarget(edgeCheckTarget, edges, removedEdges)).toMatchObject(
      [
        // the returned edges array with the edge removed
        [
          {
            id: 'user/one/run1//$edge|1/failed|1/checkpoint',
            name: 'user/one/run1//$edge|1/failed|1/checkpoint',
            parent: 'user/one/run1',
            node: {
              id: 'user/one/run1//$edge|1/failed|1/checkpoint',
              source: 'user/one/run1//1/failed',
              target: 'user/one/run1//1/checkpoint',
              __typename: 'Edge'
            },
            tokens: {
              edge: [
                {
                  task: 'failed',
                  cycle: '1'
                },
                {
                  task: 'checkpoint',
                  cycle: '1'
                },
              ]
            }
          }
        ],
        // the returned removed edges array
        [
          {
            id: 'user/one/run1//$edge|1/succeeded|1/failed',
            name: 'user/one/run1//$edge|1/succeeded|1/failed',
            parent: 'user/one/run1',
            node: {
              id: 'user/one/run1//$edge|1/succeeded|1/failed',
              source: 'user/one/run1//1/succeeded',
              target: 'user/one/run1//1/failed',
              __typename: 'Edge'
            },
            tokens: {
              edge: [
                {
                  task: 'succeeded',
                  cycle: '1'
                },
                {
                  task: 'failed',
                  cycle: '1'
                },
              ]
            }
          },
          {
            id: 'user/one/run1//$edge|2/sleepy|1/failed',
            name: 'user/one/run1//$edge|2/sleepy|1/failed',
            parent: 'user/one/run1',
            node: {
              id: 'user/one/run1//$edge|2/sleepy|1/failed',
              source: 'user/one/run1//2/sleepy',
              target: 'user/one/run1//1/failed',
              __typename: 'Edge'
            },
            tokens: {
              edge: [
                {
                  task: 'sleepy',
                  cycle: '2'
                },
                {
                  task: 'failed',
                  cycle: '1'
                },
              ]
            }
          }
        ]
      ]
    )
  })
  it('it gets flattened array of the nested children', async () => {
    const testData = [
      {
        id: 'user/one/run1//1',
        name: 'cycle',
        children: [
          {
            id: 'user/one/run1//1/CHILD',
            name: 'CHILD',
            children: [
              {
                id: 'user/one/run1//1/grandChildA',
                name: 'grandChildA',
                children: [
                  {
                    id: 'user/one/run1//1/grandChildA/1',
                    name: '1',
                    type: 'job'
                  }
                ],
                type: 'task'
              },
              {
                id: 'user/one/run1//1/grandChildB',
                name: 'grandChildB',
                children: [
                  {
                    id: 'user/one/run1//1/grandChildB/1',
                    name: '1',
                    type: 'job'
                  }
                ],
                type: 'task'
              }
            ],
            type: 'family'
          }
        ],
        type: 'cycle'
      },
    ]
    expect(childArray(testData)).toMatchObject(
      [
        {
          id: 'user/one/run1//1',
          name: 'cycle',
          children: [
            {
              id: 'user/one/run1//1/CHILD',
              name: 'CHILD',
              children: [
                {
                  id: 'user/one/run1//1/grandChildA',
                  name: 'grandChildA',
                  children: [{ id: 'user/one/run1//1/grandChildA/1', name: '1', type: 'job' }],
                  type: 'task'
                },
                {
                  id: 'user/one/run1//1/grandChildB',
                  name: 'grandChildB',
                  children: [{ id: 'user/one/run1//1/grandChildB/1', name: '1', type: 'job' }],
                  type: 'task'
                }
              ],
              type: 'family'
            }
          ],
          type: 'cycle'
        },
        {
          id: 'user/one/run1//1/CHILD',
          name: 'CHILD',
          children: [
            {
              id: 'user/one/run1//1/grandChildA',
              name: 'grandChildA',
              children: [{ id: 'user/one/run1//1/grandChildA/1', name: '1', type: 'job' }],
              type: 'task'
            },
            {
              id: 'user/one/run1//1/grandChildB',
              name: 'grandChildB',
              children: [{ id: 'user/one/run1//1/grandChildB/1', name: '1', type: 'job' }],
              type: 'task'
            }
          ],
          type: 'family'
        },
        {
          id: 'user/one/run1//1/grandChildA',
          name: 'grandChildA',
          type: 'task'
        },
        {
          id: 'user/one/run1//1/grandChildB',
          name: 'grandChildB',
          type: 'task'
        }
      ]
    )
  })
})
