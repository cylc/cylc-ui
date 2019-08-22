/*
 * Test data for Tree component tests.
 */

const simpleWorkflowTree3Nodes = [
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
            state: 'failed'
          }
        ]
      }
    ]
  }
]

export {
  simpleWorkflowTree3Nodes
}
