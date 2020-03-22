/* eslint-disable */

const checkpoint = {
    "workflows": [
        {
            "id": "cylc|one",
            "name": "one",
            "status": "running",
            "owner": "cylc",
            "host": "ranma",
            "port": 43098,
            "cyclePoints": [
                {
                    "cyclePoint": "20000101T0000Z"
                },
                {
                    "cyclePoint": "20000102T0000Z"
                }
            ],
            "taskProxies": [
                {
                    "id": "cylc|one|20000101T0000Z|retrying",
                    "name": "retrying",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2020-03-22T22:16:24Z)",
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
                            "batchSysJobId": "11743",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:23Z",
                            "submittedTime": "2020-03-22T22:11:23Z",
                            "finishedTime": "2020-03-22T22:11:24Z",
                            "state": "failed",
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
                            "batchSysJobId": "12063",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:54Z",
                            "submittedTime": "2020-03-22T22:11:54Z",
                            "finishedTime": "2020-03-22T22:11:55Z",
                            "state": "succeeded",
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
                        "meanElapsedTime": 1.0,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "11746",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:23Z",
                            "submittedTime": "2020-03-22T22:11:23Z",
                            "finishedTime": "2020-03-22T22:11:24Z",
                            "state": "succeeded",
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
                            "batchSysJobId": "11951",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:40Z",
                            "submittedTime": "2020-03-22T22:11:40Z",
                            "finishedTime": "2020-03-22T22:11:41Z",
                            "state": "failed",
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
                        "meanElapsedTime": 7.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|checkpoint|1",
                            "batchSysName": "background",
                            "batchSysJobId": "11986",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:44Z",
                            "submittedTime": "2020-03-22T22:11:43Z",
                            "finishedTime": "2020-03-22T22:11:51Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
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
                            "batchSysJobId": "12062",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:54Z",
                            "submittedTime": "2020-03-22T22:11:54Z",
                            "finishedTime": "2020-03-22T22:11:55Z",
                            "state": "succeeded",
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
                        "meanElapsedTime": 0.5,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|4",
                            "batchSysName": "background",
                            "batchSysJobId": "11915",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:37Z",
                            "submittedTime": "2020-03-22T22:11:36Z",
                            "finishedTime": "2020-03-22T22:11:37Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "11880",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:32Z",
                            "submittedTime": "2020-03-22T22:11:32Z",
                            "finishedTime": "2020-03-22T22:11:33Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "11843",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:28Z",
                            "submittedTime": "2020-03-22T22:11:27Z",
                            "finishedTime": "2020-03-22T22:11:28Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "11742",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:23Z",
                            "submittedTime": "2020-03-22T22:11:23Z",
                            "finishedTime": "2020-03-22T22:11:24Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|retrying",
                    "name": "retrying",
                    "state": "retrying",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2020-03-22T22:17:00Z)",
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
                            "batchSysJobId": "12135",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:59Z",
                            "submittedTime": "2020-03-22T22:11:58Z",
                            "finishedTime": "2020-03-22T22:12:00Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|sleepy",
                    "name": "sleepy",
                    "state": "waiting",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "",
                    "firstParent": {
                        "id": "cylc|one|20000102T0000Z|root",
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
                    "id": "cylc|one|20000102T0000Z|waiting",
                    "name": "waiting",
                    "state": "waiting",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "",
                    "firstParent": {
                        "id": "cylc|one|20000102T0000Z|root",
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
                        "meanElapsedTime": 7.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|checkpoint|1",
                            "batchSysName": "background",
                            "batchSysJobId": "12395",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:12:19Z",
                            "submittedTime": "2020-03-22T22:12:19Z",
                            "finishedTime": "",
                            "state": "running",
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
                        "meanElapsedTime": 0.5,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|4",
                            "batchSysName": "background",
                            "batchSysJobId": "12324",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:12:12Z",
                            "submittedTime": "2020-03-22T22:12:12Z",
                            "finishedTime": "2020-03-22T22:12:13Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "12289",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:12:08Z",
                            "submittedTime": "2020-03-22T22:12:07Z",
                            "finishedTime": "2020-03-22T22:12:08Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "12238",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:12:03Z",
                            "submittedTime": "2020-03-22T22:12:03Z",
                            "finishedTime": "2020-03-22T22:12:04Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "12134",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:59Z",
                            "submittedTime": "2020-03-22T22:11:58Z",
                            "finishedTime": "2020-03-22T22:12:00Z",
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
                        "meanElapsedTime": 1.0,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "12138",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:11:59Z",
                            "submittedTime": "2020-03-22T22:11:58Z",
                            "finishedTime": "2020-03-22T22:12:00Z",
                            "state": "succeeded",
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
                            "batchSysJobId": "12360",
                            "host": "localhost",
                            "startedTime": "2020-03-22T22:12:16Z",
                            "submittedTime": "2020-03-22T22:12:15Z",
                            "finishedTime": "2020-03-22T22:12:16Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                }
            ],
            "familyProxies": [
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
                }
            ]
        }
    ]
}

export { checkpoint }
