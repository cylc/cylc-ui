/* eslint-disable */

const checkpoint = {
    "workflows": [
        {
            "id": "cylc|one",
            "name": "one",
            "status": "running",
            "owner": "cylc",
            "host": "ranma",
            "port": 43007,
            "taskProxies": [
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
                            "batchSysJobId": "16314",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:53:02Z",
                            "submittedTime": "2019-09-17T06:53:02Z",
                            "finishedTime": "2019-09-17T06:53:03Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
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
                            "batchSysJobId": "15657",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:43Z",
                            "submittedTime": "2019-09-17T06:52:43Z",
                            "finishedTime": "2019-09-17T06:52:44Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|succeeded",
                    "state": "succeeded",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "succeeded",
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "15808",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:47Z",
                            "submittedTime": "2019-09-17T06:52:47Z",
                            "finishedTime": "2019-09-17T06:52:48Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|retrying",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2019-09-17T06:57:17Z)",
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "retrying"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|retrying|1",
                            "batchSysName": "background",
                            "batchSysJobId": "14817",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:16Z",
                            "submittedTime": "2019-09-17T06:52:16Z",
                            "finishedTime": "2019-09-17T06:52:17Z",
                            "state": "failed",
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
                        "meanElapsedTime": 1.0,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|4",
                            "batchSysName": "background",
                            "batchSysJobId": "15219",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:28Z",
                            "submittedTime": "2019-09-17T06:52:28Z",
                            "finishedTime": "2019-09-17T06:52:29Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "15082",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:24Z",
                            "submittedTime": "2019-09-17T06:52:24Z",
                            "finishedTime": "2019-09-17T06:52:25Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "14949",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:20Z",
                            "submittedTime": "2019-09-17T06:52:20Z",
                            "finishedTime": "2019-09-17T06:52:21Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "14816",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:16Z",
                            "submittedTime": "2019-09-17T06:52:16Z",
                            "finishedTime": "2019-09-17T06:52:17Z",
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
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|4",
                            "batchSysName": "background",
                            "batchSysJobId": "16201",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:59Z",
                            "submittedTime": "2019-09-17T06:52:59Z",
                            "finishedTime": "2019-09-17T06:53:00Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "16068",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:55Z",
                            "submittedTime": "2019-09-17T06:52:55Z",
                            "finishedTime": "2019-09-17T06:52:56Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "16006",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:51Z",
                            "submittedTime": "2019-09-17T06:52:51Z",
                            "finishedTime": "2019-09-17T06:52:52Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "15804",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:47Z",
                            "submittedTime": "2019-09-17T06:52:47Z",
                            "finishedTime": "2019-09-17T06:52:48Z",
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
                        "meanElapsedTime": 1.0,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "14822",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:16Z",
                            "submittedTime": "2019-09-17T06:52:16Z",
                            "finishedTime": "2019-09-17T06:52:17Z",
                            "state": "succeeded",
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
                        "meanElapsedTime": 6.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|checkpoint|1",
                            "batchSysName": "background",
                            "batchSysJobId": "15394",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:34Z",
                            "submittedTime": "2019-09-17T06:52:34Z",
                            "finishedTime": "2019-09-17T06:52:40Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|retrying",
                    "state": "retrying",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2019-09-17T06:57:48Z)",
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "retrying"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|retrying|1",
                            "batchSysName": "background",
                            "batchSysJobId": "15805",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:47Z",
                            "submittedTime": "2019-09-17T06:52:47Z",
                            "finishedTime": "2019-09-17T06:52:48Z",
                            "state": "failed",
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
                            "batchSysJobId": "15658",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:43Z",
                            "submittedTime": "2019-09-17T06:52:43Z",
                            "finishedTime": "2019-09-17T06:52:44Z",
                            "state": "succeeded",
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
                            "batchSysJobId": "15331",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:52:31Z",
                            "submittedTime": "2019-09-17T06:52:31Z",
                            "finishedTime": "2019-09-17T06:52:32Z",
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
                        "meanElapsedTime": 6.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|checkpoint|1",
                            "batchSysName": "background",
                            "batchSysJobId": "16376",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:53:05Z",
                            "submittedTime": "2019-09-17T06:53:05Z",
                            "finishedTime": "",
                            "state": "running",
                            "submitNum": 1
                        }
                    ]
                }
            ]
        }
    ]
}

export { checkpoint }
