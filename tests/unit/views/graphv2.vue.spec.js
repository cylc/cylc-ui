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

import { workflows, cylcTree, nodes, namespaces, getCycles } from './graphv2utils.js'

chai.config.truncateThreshold = 0

let groupFamily
const getFamilies = (nodes) => {
  if (!groupFamily) return
  return nodes.reduce((x, y) => {
    if (y.node.firstParent) {
      (x[y.node.firstParent.id.split('/')[y.node.firstParent.id.split('/').length - 1]] ||= []).push(y)
    }
    return x
  }, {})
}

let allParentLookUp = {}
const namespaces2 = namespaces()

const getAllParentLookUp = () => {
  allParentLookUp = {}
  namespaces2.forEach((namespace) => {
    const array = []
    let parents = namespace.node.parents
    while (parents.length) {
      parents.forEach((parent) => {
        const childTokens = workflows[0].tokens.clone({ cycle: `$namespace|${parent.name}` })
        const childNode = cylcTree.$index[childTokens.id]
        array.push(childNode.name)
        parents = childNode.node.parents
      })
    }
    allParentLookUp[namespace.name] = array
  })
  return allParentLookUp
}

describe('Graph view', () => {
  it('gets namespaces', async () => {
    expect(namespaces()).toMatchObject([
      {
        id: 'user/one/run1//$namespace|BAD',
        name: 'BAD'
      },
      {
        id: 'user/one/run1//$namespace|GOOD',
        name: 'GOOD'
      },
      {
        id: 'user/one/run1//$namespace|root',
        name: 'root'
      },
      {
        id: 'user/one/run1//$namespace|SUCCEEDED',
        name: 'SUCCEEDED'
      },
    ])
  })

  it('gets families', async () => {
    expect(getFamilies(nodes)).toMatchObject(undefined)
    groupFamily = ['GOOD']
    expect(getFamilies(nodes)).toMatchObject(
      {
        BAD: [
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
        SUCCEEDED: [
          {
            id: 'user/one/run1//1/succeeded',
            name: 'succeeded',
            node: {
              firstParent: {
                id: 'user/one/run1//1/SUCCEEDED'
              }
            },
            tokens: {
              cycle: '2'
            }
          }
        ],
        root: [
          {
            id: 'user/one/run1//1/sleepy',
            name: 'sleepy',
            node: {
              firstParent: {
                id: 'user/one/run1//1/root'
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

  it('gets cycles', async () => {
    expect(getCycles(nodes)).toMatchObject(
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
            id: 'user/one/run1//1/sleepy',
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
            id: 'user/one/run1//1/succeeded',
            name: 'succeeded',
            node: {
              firstParent: {
                id: 'user/one/run1//1/SUCCEEDED'
              }
            },
            tokens: {
              cycle: '2'
            }
          }
        ]
      },
    )
  })

  it('gets allParentLookUp', async () => {
    expect(getAllParentLookUp()).toMatchObject(
      {
        BAD: ['root'],
        GOOD: ['root'],
        root: [],
        SUCCEEDED: ['GOOD', 'root']
      }
    )
  })
})
