import { Tokens } from '@/utils/uid'

const nodeSucceeded =
  {
    id: 'user/one/run1//2/succeeded',
    name: 'succeeded',
    node: {
      name: 'succeeded',
      firstParent: {
        id: 'user/one/run1//2/SUCCEEDED'
      }
    },
    tokens: {
      cycle: '2'
    },
    children: []
  }

const nodeRetrying =
  {
    id: 'user/one/run1//1/retrying',
    name: 'retrying',
    node: {
      name: 'retrying',
      firstParent: {
        id: 'user/one/run1//1/BAD'
      }
    },
    tokens: {
      cycle: '1'
    },
    children: [
      {
        id: 'user/one/run1//1/retrying/01',
        name: 'retrying',
      },
      {
        id: 'user/one/run1//1/retrying/02',
        name: 'retrying',
      }
    ]
  }

const nodeSleepy =
  {
    id: 'user/one/run1//2/sleepy',
    name: 'sleepy',
    node: {
      name: 'sleepy',
      firstParent: {
        id: 'user/one/run1//1/root'
      }
    },
    tokens: {
      cycle: '2'
    },
    children: []
  }

const nodeFailed =
  {
    id: 'user/one/run1//1/failed',
    name: 'failed',
    node: {
      name: 'failed',
      firstParent: {
        id: 'user/one/run1//1/BAD'
      },
      descendants: []
    },
    tokens: {
      cycle: '1'
    },
  }

const nodeNamespaceRoot =
  {
    id: 'user/one/run1//$namespace|root',
    name: 'root',
    node: {
      name: 'root',
      firstParent: null,
      childFamilies: [{ name: 'GOOD' }, { name: 'BAD' }],
      childTasks: [{ name: 'checkpoint' }, { name: 'sleepy' }, { name: 'waiting' }],
      descendants: ['GOOD', 'SUCCEEDED', 'BAD', 'checkpoint', 'sleepy', 'waiting', 'retrying', 'failed', 'succeeded', 'eventually_succeeded']
    },
    tokens: { cycle: undefined }
  }

const nodeNamespaceBad =
  {
    id: 'user/one/run1//$namespace|BAD',
    name: 'BAD',
    node: {
      name: 'root',
      firstParent: { id: 'user/one/run1//$namespace|root', name: 'root' },
      childFamilies: [],
      childTasks: [{ name: 'retrying' }, { name: 'failed' }],
      descendants: ['retrying', 'failed']
    },
    tokens: { cycle: undefined }
  }

const nodeNamespaceGood =
  {
    id: 'user/one/run1//$namespace|GOOD',
    name: 'GOOD',
    node: {
      name: 'GOOD',
      firstParent: { id: 'user/one/run1//$namespace|root', name: 'root' },
      childFamilies: [{ name: 'SUCCEEDED' }],
      childTasks: [{ name: 'succeeded' }, { name: 'eventually_succeeded' }],
      descendants: ['SUCCEEDED', 'succeeded', 'eventually_succeeded']
    },
    tokens: { cycle: undefined }
  }

const nodeNamespaceSucceeded =
  {
    id: 'user/one/run1//$namespace|SUCCEEDED',
    name: 'SUCCEEDED',
    node: {
      name: 'GOOD',
      firstParent: { id: 'user/one/run1//$namespace|GOOD', name: 'GOOD' },
      childFamilies: [],
      childTasks: [{ name: 'succeeded' }, { name: 'eventually_succeeded' }],
      descendants: ['succeeded', 'eventually_succeeded'],
    },
    tokens: { cycle: undefined }
  }

const workflows = [
  {
    id: '~user/one',
    node: {
      firstParent: {
        id: ''
      },
      descendants: []
    },
    children: [
      {
        id: '~user/one//1',
        tokens: { cycle: 1 },
        node: {
          firstParent: {
            id: '~user/one'
          },
          descendants: []
        },
        children: [
          {
            id: '~user/one//1/eventually_succeeded',
            tokens: { cycle: 1 },
            node: {
              firstParent: {
                id: 'user/one/run1//1/SUCCEEDED'
              }
            },
            children: [
              {
                id: '~user/one//1/eventually_succeeded/3',
                tokens: { cycle: 1 },
                node: {
                  firstParent: {
                    id: 'user/one/run1//1/SUCCEEDED'
                  }
                },
                children: [],
              },
              {
                id: '~user/one//1/eventually_succeeded/2',
                tokens: { cycle: 1 },
                node: {
                  firstParent: {
                    id: 'user/one/run1//1/SUCCEEDED'
                  }
                },
                children: [],
              },
              {
                id: '~user/one//1/eventually_succeeded/1',
                tokens: { cycle: 1 },
                node: {
                  firstParent: {
                    id: 'user/one/run1//1/SUCCEEDED'
                  }
                },
                children: [],
              },
            ],
          },
          {
            id: '~user/one//1/failed',
            tokens: { cycle: 1 },
            node: {
              firstParent: {
                id: 'user/one/run1//1/BAD'
              }
            },
            children: [
              {
                id: '~user/one//1/failed/1',
                tokens: { cycle: 1 },
                node: {
                  firstParent: {
                    id: 'user/one/run1//1/BAD'
                  }
                },
                children: [],
              },
            ],
          },
        ]
      }
    ],
    tokens: new Tokens('user/one/run1'),
    $namespaces: [
      nodeNamespaceBad,
      nodeNamespaceGood,
      nodeNamespaceRoot,
      nodeNamespaceSucceeded
    ]
  }
]

const nodes = [
  nodeFailed,
  nodeRetrying,
  nodeSleepy,
  nodeSucceeded
]

const edges = [
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

const cylcTree = {
  $index: {
    'user/one/run1//1/succeeded': nodeSucceeded,
    'user/one/run1//2/sleepy': nodeSleepy,
    'user/one/run1//1/retrying': nodeRetrying,
    'user/one/run1//1/failed': nodeFailed,
    'user/one/run1//$namespace|root': nodeNamespaceRoot,
    'user/one/run1//$namespace|BAD': nodeNamespaceBad,
    'user/one/run1//$namespace|GOOD': nodeNamespaceGood,
    'user/one/run1//$namespace|SUCCEEDED': nodeNamespaceSucceeded
  }
}

const namespaces = () => {
  return workflows[0]?.$namespaces || []
}

export {
  workflows,
  nodes,
  edges,
  cylcTree,
  namespaces
}
