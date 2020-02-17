/*
 * Test data for Tree component tests.
 */

const simpleWorkflowTree4Nodes = [
  {
    __typename: 'Workflow',
    id: 'user/workflow1',
    name: 'workflow1',
    state: 'running',
    children: [
      {
        __typename: 'CyclePoint',
        id: '20100101T0000Z',
        name: '20100101T0000Z',
        state: 'failed',
        children: [
          {
            __typename: 'TaskProxy',
            id: 'user/workflow1/20100101T0000Z/foo',
            name: 'foo',
            state: 'failed',
            expanded: false,
            children: [
              {
                __typename: 'Job',
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
