const checkpoint = {
  workflows: [
    {
      id: 'cylc/one',
      name: 'one',
      status: 'running to stop at 20000102T0000Z',
      owner: 'cylc',
      host: 'eld668.cmpd1.metoffice.gov.uk',
      port: 43092,
      taskProxies: [
        {
          id: 'cylc/one/20000101T0000Z/sleepy',
          state: 'succeeded',
          cyclePoint: '20000101T0000Z',
          task: {
            name: 'sleepy'
          },
          jobs: [
            {
              id: 'cylc/one/20000101T0000Z/sleepy/01',
              state: 'succeeded',
              submitNum: 1
            }
          ]
        },
        {
          id: 'cylc/one/20000101T0000Z/waiting',
          state: 'succeeded',
          cyclePoint: '20000101T0000Z',
          task: {
            name: 'waiting'
          },
          jobs: [
            {
              id: 'cylc/one/20000101T0000Z/waiting/01',
              state: 'succeeded',
              submitNum: 1
            }
          ]
        },
        {
          id: 'cylc/one/20000102T0000Z/checkpoint',
          state: 'running',
          cyclePoint: '20000102T0000Z',
          task: {
            name: 'checkpoint'
          },
          jobs: [
            {
              id: 'cylc/one/20000102T0000Z/checkpoint/01',
              state: 'running',
              submitNum: 1
            }
          ]
        },
        {
          id: 'cylc/one/20000102T0000Z/sleepy',
          state: 'held',
          cyclePoint: '20000102T0000Z',
          task: {
            name: 'sleepy'
          },
          jobs: []
        },
        {
          id: 'cylc/one/20000102T0000Z/waiting',
          state: 'waiting',
          cyclePoint: '20000102T0000Z',
          task: {
            name: 'waiting'
          },
          jobs: []
        },
        {
          id: 'cylc/one/20000102T0000Z/eventually_succeeded',
          state: 'succeeded',
          cyclePoint: '20000102T0000Z',
          task: {
            name: 'eventually_succeeded'
          },
          jobs: [
            {
              id: 'cylc/one/20000102T0000Z/eventually_succeeded/01',
              state: 'running',
              submitNum: 1
            },
            {
              id: 'cylc/one/20000102T0000Z/eventually_succeeded/02',
              state: 'running',
              submitNum: 2
            },
            {
              id: 'cylc/one/20000102T0000Z/eventually_succeeded/03',
              state: 'running',
              submitNum: 3
            },
            {
              id: 'cylc/one/20000102T0000Z/eventually_succeeded/04',
              state: 'succeeded',
              submitNum: 4
            }
          ]
        },
        {
          id: 'cylc/one/20000102T0000Z/failed',
          state: 'failed',
          cyclePoint: '20000102T0000Z',
          task: {
            name: 'failed'
          },
          jobs: [
            {
              id: 'cylc/one/20000102T0000Z/failed/01',
              state: 'failed',
              submitNum: 1
            }
          ]
        },
        {
          id: 'cylc/one/20000102T0000Z/retrying',
          state: 'retrying',
          cyclePoint: '20000102T0000Z',
          task: {
            name: 'retrying'
          },
          jobs: [
            {
              id: 'cylc/one/20000102T0000Z/retrying/01',
              state: 'running',
              submitNum: 1
            }
          ]
        },
        {
          id: 'cylc/one/20000102T0000Z/succeeded',
          state: 'succeeded',
          cyclePoint: '20000102T0000Z',
          task: {
            name: 'succeeded'
          },
          jobs: [
            {
              id: 'cylc/one/20000102T0000Z/succeeded/01',
              state: 'succeeded',
              submitNum: 1
            }
          ]
        }
      ]
    }
  ]
}

export { checkpoint }
