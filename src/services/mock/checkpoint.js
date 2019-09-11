const checkpoint = {
  workflows: [
    {
      id: 'cylc/one',
      name: 'one',
      status: 'running',
      owner: 'cylc',
      host: 'cylc-VirtualBox',
      port: 43060,
      taskProxies: [
        {
          id: 'cylc/one/20000101T0000Z/sleepy',
          state: 'succeeded',
          cyclePoint: '20000101T0000Z',
          task: {
            meanElapsedTime: 1.0,
            name: 'sleepy'
          },
          jobs: [
            {
              id: 'cylc/one/20000101T0000Z/sleepy/01',
              host: 'localhost',
              startedTime: '2019-08-21T01:31:30Z',
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
            meanElapsedTime: 1.0,
            name: 'waiting'
          },
          jobs: [
            {
              id: 'cylc/one/20000101T0000Z/waiting/01',
              host: 'localhost',
              startedTime: '2019-08-21T01:31:30Z',
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
            meanElapsedTime: 8.0,
            name: 'checkpoint'
          },
          jobs: [
            {
              id: 'cylc/one/20000102T0000Z/checkpoint/01',
              host: 'localhost',
              startedTime: '2019-08-21T01:31:56Z',
              state: 'running',
              submitNum: 1
            }
          ]
        },
        {
          id: 'cylc/one/20000102T0000Z/sleepy',
          state: 'waiting',
          cyclePoint: '20000102T0000Z',
          task: {
            meanElapsedTime: 1.0,
            name: 'sleepy'
          },
          jobs: []
        },
        {
          id: 'cylc/one/20000102T0000Z/waiting',
          state: 'waiting',
          cyclePoint: '20000102T0000Z',
          task: {
            meanElapsedTime: 1.0,
            name: 'waiting'
          },
          jobs: []
        },
        {
          id: 'cylc/one/20000102T0000Z/eventually_succeeded',
          state: 'succeeded',
          cyclePoint: '20000102T0000Z',
          task: {
            meanElapsedTime: 1.0,
            name: 'eventually_succeeded'
          },
          jobs: [
            {
              id: 'cylc/one/20000102T0000Z/eventually_succeeded/01',
              host: 'localhost',
              startedTime: '2019-08-21T01:31:34Z',
              state: 'running',
              submitNum: 1
            },
            {
              id: 'cylc/one/20000102T0000Z/eventually_succeeded/02',
              host: 'localhost',
              startedTime: '2019-08-21T01:31:40Z',
              state: 'running',
              submitNum: 2
            },
            {
              id: 'cylc/one/20000102T0000Z/eventually_succeeded/03',
              host: 'localhost',
              startedTime: '2019-08-21T01:31:44Z',
              state: 'running',
              submitNum: 3
            },
            {
              id: 'cylc/one/20000102T0000Z/eventually_succeeded/04',
              host: 'localhost',
              startedTime: '2019-08-21T01:31:49Z',
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
            meanElapsedTime: 0.0,
            name: 'failed'
          },
          jobs: [
            {
              id: 'cylc/one/20000102T0000Z/failed/01',
              host: 'localhost',
              startedTime: '2019-08-21T01:31:52Z',
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
            meanElapsedTime: 0.0,
            name: 'retrying'
          },
          jobs: [
            {
              id: 'cylc/one/20000102T0000Z/retrying/01',
              host: 'localhost',
              startedTime: '2019-08-21T01:31:34Z',
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
            meanElapsedTime: 0.5,
            name: 'succeeded'
          },
          jobs: [
            {
              id: 'cylc/one/20000102T0000Z/succeeded/01',
              host: 'localhost',
              startedTime: '2019-08-21T01:31:35Z',
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
