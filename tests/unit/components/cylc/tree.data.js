/*
 * Test data for Tree component tests.
 */

const simpleWorkflowTree4Nodes = [
  {
    __type: 'workflow',
    id: 'user/workflow1',
    name: 'workflow1',
    status: 'running',
    children: [
      {
        __type: 'checkpoint',
        id: '20100101T0000Z',
        name: '20100101T0000Z',
        state: 'failed',
        children: [
          {
            __type: 'task',
            id: 'user/workflow1/20100101T0000Z/foo',
            name: 'foo',
            state: 'failed',
            children: [
              {
                __type: 'job',
                id: 'user/workflow1/20100101T0000Z/foo/01',
                name: '#1',
                startedTime: '2019-08-19T22:44:42Z',
                state: 'failed',
                submitNum: 1
              }
            ]
          }
        ]
      }
    ]
  }
]

const simpleWorkflowNode = simpleWorkflowTree4Nodes[0]
const simpleCyclepointNode = simpleWorkflowTree4Nodes[0].children[0]
const simpleTaskNode = simpleCyclepointNode.children[0]
const simpleJobNode = simpleTaskNode.children[0]

export {
  simpleWorkflowTree4Nodes,
  simpleWorkflowNode,
  simpleCyclepointNode,
  simpleTaskNode,
  simpleJobNode
}
