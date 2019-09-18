/* eslint-disable */

const checkpoint = {
    "workflows": [
        {
            "id": "cylc|one",
            "name": "one",
            "status": "running",
            "owner": "cylc",
            "host": "ranma",
            "port": 43057,
            "taskProxies": [
                {
                    "id": "cylc|one|20000101T0000Z|sleepy",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "sleepy"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|sleepy|1",
                            "batchSysName": "background",
                            "batchSysJobId": "6675",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:37:01Z",
                            "submittedTime": "2019-09-18T04:37:01Z",
                            "finishedTime": "2019-09-18T04:37:02Z",
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
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|4",
                            "batchSysName": "background",
                            "batchSysJobId": "6516",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:36:46Z",
                            "submittedTime": "2019-09-18T04:36:45Z",
                            "finishedTime": "2019-09-18T04:36:46Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "6469",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:36:42Z",
                            "submittedTime": "2019-09-18T04:36:41Z",
                            "finishedTime": "2019-09-18T04:36:42Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "6428",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:36:38Z",
                            "submittedTime": "2019-09-18T04:36:37Z",
                            "finishedTime": "2019-09-18T04:36:38Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "6309",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:36:34Z",
                            "submittedTime": "2019-09-18T04:36:33Z",
                            "finishedTime": "2019-09-18T04:36:34Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|succeeded",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "task": {
                        "meanElapsedTime": 0.5,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "6313",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:36:34Z",
                            "submittedTime": "2019-09-18T04:36:33Z",
                            "finishedTime": "2019-09-18T04:36:34Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|retrying",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2019-09-18T04:41:34Z)",
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "retrying"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|retrying|1",
                            "batchSysName": "background",
                            "batchSysJobId": "6310",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:36:34Z",
                            "submittedTime": "2019-09-18T04:36:33Z",
                            "finishedTime": "2019-09-18T04:36:34Z",
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
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "failed"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|failed|1",
                            "batchSysName": "background",
                            "batchSysJobId": "6561",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:36:49Z",
                            "submittedTime": "2019-09-18T04:36:48Z",
                            "finishedTime": "2019-09-18T04:36:49Z",
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
                    "task": {
                        "meanElapsedTime": 7.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|checkpoint|1",
                            "batchSysName": "background",
                            "batchSysJobId": "6602",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:36:52Z",
                            "submittedTime": "2019-09-18T04:36:52Z",
                            "finishedTime": "2019-09-18T04:36:59Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|waiting",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "succeeded",
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "waiting"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|waiting|1",
                            "batchSysName": "background",
                            "batchSysJobId": "6676",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:37:01Z",
                            "submittedTime": "2019-09-18T04:37:01Z",
                            "finishedTime": "2019-09-18T04:37:02Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|sleepy",
                    "state": "waiting",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "",
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "sleepy"
                    },
                    "jobs": []
                },
                {
                    "id": "cylc|one|20000102T0000Z|succeeded",
                    "state": "succeeded",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "succeeded",
                    "task": {
                        "meanElapsedTime": 0.5,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "6759",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:37:05Z",
                            "submittedTime": "2019-09-18T04:37:05Z",
                            "finishedTime": "2019-09-18T04:37:06Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|eventually_succeeded",
                    "state": "succeeded",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "succeeded",
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|4",
                            "batchSysName": "background",
                            "batchSysJobId": "6954",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:37:17Z",
                            "submittedTime": "2019-09-18T04:37:17Z",
                            "finishedTime": "2019-09-18T04:37:17Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "6913",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:37:13Z",
                            "submittedTime": "2019-09-18T04:37:13Z",
                            "finishedTime": "2019-09-18T04:37:14Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "6872",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:37:09Z",
                            "submittedTime": "2019-09-18T04:37:09Z",
                            "finishedTime": "2019-09-18T04:37:10Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "6755",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:37:05Z",
                            "submittedTime": "2019-09-18T04:37:05Z",
                            "finishedTime": "2019-09-18T04:37:06Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|retrying",
                    "state": "retrying",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2019-09-18T04:42:06Z)",
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "retrying"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|retrying|1",
                            "batchSysName": "background",
                            "batchSysJobId": "6756",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:37:05Z",
                            "submittedTime": "2019-09-18T04:37:05Z",
                            "finishedTime": "2019-09-18T04:37:06Z",
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
                    "task": {
                        "meanElapsedTime": 7.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|checkpoint|1",
                            "batchSysName": "background",
                            "batchSysJobId": "7037",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:37:23Z",
                            "submittedTime": "2019-09-18T04:37:23Z",
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
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "failed"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|failed|1",
                            "batchSysName": "background",
                            "batchSysJobId": "6996",
                            "host": "localhost",
                            "startedTime": "2019-09-18T04:37:20Z",
                            "submittedTime": "2019-09-18T04:37:20Z",
                            "finishedTime": "2019-09-18T04:37:20Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                }
            ]
        }
    ]
}

export { checkpoint }
