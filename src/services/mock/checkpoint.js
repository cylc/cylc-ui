/* eslint-disable */
const checkpoint = {
    "workflows": [
        {
            "id": "user|one",
            "name": "one",
            "status": "running",
            "owner": "user",
            "host": "localhost",
            "port": 43038,
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
                    "id": "user|one|20000101T0000Z|failed",
                    "name": "failed",
                    "state": "failed",
                    "isHeld": false,
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "failed/EXIT",
                    "firstParent": {
                        "id": "user|one|20000101T0000Z|BAD",
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
                            "id": "user|one|20000101T0000Z|failed|1",
                            "batchSysName": "background",
                            "batchSysJobId": "19876",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:37:21Z",
                            "submittedTime": "2020-04-01T11:37:20Z",
                            "finishedTime": "2020-04-01T11:37:23Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000101T0000Z|retrying",
                    "name": "retrying",
                    "state": "succeeded",
                    "isHeld": false,
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2020-04-01T11:41:59Z)",
                    "firstParent": {
                        "id": "user|one|20000101T0000Z|BAD",
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
                            "id": "user|one|20000101T0000Z|retrying|1",
                            "batchSysName": "background",
                            "batchSysJobId": "19562",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:36:57Z",
                            "submittedTime": "2020-04-01T11:36:54Z",
                            "finishedTime": "2020-04-01T11:36:59Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000101T0000Z|sleepy",
                    "name": "sleepy",
                    "state": "succeeded",
                    "isHeld": false,
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "user|one|20000101T0000Z|root",
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
                            "id": "user|one|20000101T0000Z|sleepy|1",
                            "batchSysName": "background",
                            "batchSysJobId": "19994",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:37:41Z",
                            "submittedTime": "2020-04-01T11:37:39Z",
                            "finishedTime": "2020-04-01T11:37:42Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000101T0000Z|eventually_succeeded",
                    "name": "eventually_succeeded",
                    "state": "succeeded",
                    "isHeld": false,
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "user|one|20000101T0000Z|SUCCEEDED",
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
                            "id": "user|one|20000101T0000Z|eventually_succeeded|4",
                            "batchSysName": "background",
                            "batchSysJobId": "19825",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:37:15Z",
                            "submittedTime": "2020-04-01T11:37:14Z",
                            "finishedTime": "2020-04-01T11:37:17Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "user|one|20000101T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "19776",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:37:09Z",
                            "submittedTime": "2020-04-01T11:37:08Z",
                            "finishedTime": "2020-04-01T11:37:11Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "user|one|20000101T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "19696",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:37:03Z",
                            "submittedTime": "2020-04-01T11:37:02Z",
                            "finishedTime": "2020-04-01T11:37:05Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "user|one|20000101T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "19561",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:36:57Z",
                            "submittedTime": "2020-04-01T11:36:54Z",
                            "finishedTime": "2020-04-01T11:36:59Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000101T0000Z|succeeded",
                    "name": "succeeded",
                    "state": "succeeded",
                    "isHeld": false,
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "user|one|20000101T0000Z|SUCCEEDED",
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
                            "id": "user|one|20000101T0000Z|succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "19563",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:36:57Z",
                            "submittedTime": "2020-04-01T11:36:54Z",
                            "finishedTime": "2020-04-01T11:36:59Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000101T0000Z|checkpoint",
                    "name": "checkpoint",
                    "state": "succeeded",
                    "isHeld": false,
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "user|one|20000101T0000Z|root",
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
                            "id": "user|one|20000101T0000Z|checkpoint|1",
                            "batchSysName": "background",
                            "batchSysJobId": "19926",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:37:27Z",
                            "submittedTime": "2020-04-01T11:37:26Z",
                            "finishedTime": "2020-04-01T11:37:36Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000101T0000Z|waiting",
                    "name": "waiting",
                    "state": "succeeded",
                    "isHeld": false,
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "user|one|20000101T0000Z|root",
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
                            "id": "user|one|20000101T0000Z|waiting|1",
                            "batchSysName": "background",
                            "batchSysJobId": "19995",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:37:41Z",
                            "submittedTime": "2020-04-01T11:37:39Z",
                            "finishedTime": "2020-04-01T11:37:42Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000102T0000Z|eventually_succeeded",
                    "name": "eventually_succeeded",
                    "state": "succeeded",
                    "isHeld": false,
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|SUCCEEDED",
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
                            "id": "user|one|20000102T0000Z|eventually_succeeded|4",
                            "batchSysName": "background",
                            "batchSysJobId": "20319",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:38:08Z",
                            "submittedTime": "2020-04-01T11:38:06Z",
                            "finishedTime": "2020-04-01T11:38:09Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "20272",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:38:01Z",
                            "submittedTime": "2020-04-01T11:37:59Z",
                            "finishedTime": "2020-04-01T11:38:02Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "20225",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:37:55Z",
                            "submittedTime": "2020-04-01T11:37:53Z",
                            "finishedTime": "2020-04-01T11:37:56Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "20090",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:37:48Z",
                            "submittedTime": "2020-04-01T11:37:45Z",
                            "finishedTime": "2020-04-01T11:37:50Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000102T0000Z|checkpoint",
                    "name": "checkpoint",
                    "state": "running",
                    "isHeld": false,
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "started",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
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
                            "id": "user|one|20000102T0000Z|checkpoint|1",
                            "batchSysName": "background",
                            "batchSysJobId": "20415",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:38:20Z",
                            "submittedTime": "2020-04-01T11:38:18Z",
                            "finishedTime": "",
                            "state": "running",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000102T0000Z|succeeded",
                    "name": "succeeded",
                    "state": "succeeded",
                    "isHeld": false,
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "succeeded",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|SUCCEEDED",
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
                            "id": "user|one|20000102T0000Z|succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "20092",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:37:48Z",
                            "submittedTime": "2020-04-01T11:37:45Z",
                            "finishedTime": "2020-04-01T11:37:50Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000102T0000Z|waiting",
                    "name": "waiting",
                    "state": "waiting",
                    "isHeld": false,
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "waiting"
                    },
                    "jobs": []
                },
                {
                    "id": "user|one|20000102T0000Z|retrying",
                    "name": "retrying",
                    "state": "retrying",
                    "isHeld": false,
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2020-04-01T11:42:51Z)",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|BAD",
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
                            "id": "user|one|20000102T0000Z|retrying|1",
                            "batchSysName": "background",
                            "batchSysJobId": "20091",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:37:48Z",
                            "submittedTime": "2020-04-01T11:37:45Z",
                            "finishedTime": "2020-04-01T11:37:50Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000102T0000Z|sleepy",
                    "name": "sleepy",
                    "state": "waiting",
                    "isHeld": true,
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    },
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "sleepy"
                    },
                    "jobs": []
                },
                {
                    "id": "user|one|20000102T0000Z|failed",
                    "name": "failed",
                    "state": "failed",
                    "isHeld": false,
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "failed/EXIT",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|BAD",
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
                            "id": "user|one|20000102T0000Z|failed|1",
                            "batchSysName": "background",
                            "batchSysJobId": "20367",
                            "host": "localhost",
                            "startedTime": "2020-04-01T11:38:14Z",
                            "submittedTime": "2020-04-01T11:38:12Z",
                            "finishedTime": "2020-04-01T11:38:15Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                }
            ],
            "familyProxies": [
                {
                    "id": "user|one|20000101T0000Z|SUCCEEDED",
                    "name": "SUCCEEDED",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "firstParent": {
                        "id": "user|one|20000101T0000Z|GOOD",
                        "name": "GOOD",
                        "cyclePoint": "20000101T0000Z",
                        "state": "succeeded"
                    }
                },
                {
                    "id": "user|one|20000101T0000Z|GOOD",
                    "name": "GOOD",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "firstParent": {
                        "id": "user|one|20000101T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000101T0000Z",
                        "state": "failed"
                    }
                },
                {
                    "id": "user|one|20000101T0000Z|BAD",
                    "name": "BAD",
                    "state": "failed",
                    "cyclePoint": "20000101T0000Z",
                    "firstParent": {
                        "id": "user|one|20000101T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000101T0000Z",
                        "state": "failed"
                    }
                },
                {
                    "id": "user|one|20000102T0000Z|SUCCEEDED",
                    "name": "SUCCEEDED",
                    "state": "succeeded",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|GOOD",
                        "name": "GOOD",
                        "cyclePoint": "20000102T0000Z",
                        "state": "succeeded"
                    }
                },
                {
                    "id": "user|one|20000102T0000Z|BAD",
                    "name": "BAD",
                    "state": "failed",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "failed"
                    }
                },
                {
                    "id": "user|one|20000102T0000Z|GOOD",
                    "name": "GOOD",
                    "state": "succeeded",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
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
