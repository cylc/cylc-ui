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
                    "id": "cylc|one|20000102T0000Z|waiting",
                    "state": "waiting",
                    "cyclePoint": "20000102T0000Z",
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "waiting"
                    },
                    "jobs": []
                },
                {
                    "id": "cylc|one|20000101T0000Z|succeeded",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|succeeded|1",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:00Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|retrying",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "retrying"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|retrying|1",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:00Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|waiting",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "waiting"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|waiting|1",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:27Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|checkpoint",
                    "state": "running",
                    "cyclePoint": "20000102T0000Z",
                    "task": {
                        "meanElapsedTime": 6.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|checkpoint|1",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:49Z",
                            "state": "running",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|succeeded",
                    "state": "succeeded",
                    "cyclePoint": "20000102T0000Z",
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|succeeded|1",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:31Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|sleepy",
                    "state": "waiting",
                    "cyclePoint": "20000102T0000Z",
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "sleepy"
                    },
                    "jobs": []
                },
                {
                    "id": "cylc|one|20000101T0000Z|sleepy",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "task": {
                        "meanElapsedTime": 1.0,
                        "name": "sleepy"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|sleepy|1",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:27Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|eventually_succeeded",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "task": {
                        "meanElapsedTime": 0.5,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|4",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:12Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|3",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:08Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|2",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:04Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000101T0000Z|eventually_succeeded|1",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:00Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|failed",
                    "state": "failed",
                    "cyclePoint": "20000102T0000Z",
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "failed"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|failed|1",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:46Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|checkpoint",
                    "state": "succeeded",
                    "cyclePoint": "20000101T0000Z",
                    "task": {
                        "meanElapsedTime": 6.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|checkpoint|1",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:18Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000101T0000Z|failed",
                    "state": "failed",
                    "cyclePoint": "20000101T0000Z",
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "failed"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000101T0000Z|failed|1",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:15Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|eventually_succeeded",
                    "state": "succeeded",
                    "cyclePoint": "20000102T0000Z",
                    "task": {
                        "meanElapsedTime": 0.5,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|4",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:43Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|3",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:39Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|2",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:35Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "cylc|one|20000102T0000Z|eventually_succeeded|1",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:31Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "cylc|one|20000102T0000Z|retrying",
                    "state": "retrying",
                    "cyclePoint": "20000102T0000Z",
                    "task": {
                        "meanElapsedTime": 0.0,
                        "name": "retrying"
                    },
                    "jobs": [
                        {
                            "id": "cylc|one|20000102T0000Z|retrying|1",
                            "host": "localhost",
                            "startedTime": "2019-09-16T04:46:31Z",
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
