/* eslint-disable */

const checkpoint = {
    "workflows": [
        {
            "id": "cylc|one",
            "name": "one",
            "status": "running",
            "owner": "cylc",
            "host": "cylc-VirtualBox",
            "port": 43056,
            "cyclePoints": [
                {
                    "cyclePoint": "20000102T0000Z"
                },
                {
                    "cyclePoint": "20000101T0000Z"
                }
            ],
            "taskProxies": [
                {
                    "id": "cylc|one|20000101T0000Z|sleepy",
                    "name": "sleepy",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "cylc|one|20000101T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000101T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "sleepy"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|sleepy|1",
                            "batchSysName": "background",
                            "batchSysJobId": "30145",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:57:27Z",
                            "submittedTime": "2020-03-01T22:57:25Z",
                            "finishedTime": "2020-03-01T22:57:28Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|retrying",
                    "name": "retrying",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2020-03-01T23:01:45Z)",
                    "firstParent": {
                        "id": "cylc|one|20000101T0000Z|BAD",
                        "name": "BAD",
                        "cyclePoint": "20000101T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "retrying"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|retrying|1",
                            "batchSysName": "background",
                            "batchSysJobId": "29278",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:56:43Z",
                            "submittedTime": "2020-03-01T22:56:41Z",
                            "finishedTime": "2020-03-01T22:56:44Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|failed",
                    "name": "failed",
                    "state": "failed",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "failed/EXIT",
                    "firstParent": {
                        "id": "cylc|one|20000101T0000Z|BAD",
                        "name": "BAD",
                        "cyclePoint": "20000101T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "failed"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|failed|1",
                            "batchSysName": "background",
                            "batchSysJobId": "29813",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:57:08Z",
                            "submittedTime": "2020-03-01T22:57:06Z",
                            "finishedTime": "2020-03-01T22:57:09Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|eventually_succeeded",
                    "name": "eventually_succeeded",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "cylc|one|20000101T0000Z|SUCCEEDED",
                        "name": "SUCCEEDED",
                        "cyclePoint": "20000101T0000Z",
                        "state": "succeeded"
                    },
                    "task": {
                        "meanElapsedTime": 1.5,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|4",
                            "batchSysName": "background",
                            "batchSysJobId": "29742",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:57:02Z",
                            "submittedTime": "2020-03-01T22:57:01Z",
                            "finishedTime": "2020-03-01T22:57:04Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "29597",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:56:57Z",
                            "submittedTime": "2020-03-01T22:56:55Z",
                            "finishedTime": "2020-03-01T22:56:58Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "29453",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:56:50Z",
                            "submittedTime": "2020-03-01T22:56:48Z",
                            "finishedTime": "2020-03-01T22:56:51Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "29277",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:56:43Z",
                            "submittedTime": "2020-03-01T22:56:41Z",
                            "finishedTime": "2020-03-01T22:56:44Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|succeeded",
                    "name": "succeeded",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "cylc|one|20000101T0000Z|SUCCEEDED",
                        "name": "SUCCEEDED",
                        "cyclePoint": "20000101T0000Z",
                        "state": "succeeded"
                    },
                    "task": {
                        "meanElapsedTime": 2.0,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "29280",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:56:43Z",
                            "submittedTime": "2020-03-01T22:56:41Z",
                            "finishedTime": "2020-03-01T22:56:45Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|waiting",
                    "name": "waiting",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "cylc|one|20000101T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000101T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "waiting"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|waiting|1",
                            "batchSysName": "background",
                            "batchSysJobId": "30146",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:57:27Z",
                            "submittedTime": "2020-03-01T22:57:25Z",
                            "finishedTime": "2020-03-01T22:57:28Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|checkpoint",
                    "name": "checkpoint",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "cylc|one|20000101T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000101T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 9.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|checkpoint|1",
                            "batchSysName": "background",
                            "batchSysJobId": "29948",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:57:14Z",
                            "submittedTime": "2020-03-01T22:57:13Z",
                            "finishedTime": "2020-03-01T22:57:23Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|checkpoint",
                    "name": "checkpoint",
                    "state": "running",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "started",
                    "firstParent": {
                        "id": "cylc|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 9.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|checkpoint|1",
                            "batchSysName": "background",
                            "batchSysJobId": "31000",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:58:03Z",
                            "submittedTime": "2020-03-01T22:58:01Z",
                            "state": "running",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|waiting",
                    "name": "waiting",
                    "state": "waiting",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "cylc|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "waiting"
                    }
                },
                {
                    "id": "cylc|one|20000102T0000Z|sleepy",
                    "name": "sleepy",
                    "state": "waiting",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "cylc|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "sleepy"
                    }
                },
                {
                    "id": "cylc|one|20000102T0000Z|retrying",
                    "name": "retrying",
                    "state": "retrying",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2020-03-01T23:02:35Z)",
                    "firstParent": {
                        "id": "cylc|one|20000102T0000Z|BAD",
                        "name": "BAD",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "retrying"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|retrying|1",
                            "batchSysName": "background",
                            "batchSysJobId": "30334",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:57:33Z",
                            "submittedTime": "2020-03-01T22:57:31Z",
                            "finishedTime": "2020-03-01T22:57:34Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|failed",
                    "name": "failed",
                    "state": "failed",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "failed/EXIT",
                    "firstParent": {
                        "id": "cylc|one|20000102T0000Z|BAD",
                        "name": "BAD",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "failed"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|failed|1",
                            "batchSysName": "background",
                            "batchSysJobId": "30862",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:57:57Z",
                            "submittedTime": "2020-03-01T22:57:56Z",
                            "finishedTime": "2020-03-01T22:57:58Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|eventually_succeeded",
                    "name": "eventually_succeeded",
                    "state": "succeeded",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "cylc|one|20000102T0000Z|SUCCEEDED",
                        "name": "SUCCEEDED",
                        "cyclePoint": "20000102T0000Z",
                        "state": "succeeded"
                    },
                    "task": {
                        "meanElapsedTime": 1.5,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|4",
                            "batchSysName": "background",
                            "batchSysJobId": "30791",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:57:52Z",
                            "submittedTime": "2020-03-01T22:57:50Z",
                            "finishedTime": "2020-03-01T22:57:53Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "30654",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:57:46Z",
                            "submittedTime": "2020-03-01T22:57:44Z",
                            "finishedTime": "2020-03-01T22:57:47Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "30506",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:57:39Z",
                            "submittedTime": "2020-03-01T22:57:38Z",
                            "finishedTime": "2020-03-01T22:57:40Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "30333",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:57:33Z",
                            "submittedTime": "2020-03-01T22:57:31Z",
                            "finishedTime": "2020-03-01T22:57:34Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|succeeded",
                    "name": "succeeded",
                    "state": "succeeded",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "cylc|one|20000102T0000Z|SUCCEEDED",
                        "name": "SUCCEEDED",
                        "cyclePoint": "20000102T0000Z",
                        "state": "succeeded"
                    },
                    "task": {
                        "meanElapsedTime": 2.0,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "30337",
                            "host": "localhost",
                            "startedTime": "2020-03-01T22:57:33Z",
                            "submittedTime": "2020-03-01T22:57:31Z",
                            "finishedTime": "2020-03-01T22:57:35Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                }
            ],
            "familyProxies": [
                {
                    "id": "cylc|one|20000102T0000Z|root",
                    "name": "root",
                    "state": "failed",
                    "cyclePoint": "20000102T0000Z"
                },
                {
                    "id": "cylc|one|20000101T0000Z|root",
                    "name": "root",
                    "state": "failed",
                    "cyclePoint": "20000101T0000Z"
                },
                {
                    "id": "cylc|one|20000101T0000Z|SUCCEEDED",
                    "name": "SUCCEEDED",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "firstParent": {
                        "id": "cylc|one|20000101T0000Z|GOOD",
                        "name": "GOOD",
                        "cyclePoint": "20000101T0000Z",
                        "state": "succeeded"
                    }
                },
                {
                    "id": "cylc|one|20000101T0000Z|BAD",
                    "name": "BAD",
                    "state": "failed",
                    "cyclePoint": "20000101T0000Z",
                    "firstParent": {
                        "id": "cylc|one|20000101T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000101T0000Z",
                        "state": "failed"
                    }
                },
                {
                    "id": "cylc|one|20000101T0000Z|GOOD",
                    "name": "GOOD",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "firstParent": {
                        "id": "cylc|one|20000101T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000101T0000Z",
                        "state": "failed"
                    }
                },
                {
                    "id": "cylc|one|20000102T0000Z|SUCCEEDED",
                    "name": "SUCCEEDED",
                    "state": "succeeded",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "cylc|one|20000102T0000Z|GOOD",
                        "name": "GOOD",
                        "cyclePoint": "20000102T0000Z",
                        "state": "succeeded"
                    }
                },
                {
                    "id": "cylc|one|20000102T0000Z|GOOD",
                    "name": "GOOD",
                    "state": "succeeded",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "cylc|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    }
                },
                {
                    "id": "cylc|one|20000102T0000Z|BAD",
                    "name": "BAD",
                    "state": "failed",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "cylc|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    }
                }
            ]
        }
    ]
}

export { checkpoint }
