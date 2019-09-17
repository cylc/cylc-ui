/* eslint-disable */

const checkpoint = {
    "workflows": [
        {
            "id": "cylc|one",
            "name": "one",
            "status": "running",
            "owner": "cylc",
            "host": "ranma",
            "port": 43043,
            "taskProxies": [
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
                            "batchSysJobId": "9129",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:41:55Z",
                            "submittedTime": "2019-09-17T06:41:54Z",
                            "finishedTime": "2019-09-17T06:41:55Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "9083",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:41:51Z",
                            "submittedTime": "2019-09-17T06:41:50Z",
                            "finishedTime": "2019-09-17T06:41:51Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "9038",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:41:48Z",
                            "submittedTime": "2019-09-17T06:41:47Z",
                            "finishedTime": "2019-09-17T06:41:48Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "8937",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:41:44Z",
                            "submittedTime": "2019-09-17T06:41:43Z",
                            "finishedTime": "2019-09-17T06:41:44Z",
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
                            "batchSysJobId": "9273",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:42:10Z",
                            "submittedTime": "2019-09-17T06:42:09Z",
                            "finishedTime": "2019-09-17T06:42:11Z",
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
                            "batchSysJobId": "9203",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:42:01Z",
                            "submittedTime": "2019-09-17T06:42:00Z",
                            "finishedTime": "2019-09-17T06:42:07Z",
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
                            "batchSysJobId": "9168",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:41:58Z",
                            "submittedTime": "2019-09-17T06:41:57Z",
                            "finishedTime": "2019-09-17T06:41:58Z",
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
                            "batchSysJobId": "9272",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:42:10Z",
                            "submittedTime": "2019-09-17T06:42:09Z",
                            "finishedTime": "2019-09-17T06:42:11Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|retrying",
                    "state": "retrying",
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2019-09-17T06:47:15Z)",
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "retrying"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|retrying|1",
                            "batchSysName": "background",
                            "batchSysJobId": "9343",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:42:14Z",
                            "submittedTime": "2019-09-17T06:42:13Z",
                            "finishedTime": "2019-09-17T06:42:14Z",
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
                        "meanElapsedTime": 0.0,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "8941",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:41:44Z",
                            "submittedTime": "2019-09-17T06:41:43Z",
                            "finishedTime": "2019-09-17T06:41:44Z",
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
                        "meanElapsedTime": 0.0,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "9346",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:42:14Z",
                            "submittedTime": "2019-09-17T06:42:13Z",
                            "finishedTime": "2019-09-17T06:42:14Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
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
                            "batchSysJobId": "9559",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:42:29Z",
                            "submittedTime": "2019-09-17T06:42:29Z",
                            "finishedTime": "2019-09-17T06:42:29Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|retrying",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2019-09-17T06:46:45Z)",
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "retrying"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|retrying|1",
                            "batchSysName": "background",
                            "batchSysJobId": "8938",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:41:44Z",
                            "submittedTime": "2019-09-17T06:41:43Z",
                            "finishedTime": "2019-09-17T06:41:44Z",
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
                            "batchSysJobId": "9595",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:42:32Z",
                            "submittedTime": "2019-09-17T06:42:32Z",
                            "finishedTime": "",
                            "state": "running",
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
                            "batchSysJobId": "9522",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:42:26Z",
                            "submittedTime": "2019-09-17T06:42:25Z",
                            "finishedTime": "2019-09-17T06:42:26Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|3",
                            "batchSysName": "background",
                            "batchSysJobId": "9478",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:42:22Z",
                            "submittedTime": "2019-09-17T06:42:21Z",
                            "finishedTime": "2019-09-17T06:42:22Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|2",
                            "batchSysName": "background",
                            "batchSysJobId": "9443",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:42:18Z",
                            "submittedTime": "2019-09-17T06:42:17Z",
                            "finishedTime": "2019-09-17T06:42:18Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|1",
                            "batchSysName": "background",
                            "batchSysJobId": "9342",
                            "host": "localhost",
                            "startedTime": "2019-09-17T06:42:14Z",
                            "submittedTime": "2019-09-17T06:42:13Z",
                            "finishedTime": "2019-09-17T06:42:14Z",
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
