const simpleWorkflowGscanNodes = [
  {
    id: 'user|five',
    name: 'five',
    status: 'running',
    owner: 'user',
    host: 'user-VirtualBox',
    port: 43015,
    taskProxies: [
      {
        id: 'user|five|20130829T0000Z|foo',
        name: 'foo',
        state: 'succeeded',
        cyclePoint: '20130829T0000Z',
        latestMessage: 'succeeded',
        task: {
          meanElapsedTime: 60,
          name: 'foo'
        },
        jobs: [
          {
            id: 'user|five|20130829T0000Z|foo|1',
            batchSysName: 'background',
            batchSysJobId: '22604',
            host: 'localhost',
            startedTime: '2019-11-05T02:55:49Z',
            submittedTime: '2019-11-05T02:55:47Z',
            finishedTime: '2019-11-05T02:56:49Z',
            state: 'succeeded',
            submitNum: 1
          }
        ]
      },
      {
        id: 'user|five|20130829T0000Z|bar',
        name: 'bar',
        state: 'succeeded',
        cyclePoint: '20130829T0000Z',
        latestMessage: 'succeeded',
        task: {
          meanElapsedTime: 59.900001525878906,
          name: 'bar'
        },
        jobs: [
          {
            id: 'user|five|20130829T0000Z|bar|1',
            batchSysName: 'background',
            batchSysJobId: '25886',
            host: 'localhost',
            startedTime: '2019-11-05T02:56:55Z',
            submittedTime: '2019-11-05T02:56:53Z',
            finishedTime: '2019-11-05T02:57:55Z',
            state: 'succeeded',
            submitNum: 1
          }
        ]
      },
      {
        id: 'user|five|20130829T1200Z|foo',
        name: 'foo',
        state: 'succeeded',
        cyclePoint: '20130829T1200Z',
        latestMessage: 'succeeded',
        task: {
          meanElapsedTime: 60,
          name: 'foo'
        },
        jobs: [
          {
            id: 'user|five|20130829T1200Z|foo|1',
            batchSysName: 'background',
            batchSysJobId: '25887',
            host: 'localhost',
            startedTime: '2019-11-05T02:56:55Z',
            submittedTime: '2019-11-05T02:56:53Z',
            finishedTime: '2019-11-05T02:57:55Z',
            state: 'succeeded',
            submitNum: 1
          }
        ]
      },
      {
        id: 'user|five|20130829T1200Z|bar',
        name: 'bar',
        state: 'running',
        cyclePoint: '20130829T1200Z',
        latestMessage: 'started',
        task: {
          meanElapsedTime: 59.900001525878906,
          name: 'bar'
        },
        jobs: [
          {
            id: 'user|five|20130829T1200Z|bar|1',
            batchSysName: 'background',
            batchSysJobId: '29059',
            host: 'localhost',
            startedTime: '2019-11-05T02:58:00Z',
            submittedTime: '2019-11-05T02:57:58Z',
            finishedTime: '',
            state: 'running',
            submitNum: 1
          }
        ]
      },
      {
        id: 'user|five|20130830T0000Z|foo',
        name: 'foo',
        state: 'running',
        cyclePoint: '20130830T0000Z',
        latestMessage: 'started',
        task: {
          meanElapsedTime: 60,
          name: 'foo'
        },
        jobs: [
          {
            id: 'user|five|20130830T0000Z|foo|1',
            batchSysName: 'background',
            batchSysJobId: '29061',
            host: 'localhost',
            startedTime: '2019-11-05T02:58:00Z',
            submittedTime: '2019-11-05T02:57:58Z',
            finishedTime: '',
            state: 'running',
            submitNum: 1
          }
        ]
      },
      {
        id: 'user|five|20130830T0000Z|bar',
        name: 'bar',
        state: 'waiting',
        cyclePoint: '20130830T0000Z',
        latestMessage: '',
        task: {
          meanElapsedTime: 59.900001525878906,
          name: 'bar'
        },
        jobs: []
      },
      {
        id: 'user|five|20130830T1200Z|foo',
        name: 'foo',
        state: 'waiting',
        cyclePoint: '20130830T1200Z',
        latestMessage: '',
        task: {
          meanElapsedTime: 60,
          name: 'foo'
        },
        jobs: []
      }
    ]
  }
]

export {
  simpleWorkflowGscanNodes
}
