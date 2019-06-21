import store from '@/store/'
import Family from '@/model/Family.model'

export class SuiteService {

  constructor(currentTaskIndex = 0) {
    this.currentTaskIndex = currentTaskIndex;
  }

  getSuites() {
    return store.dispatch('suites/setSuites', SuiteService.MOCKED_SUITES);
  }

  // suppressing because it is not used in the mock
  // eslint-disable-next-line no-unused-vars
  getSuiteTasks(suiteId) {
    const mockedFamilyProxies = SuiteService.MOCKED_SUITE_TASKS[this.currentTaskIndex].data.familyProxies;
    const familyProxies = mockedFamilyProxies.map((mockedFamilyProxy) => {
      return new Family(mockedFamilyProxy.name, mockedFamilyProxy.cyclePoint, mockedFamilyProxy.state, mockedFamilyProxy.depth, mockedFamilyProxy.childTasks);
    });
    return store.dispatch('suites/setTasks', familyProxies);
  }

  // Mocked data, recorded with vcrpy

  // https://github.com/kinow/cylc-cassettes/tree/master/cassettes/five/suite.yaml
  static MOCKED_SUITES = [
    {
      "id": "kinow/five",
      "name": "five",
      "host": "kinow-VirtualBox",
      "owner": "kinow",
      "port": 43027
    }
  ]

