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
import { Tokens } from '@/utils/uid'
import { workflows, cylcTree, nodes, edges as edgesMap, namespaces } from './graph-utils.js'
import { cloneDeep, merge } from 'lodash-es'

chai.config.truncateThreshold = 0

describe('Graph view', () => {
  let store, $workflowService, edges
  beforeEach(() => {
    store = createStore(storeOptions)
    const user = new User({ username: 'cylc', permissions: [], owner: 'owner' })
    store.commit('user/SET_USER', user)
    $workflowService = sinon.createStubInstance(WorkflowService)
    sinon.stub(Graph.methods, 'mountSVGPanZoom')
    edges = cloneDeep(edgesMap)
  })
  afterEach(() => { sinon.restore() })

  function mountFunction (opts = {}) {
    return mount(Graph, merge(
      {
        shallow: true,
        global: {
          plugins: [store],
          mocks: { $workflowService }
        },
        props: {
          workflowName: 'one',
        },
        computed: {
          workflows: () => workflows,
          namespaces,
          cylcTree: () => cylcTree,
          controlGroups: () => [],
        }
      },
      opts
    ))
  }

  it('gets cycles', async () => {
    const wrapper = mountFunction()

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
    const wrapper = mountFunction({
      computed: {
        allParentLookUp: () => new Map([
          ['ANIMALS', []],
          ['PLANTS', []],
          ['MAMMALS', ['ANIMALS']],
          ['BIRDS', ['ANIMALS']],
          ['RODENTS', ['ANIMALS', 'MAMMALS']],
        ]),
      }
    })

    expect(wrapper.vm.getTree()).toMatchObject([
      {
        name: 'ANIMALS',
        children: [
          {
            name: 'MAMMALS',
            children: [
              {
                name: 'RODENTS',
                children: [],
                disabled: false,
              },
            ],
            disabled: false,
          },
          {
            name: 'BIRDS',
            children: [],
            disabled: false,
          }
        ],
        disabled: false,
      },
      {
        name: 'PLANTS',
        children: [],
        disabled: false,
      },
    ])
  })

  it('it removes edge node by source', () => {
    const wrapper = mountFunction()
    // in this test we remove the first edge with a source of 'user/one/run1//1/sleepy'
    expect(wrapper.vm.removeEdges('user/one/run1//2/sleepy', edges)).toStrictEqual([
      // the returned removed edges array
      {
        tokens: new Tokens('user/one/run1//$edge|2/sleepy|1/failed'),
        source: new Tokens('user/one/run1//2/sleepy'),
        target: new Tokens('user/one/run1//1/failed'),
      }
    ])

    expect(edges).toStrictEqual(new Map([
      // the edges with the edge removed
      [
        'user/one/run1//$edge|1/succeeded|1/failed',
        {
          tokens: new Tokens('user/one/run1//$edge|1/succeeded|1/failed'),
          source: new Tokens('user/one/run1//1/succeeded'),
          target: new Tokens('user/one/run1//1/failed'),
        }
      ],
      [
        'user/one/run1//$edge|1/failed|1/checkpoint',
        {
          tokens: new Tokens('user/one/run1//$edge|1/failed|1/checkpoint'),
          source: new Tokens('user/one/run1//1/failed'),
          target: new Tokens('user/one/run1//1/checkpoint'),
        }
      ],
    ]))
  })

  it('it removes edge node by source & target', () => {
    const wrapper = mountFunction()

    // await wrapper.vm.$nextTick()
    // in this test we remove the first edge with a target of 'user/one/run1//1/failed'

    expect(wrapper.vm.removeEdges('user/one/run1//1/failed', edges)).toStrictEqual([
      // the returned edges array with the edge removed
      {
        tokens: new Tokens('user/one/run1//$edge|1/succeeded|1/failed'),
        source: new Tokens('user/one/run1//1/succeeded'),
        target: new Tokens('user/one/run1//1/failed'),
      },
      {
        tokens: new Tokens('user/one/run1//$edge|1/failed|1/checkpoint'),
        source: new Tokens('user/one/run1//1/failed'),
        target: new Tokens('user/one/run1//1/checkpoint'),
      },
      {
        tokens: new Tokens('user/one/run1//$edge|2/sleepy|1/failed'),
        source: new Tokens('user/one/run1//2/sleepy'),
        target: new Tokens('user/one/run1//1/failed'),
      },
    ])
    expect(edges).toStrictEqual(new Map([]))
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
