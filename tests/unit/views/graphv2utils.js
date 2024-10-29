import { Tokens } from '@/utils/uid'

const nodeSuceeded =
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

const nodeRetrying =
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

const nodeSleepy =
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

const nodeFailed =
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
  }

const nodeNamespaceRoot =
  {
    id: 'user/one/run1//$namespace|root',
    name: 'root',
    node: {
      parents: [],
      childFamilies: [{ name: 'GOOD' }, { name: 'BAD' }],
      childTasks: [{ name: 'checkpoint' }, { name: 'sleepy' }, { name: 'waiting' }]
    }
  }

const nodeNamespaceBad =
  {
    id: 'user/one/run1//$namespace|BAD',
    name: 'BAD',
    node: {
      parents: [{ name: 'root' }],
      childFamilies: [],
      childTasks: [{ name: 'retrying' }, { name: 'failed' }]
    }
  }

const nodeNamespaceGood =
  {
    id: 'user/one/run1//$namespace|GOOD',
    name: 'GOOD',
    node: {
      parents: [{ name: 'root' }],
      childFamilies: [{ name: 'SUCCEEDED' }],
      childTasks: [{ name: 'retrying' }, { name: 'failed' }]
    }
  }

const nodeNamespaceSucceeded =
  {
    id: 'user/one/run1//$namespace|SUCCEEDED',
    name: 'SUCCEEDED',
    node: {
      parents: [{ name: 'GOOD' }],
      childFamilies: [],
      childTasks: [{ name: 'succeeded' }, { name: 'eventually_succeeded' }]
    }
  }

const workflows = [
  {
    id: '~user/one',
    children: [
      {
        id: '~user/one//1',
        children: [
          {
            id: '~user/one//1/eventually_succeeded',
            children: [
              {
                id: '~user/one//1/eventually_succeeded/3',
                children: [],
              },
              {
                id: '~user/one//1/eventually_succeeded/2',
                children: [],
              },
              {
                id: '~user/one//1/eventually_succeeded/1',
                children: [],
              },
            ],
          },
          {
            id: '~user/one//1/failed',
            children: [
              {
                id: '~user/one//1/failed/1',
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
  nodeSuceeded
]

const cylcTree = {
  $index: {
    'user/one/run1//1/succeeded': nodeSuceeded,
    'user/one/run1//1/sleepy': nodeSleepy,
    'user/one/run1//1/retrying': nodeRetrying,
    'user/one/run1//1/failed': nodeFailed,
    'user/one/run1//$namespace|root': nodeNamespaceRoot,
    'user/one/run1//$namespace|BAD': nodeNamespaceBad,
    'user/one/run1//$namespace|GOOD': nodeNamespaceGood,
    'user/one/run1//$namespace|SUCCEEDED': nodeNamespaceSucceeded
  }
}

// const getFamilies = (nodes) => {
//   if (!groupFamily) return
//   return nodes.reduce((x, y) => {
//     if (y.node.firstParent) {
//       (x[y.node.firstParent.id.split('/')[y.node.firstParent.id.split('/').length - 1]] ||= []).push(y)
//     }
//     return x
//   }, {})
// }

const getCycles = (nodes) => {
  return nodes.reduce((x, y) => {
    (x[y.tokens.cycle] ||= []).push(y)
    return x
  }, {})
}

const namespaces = () => {
  return workflows[0]?.$namespaces || []
}

export {
  workflows,
  nodes,
  cylcTree,
  // getFamilies,
  getCycles,
  namespaces
}
