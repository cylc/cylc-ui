/* eslint-disable */
const checkpoint = {
    "workflows": [
        {
            "id": "user|one",
            "name": "one",
            "status": "running",
            "owner": "user",
            "host": "localhost",
            "port": 43079,
            "stateTotals": {
                "waiting": 1,
                "expired": 0,
                "preparing": 0,
                "submit-failed": 0,
                "submitted": 3,
                "running": 1,
                "failed": 0,
                "succeeded": 0
            },
            "latestStateTasks": {
                "running": [
                    "running-task"
                ]
            },
            "cyclePoints": [
                {
                    "id": "user|one|20000102T0000Z|root",
                    "cyclePoint": "20000102T0000Z"
                }
            ],
            "taskProxies": [
                {
                    "id": "user|one|20000102T0000Z|checkpoint",
                    "name": "checkpoint",
                    "state": "running",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "running"
                    },
                    "task": {
                        "meanElapsedTime": 7.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000102T0000Z|checkpoint|1",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|checkpoint"
                            },
                            "jobRunnerName": "background",
                            "jobId": "61924",
                            "host": "localhost",
                            "startedTime": "2020-11-08T22:57:36Z",
                            "submittedTime": "2020-11-08T22:57:35Z",
                            "finishedTime": "",
                            "state": "running",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000102T0000Z|eventually_succeeded",
                    "name": "eventually_succeeded",
                    "state": "submitted",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|SUCCEEDED",
                        "name": "SUCCEEDED",
                        "cyclePoint": "20000102T0000Z",
                        "state": "submitted"
                    },
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|4",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|eventually_succeeded"
                            },
                            "jobRunnerName": "background",
                            "jobId": "61869",
                            "host": "localhost",
                            "startedTime": "2020-11-08T22:57:29Z",
                            "submittedTime": "2020-11-08T22:57:28Z",
                            "finishedTime": "2020-11-08T22:57:29Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|3",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|eventually_succeeded"
                            },
                            "jobRunnerName": "background",
                            "jobId": "61842",
                            "host": "localhost",
                            "startedTime": "2020-11-08T22:57:24Z",
                            "submittedTime": "2020-11-08T22:57:24Z",
                            "finishedTime": "2020-11-08T22:57:25Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|2",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|eventually_succeeded"
                            },
                            "jobRunnerName": "background",
                            "jobId": "61815",
                            "host": "localhost",
                            "startedTime": "2020-11-08T22:57:20Z",
                            "submittedTime": "2020-11-08T22:57:19Z",
                            "finishedTime": "2020-11-08T22:57:20Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|1",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|eventually_succeeded"
                            },
                            "jobRunnerName": "background",
                            "jobId": "61736",
                            "host": "localhost",
                            "startedTime": "2020-11-08T22:57:15Z",
                            "submittedTime": "2020-11-08T22:57:15Z",
                            "finishedTime": "2020-11-08T22:57:16Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000102T0000Z|failed",
                    "name": "failed",
                    "state": "submitted",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|BAD",
                        "name": "BAD",
                        "cyclePoint": "20000102T0000Z",
                        "state": "submitted"
                    },
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "failed"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000102T0000Z|failed|1",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|failed"
                            },
                            "jobRunnerName": "background",
                            "jobId": "61897",
                            "host": "localhost",
                            "startedTime": "2020-11-08T22:57:32Z",
                            "submittedTime": "2020-11-08T22:57:32Z",
                            "finishedTime": "2020-11-08T22:57:33Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000102T0000Z|retrying",
                    "name": "retrying",
                    "state": "waiting",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|BAD",
                        "name": "BAD",
                        "cyclePoint": "20000102T0000Z",
                        "state": "submitted"
                    },
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "retrying"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000102T0000Z|retrying|1",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|retrying"
                            },
                            "jobRunnerName": "background",
                            "jobId": "61737",
                            "host": "localhost",
                            "startedTime": "2020-11-08T22:57:15Z",
                            "submittedTime": "2020-11-08T22:57:15Z",
                            "finishedTime": "2020-11-08T22:57:16Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000102T0000Z|sleepy",
                    "name": "sleepy",
                    "state": "",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "running"
                    },
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "sleepy"
                    },
                    "jobs": []
                },
                {
                    "id": "user|one|20000102T0000Z|succeeded",
                    "name": "succeeded",
                    "state": "submitted",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|SUCCEEDED",
                        "name": "SUCCEEDED",
                        "cyclePoint": "20000102T0000Z",
                        "state": "submitted"
                    },
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000102T0000Z|succeeded|1",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|succeeded"
                            },
                            "jobRunnerName": "background",
                            "jobId": "61739",
                            "host": "localhost",
                            "startedTime": "2020-11-08T22:57:15Z",
                            "submittedTime": "2020-11-08T22:57:15Z",
                            "finishedTime": "2020-11-08T22:57:16Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000102T0000Z|waiting",
                    "name": "waiting",
                    "state": "",
                    "isHeld": false,
                    "isQueued": false,
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "running"
                    },
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "waiting"
                    },
                    "jobs": []
                }
            ],
            "familyProxies": [
                {
                    "id": "user|one|20000102T0000Z|BAD",
                    "name": "BAD",
                    "state": "submitted",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "running"
                    }
                },
                {
                    "id": "user|one|20000102T0000Z|GOOD",
                    "name": "GOOD",
                    "state": "submitted",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "running"
                    }
                },
                {
                    "id": "user|one|20000102T0000Z|SUCCEEDED",
                    "name": "SUCCEEDED",
                    "state": "submitted",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|GOOD",
                        "name": "GOOD",
                        "cyclePoint": "20000102T0000Z",
                        "state": "submitted"
                    }
                }
            ]
        }
    ]
}
export { checkpoint }