  // https://github.com/kinow/cylc-cassettes/tree/master/cassettes/kinow/five/tasks-?.yaml
  static MOCKED_SUITE_TASKS = [
    {
      "data":{
        "workflows":[
          {
            "id":"kinow/five",
            "name":"five",
            "status":"held",
            "stateTotals":{
              "runahead":0,
              "waiting":0,
              "held":3,
              "queued":0,
              "expired":0,
              "ready":0,
              "submitFailed":0,
              "submitRetrying":0,
              "submitted":0,
              "retrying":0,
              "running":0,
              "failed":0,
              "succeeded":0
            },
            "treeDepth":1
          }
        ],
        "familyProxies":[
          {
            "name":"root",
            "cyclePoint":"20130808T0000Z",
            "state":"held",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130808T0000Z/prep",
                "state":"held",
                "latestMessage":"",
                "depth":1,
                "jobs":[

                ]
              },
              {
                "id":"kinow/five/20130808T0000Z/foo",
                "state":"held",
                "latestMessage":"",
                "depth":1,
                "jobs":[

                ]
              },
              {
                "id":"kinow/five/20130808T0000Z/bar",
                "state":"held",
                "latestMessage":"",
                "depth":1,
                "jobs":[

                ]
              }
            ],
            "childFamilies":[

            ]
          }
        ]
      }
    },
    {
      "data":{
        "workflows":[
          {
            "id":"kinow/five",
            "name":"five",
            "status":"running to stop at 20130812T0000Z",
            "stateTotals":{
              "runahead":0,
              "waiting":1,
              "held":0,
              "queued":0,
              "expired":0,
              "ready":1,
              "submitFailed":0,
              "submitRetrying":0,
              "submitted":0,
              "retrying":0,
              "running":0,
              "failed":0,
              "succeeded":1
            },
            "treeDepth":1
          }
        ],
        "familyProxies":[
          {
            "name":"root",
            "cyclePoint":"20130808T0000Z",
            "state":"ready",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130808T0000Z/prep",
                "state":"succeeded",
                "latestMessage":"succeeded",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130808T0000Z/prep/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"11841",
                    "submittedTime":"2019-05-29T23:21:37Z",
                    "startedTime":"2019-05-29T23:21:37Z",
                    "finishedTime":"2019-05-29T23:21:37Z",
                    "submitNum":1
                  }
                ]
              },
              {
                "id":"kinow/five/20130808T0000Z/foo",
                "state":"ready",
                "latestMessage":"",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130808T0000Z/foo/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"",
                    "submittedTime":"",
                    "startedTime":"",
                    "finishedTime":"",
                    "submitNum":1
                  }
                ]
              },
              {
                "id":"kinow/five/20130808T0000Z/bar",
                "state":"waiting",
                "latestMessage":"",
                "depth":1,
                "jobs":[

                ]
              }
            ],
            "childFamilies":[

            ]
          }
        ]
      }
    },
    {
      "data":{
        "workflows":[
          {
            "id":"kinow/five",
            "name":"five",
            "status":"running to stop at 20130812T0000Z",
            "stateTotals":{
              "runahead":0,
              "waiting":2,
              "held":0,
              "queued":0,
              "expired":0,
              "ready":0,
              "submitFailed":0,
              "submitRetrying":0,
              "submitted":0,
              "retrying":0,
              "running":0,
              "failed":0,
              "succeeded":4
            },
            "treeDepth":1
          }
        ],
        "familyProxies":[
          {
            "name":"root",
            "cyclePoint":"20130808T0000Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130808T0000Z/foo",
                "state":"succeeded",
                "latestMessage":"succeeded",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130808T0000Z/foo/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"11883",
                    "submittedTime":"2019-05-29T23:21:40Z",
                    "startedTime":"2019-05-29T23:21:40Z",
                    "finishedTime":"2019-05-29T23:21:40Z",
                    "submitNum":1
                  }
                ]
              },
              {
                "id":"kinow/five/20130808T0000Z/bar",
                "state":"succeeded",
                "latestMessage":"succeeded",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130808T0000Z/bar/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"11923",
                    "submittedTime":"2019-05-29T23:21:43Z",
                    "startedTime":"2019-05-29T23:21:43Z",
                    "finishedTime":"2019-05-29T23:21:43Z",
                    "submitNum":1
                  }
                ]
              }
            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130808T1200Z",
            "state":"waiting",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130808T1200Z/foo",
                "state":"succeeded",
                "latestMessage":"succeeded",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130808T1200Z/foo/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"11924",
                    "submittedTime":"2019-05-29T23:21:43Z",
                    "startedTime":"2019-05-29T23:21:43Z",
                    "finishedTime":"2019-05-29T23:21:43Z",
                    "submitNum":1
                  }
                ]
              },
              {
                "id":"kinow/five/20130808T1200Z/bar",
                "state":"waiting",
                "latestMessage":"",
                "depth":1,
                "jobs":[

                ]
              }
            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130809T0000Z",
            "state":"waiting",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130809T0000Z/foo",
                "state":"waiting",
                "latestMessage":"",
                "depth":1,
                "jobs":[

                ]
              }
            ],
            "childFamilies":[

            ]
          }
        ]
      }
    },
    {
      "data":{
        "workflows":[
          {
            "id":"kinow/five",
            "name":"five",
            "status":"running to stop at 20130812T0000Z",
            "stateTotals":{
              "runahead":0,
              "waiting":2,
              "held":0,
              "queued":0,
              "expired":0,
              "ready":0,
              "submitFailed":0,
              "submitRetrying":0,
              "submitted":0,
              "retrying":0,
              "running":2,
              "failed":0,
              "succeeded":6
            },
            "treeDepth":1
          }
        ],
        "familyProxies":[
          {
            "name":"root",
            "cyclePoint":"20130808T0000Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130808T1200Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130809T0000Z",
            "state":"running",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130809T0000Z/foo",
                "state":"succeeded",
                "latestMessage":"succeeded",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130809T0000Z/foo/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"11996",
                    "submittedTime":"2019-05-29T23:21:46Z",
                    "startedTime":"2019-05-29T23:21:46Z",
                    "finishedTime":"2019-05-29T23:21:46Z",
                    "submitNum":1
                  }
                ]
              },
              {
                "id":"kinow/five/20130809T0000Z/bar",
                "state":"running",
                "latestMessage":"started",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130809T0000Z/bar/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"12067",
                    "submittedTime":"2019-05-29T23:21:49Z",
                    "startedTime":"2019-05-29T23:21:49Z",
                    "finishedTime":"",
                    "submitNum":1
                  }
                ]
              }
            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130809T1200Z",
            "state":"running",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130809T1200Z/bar",
                "state":"waiting",
                "latestMessage":"",
                "depth":1,
                "jobs":[

                ]
              },
              {
                "id":"kinow/five/20130809T1200Z/foo",
                "state":"running",
                "latestMessage":"started",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130809T1200Z/foo/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"12068",
                    "submittedTime":"2019-05-29T23:21:49Z",
                    "startedTime":"2019-05-29T23:21:49Z",
                    "finishedTime":"",
                    "submitNum":1
                  }
                ]
              }
            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130810T0000Z",
            "state":"waiting",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130810T0000Z/foo",
                "state":"waiting",
                "latestMessage":"",
                "depth":1,
                "jobs":[

                ]
              }
            ],
            "childFamilies":[

            ]
          }
        ]
      }
    },
    {
      "data":{
        "workflows":[
          {
            "id":"kinow/five",
            "name":"five",
            "status":"running to stop at 20130812T0000Z",
            "stateTotals":{
              "runahead":0,
              "waiting":0,
              "held":0,
              "queued":0,
              "expired":0,
              "ready":2,
              "submitFailed":0,
              "submitRetrying":0,
              "submitted":0,
              "retrying":0,
              "running":0,
              "failed":0,
              "succeeded":10
            },
            "treeDepth":1
          }
        ],
        "familyProxies":[
          {
            "name":"root",
            "cyclePoint":"20130808T0000Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130808T1200Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130809T0000Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130809T1200Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130810T0000Z",
            "state":"ready",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130810T0000Z/foo",
                "state":"succeeded",
                "latestMessage":"succeeded",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130810T0000Z/foo/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"12140",
                    "submittedTime":"2019-05-29T23:21:52Z",
                    "startedTime":"2019-05-29T23:21:52Z",
                    "finishedTime":"2019-05-29T23:21:52Z",
                    "submitNum":1
                  }
                ]
              },
              {
                "id":"kinow/five/20130810T0000Z/bar",
                "state":"ready",
                "latestMessage":"",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130810T0000Z/bar/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"",
                    "submittedTime":"",
                    "startedTime":"",
                    "finishedTime":"",
                    "submitNum":1
                  }
                ]
              }
            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130810T1200Z",
            "state":"ready",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130810T1200Z/foo",
                "state":"ready",
                "latestMessage":"",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130810T1200Z/foo/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"",
                    "submittedTime":"",
                    "startedTime":"",
                    "finishedTime":"",
                    "submitNum":1
                  }
                ]
              }
            ],
            "childFamilies":[

            ]
          }
        ]
      }
    },
    {
      "data":{
        "workflows":[
          {
            "id":"kinow/five",
            "name":"five",
            "status":"running to stop at 20130812T0000Z",
            "stateTotals":{
              "runahead":0,
              "waiting":2,
              "held":0,
              "queued":0,
              "expired":0,
              "ready":0,
              "submitFailed":0,
              "submitRetrying":0,
              "submitted":0,
              "retrying":0,
              "running":0,
              "failed":0,
              "succeeded":14
            },
            "treeDepth":1
          }
        ],
        "familyProxies":[
          {
            "name":"root",
            "cyclePoint":"20130808T0000Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130808T1200Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130809T0000Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130809T1200Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130810T0000Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130810T1200Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130810T1200Z/foo",
                "state":"succeeded",
                "latestMessage":"succeeded",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130810T1200Z/foo/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"12212",
                    "submittedTime":"2019-05-29T23:21:55Z",
                    "startedTime":"2019-05-29T23:21:55Z",
                    "finishedTime":"2019-05-29T23:21:55Z",
                    "submitNum":1
                  }
                ]
              },
              {
                "id":"kinow/five/20130810T1200Z/bar",
                "state":"succeeded",
                "latestMessage":"succeeded",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130810T1200Z/bar/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"12283",
                    "submittedTime":"2019-05-29T23:21:58Z",
                    "startedTime":"2019-05-29T23:21:58Z",
                    "finishedTime":"2019-05-29T23:21:58Z",
                    "submitNum":1
                  }
                ]
              }
            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130811T0000Z",
            "state":"waiting",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130811T0000Z/foo",
                "state":"succeeded",
                "latestMessage":"succeeded",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130811T0000Z/foo/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"12284",
                    "submittedTime":"2019-05-29T23:21:58Z",
                    "startedTime":"2019-05-29T23:21:58Z",
                    "finishedTime":"2019-05-29T23:21:58Z",
                    "submitNum":1
                  }
                ]
              },
              {
                "id":"kinow/five/20130811T0000Z/bar",
                "state":"waiting",
                "latestMessage":"",
                "depth":1,
                "jobs":[

                ]
              }
            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130811T1200Z",
            "state":"waiting",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130811T1200Z/foo",
                "state":"waiting",
                "latestMessage":"",
                "depth":1,
                "jobs":[

                ]
              }
            ],
            "childFamilies":[

            ]
          }
        ]
      }
    },
    {
      "data":{
        "workflows":[
          {
            "id":"kinow/five",
            "name":"five",
            "status":"running to stop at 20130812T0000Z",
            "stateTotals":{
              "runahead":0,
              "waiting":2,
              "held":0,
              "queued":0,
              "expired":0,
              "ready":0,
              "submitFailed":0,
              "submitRetrying":0,
              "submitted":0,
              "retrying":0,
              "running":2,
              "failed":0,
              "succeeded":16
            },
            "treeDepth":1
          }
        ],
        "familyProxies":[
          {
            "name":"root",
            "cyclePoint":"20130808T0000Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130808T1200Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130809T0000Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130809T1200Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130810T0000Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130810T1200Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130811T0000Z",
            "state":"succeeded",
            "depth":0,
            "childTasks":[

            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130811T1200Z",
            "state":"running",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130811T1200Z/foo",
                "state":"succeeded",
                "latestMessage":"succeeded",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130811T1200Z/foo/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"12356",
                    "submittedTime":"2019-05-29T23:22:01Z",
                    "startedTime":"2019-05-29T23:22:01Z",
                    "finishedTime":"2019-05-29T23:22:01Z",
                    "submitNum":1
                  }
                ]
              },
              {
                "id":"kinow/five/20130811T1200Z/bar",
                "state":"running",
                "latestMessage":"started",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130811T1200Z/bar/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"12429",
                    "submittedTime":"2019-05-29T23:22:04Z",
                    "startedTime":"2019-05-29T23:22:04Z",
                    "finishedTime":"",
                    "submitNum":1
                  }
                ]
              }
            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130812T0000Z",
            "state":"running",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130812T0000Z/bar",
                "state":"waiting",
                "latestMessage":"",
                "depth":1,
                "jobs":[

                ]
              },
              {
                "id":"kinow/five/20130812T0000Z/foo",
                "state":"running",
                "latestMessage":"started",
                "depth":1,
                "jobs":[
                  {
                    "id":"kinow/five/20130812T0000Z/foo/01",
                    "host":"localhost",
                    "batchSysName":"background",
                    "batchSysJobId":"12430",
                    "submittedTime":"2019-05-29T23:22:04Z",
                    "startedTime":"2019-05-29T23:22:04Z",
                    "finishedTime":"",
                    "submitNum":1
                  }
                ]
              }
            ],
            "childFamilies":[

            ]
          },
          {
            "name":"root",
            "cyclePoint":"20130812T1200Z",
            "state":"waiting",
            "depth":0,
            "childTasks":[
              {
                "id":"kinow/five/20130812T1200Z/foo",
                "state":"waiting",
                "latestMessage":"",
                "depth":1,
                "jobs":[

                ]
              }
            ],
            "childFamilies":[

            ]
          }
        ]
      }
    }
  ]
}
