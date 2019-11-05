/* eslint-disable */

const checkpoint = {
    "workflows": [
        {
            "id": "cylc|one",
            "name": "one",
            "status": "running",
            "owner": "cylc",
            "host": "ranma",
            "port": 43026,
            "taskProxies": [
                {
                    "id": "cylc|one|20000101T0000Z|waiting",
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
                            "batchSysJobId": "29872",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:17Z",
                            "submittedTime": "2019-11-05T22:18:17Z",
                            "finishedTime": "2019-11-05T22:18:18Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|eventually_succeeded",
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
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|4",
                            "batchSysName": "background",
                            "batchSysJobId": "29727",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:02Z",
                            "submittedTime": "2019-11-05T22:18:02Z",
                            "finishedTime": "2019-11-05T22:18:03Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "29689",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:17:58Z",
                            "submittedTime": "2019-11-05T22:17:58Z",
                            "finishedTime": "2019-11-05T22:17:59Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "29651",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:17:54Z",
                            "submittedTime": "2019-11-05T22:17:54Z",
                            "finishedTime": "2019-11-05T22:17:55Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "29542",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:17:50Z",
                            "submittedTime": "2019-11-05T22:17:50Z",
                            "finishedTime": "2019-11-05T22:17:51Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|checkpoint",
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
                            "batchSysJobId": "29804",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:08Z",
                            "submittedTime": "2019-11-05T22:18:08Z",
                            "finishedTime": "2019-11-05T22:18:15Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|succeeded",
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
                            "batchSysJobId": "29546",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:17:50Z",
                            "submittedTime": "2019-11-05T22:17:50Z",
                            "finishedTime": "2019-11-05T22:17:51Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|sleepy",
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
                            "batchSysJobId": "29871",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:17Z",
                            "submittedTime": "2019-11-05T22:18:17Z",
                            "finishedTime": "2019-11-05T22:18:18Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|retrying",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2019-11-05T22:22:51Z)",
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
                            "batchSysJobId": "29543",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:17:50Z",
                            "submittedTime": "2019-11-05T22:17:50Z",
                            "finishedTime": "2019-11-05T22:17:51Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|failed",
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
                            "batchSysJobId": "29766",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:05Z",
                            "submittedTime": "2019-11-05T22:18:05Z",
                            "finishedTime": "2019-11-05T22:18:06Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|sleepy",
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
                    "id": "cylc|one|20000102T0000Z|eventually_succeeded",
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
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|4",
                            "batchSysName": "background",
                            "batchSysJobId": "30131",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:33Z",
                            "submittedTime": "2019-11-05T22:18:33Z",
                            "finishedTime": "2019-11-05T22:18:34Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "30093",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:29Z",
                            "submittedTime": "2019-11-05T22:18:29Z",
                            "finishedTime": "2019-11-05T22:18:30Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "30055",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:25Z",
                            "submittedTime": "2019-11-05T22:18:25Z",
                            "finishedTime": "2019-11-05T22:18:26Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "29946",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:21Z",
                            "submittedTime": "2019-11-05T22:18:21Z",
                            "finishedTime": "2019-11-05T22:18:22Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|checkpoint",
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
                            "batchSysJobId": "30210",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:39Z",
                            "submittedTime": "2019-11-05T22:18:39Z",
                            "finishedTime": "",
                            "state": "running",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|waiting",
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
                    "id": "cylc|one|20000102T0000Z|failed",
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
                            "batchSysJobId": "30170",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:36Z",
                            "submittedTime": "2019-11-05T22:18:36Z",
                            "finishedTime": "2019-11-05T22:18:37Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|retrying",
                    "state": "retrying",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2019-11-05T22:23:22Z)",
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
                            "batchSysJobId": "29947",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:21Z",
                            "submittedTime": "2019-11-05T22:18:21Z",
                            "finishedTime": "2019-11-05T22:18:22Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|succeeded",
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
                            "batchSysJobId": "29950",
                            "host": "localhost",
                            "startedTime": "2019-11-05T22:18:21Z",
                            "submittedTime": "2019-11-05T22:18:21Z",
                            "finishedTime": "2019-11-05T22:18:22Z",
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
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": null
                },
                {
                    "id": "cylc|one|20000101T0000Z|root",
                    "name": "root",
                    "state": "failed",
                    "cyclePoint": "20000101T0000Z",
                    "firstParent": null
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
