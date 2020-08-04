/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* eslint-disable */
const checkpoint = {
    "workflows": [
        {
            "id": "user|one",
            "name": "one",
            "status": "running",
            "owner": "user",
            "host": "localhost",
            "port": 43007,
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
                            "firstParent": {
                                "id": "user|one|20000101T0000Z|sleepy"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17254",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:35Z",
                            "submittedTime": "2020-05-01T03:41:34Z",
                            "finishedTime": "2020-05-01T03:41:36Z",
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
                        "meanElapsedTime": 0.5,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000101T0000Z|eventually_succeeded|4",
                            "firstParent": {
                                "id": "user|one|20000101T0000Z|eventually_succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17123",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:17Z",
                            "submittedTime": "2020-05-01T03:41:16Z",
                            "finishedTime": "2020-05-01T03:41:18Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "user|one|20000101T0000Z|eventually_succeeded|3",
                            "firstParent": {
                                "id": "user|one|20000101T0000Z|eventually_succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17088",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:12Z",
                            "submittedTime": "2020-05-01T03:41:12Z",
                            "finishedTime": "2020-05-01T03:41:13Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "user|one|20000101T0000Z|eventually_succeeded|2",
                            "firstParent": {
                                "id": "user|one|20000101T0000Z|eventually_succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17053",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:08Z",
                            "submittedTime": "2020-05-01T03:41:07Z",
                            "finishedTime": "2020-05-01T03:41:09Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "user|one|20000101T0000Z|eventually_succeeded|1",
                            "firstParent": {
                                "id": "user|one|20000101T0000Z|eventually_succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "16951",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:04Z",
                            "submittedTime": "2020-05-01T03:41:03Z",
                            "finishedTime": "2020-05-01T03:41:04Z",
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
                    "latestMessage": "failed, retrying in PT5M (after 2020-05-01T03:46:04Z)",
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
                            "firstParent": {
                                "id": "user|one|20000101T0000Z|retrying"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "16952",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:04Z",
                            "submittedTime": "2020-05-01T03:41:03Z",
                            "finishedTime": "2020-05-01T03:41:04Z",
                            "state": "failed",
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
                        "meanElapsedTime": 7.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000101T0000Z|checkpoint|1",
                            "firstParent": {
                                "id": "user|one|20000101T0000Z|checkpoint"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17194",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:24Z",
                            "submittedTime": "2020-05-01T03:41:23Z",
                            "finishedTime": "2020-05-01T03:41:31Z",
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
                            "firstParent": {
                                "id": "user|one|20000101T0000Z|waiting"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17255",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:35Z",
                            "submittedTime": "2020-05-01T03:41:34Z",
                            "finishedTime": "2020-05-01T03:41:36Z",
                            "state": "succeeded",
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
                        "meanElapsedTime": 0.5,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000101T0000Z|succeeded|1",
                            "firstParent": {
                                "id": "user|one|20000101T0000Z|succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "16955",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:04Z",
                            "submittedTime": "2020-05-01T03:41:03Z",
                            "finishedTime": "2020-05-01T03:41:04Z",
                            "state": "succeeded",
                            "submitNum": 1
                        }
                    ]
                },
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
                            "firstParent": {
                                "id": "user|one|20000101T0000Z|failed"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17159",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:21Z",
                            "submittedTime": "2020-05-01T03:41:20Z",
                            "finishedTime": "2020-05-01T03:41:21Z",
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
                        "meanElapsedTime": 7.0,
                        "name": "checkpoint"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000102T0000Z|checkpoint|1",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|checkpoint"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17569",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:42:00Z",
                            "submittedTime": "2020-05-01T03:41:59Z",
                            "finishedTime": "",
                            "state": "running",
                            "submitNum": 1
                        }
                    ]
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
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|failed"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17534",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:56Z",
                            "submittedTime": "2020-05-01T03:41:55Z",
                            "finishedTime": "2020-05-01T03:41:57Z",
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
                    "id": "user|one|20000102T0000Z|retrying",
                    "name": "retrying",
                    "state": "retrying",
                    "isHeld": false,
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2020-05-01T03:46:40Z)",
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
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|retrying"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17325",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:39Z",
                            "submittedTime": "2020-05-01T03:41:38Z",
                            "finishedTime": "2020-05-01T03:41:40Z",
                            "state": "failed",
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
                        "meanElapsedTime": 0.5,
                        "name": "eventually_succeeded"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|4",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|eventually_succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17495",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:53Z",
                            "submittedTime": "2020-05-01T03:41:52Z",
                            "finishedTime": "2020-05-01T03:41:53Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|3",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|eventually_succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17460",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:48Z",
                            "submittedTime": "2020-05-01T03:41:47Z",
                            "finishedTime": "2020-05-01T03:41:49Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|2",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|eventually_succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17425",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:44Z",
                            "submittedTime": "2020-05-01T03:41:43Z",
                            "finishedTime": "2020-05-01T03:41:44Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|1",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|eventually_succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17324",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:39Z",
                            "submittedTime": "2020-05-01T03:41:38Z",
                            "finishedTime": "2020-05-01T03:41:40Z",
                            "state": "failed",
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
                        "meanElapsedTime": 0.5,
                        "name": "succeeded"
                    },
                    "jobs": [
                        {
                            "id": "user|one|20000102T0000Z|succeeded|1",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "17328",
                            "host": "localhost",
                            "startedTime": "2020-05-01T03:41:39Z",
                            "submittedTime": "2020-05-01T03:41:38Z",
                            "finishedTime": "2020-05-01T03:41:40Z",
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
                }
            ]
        }
    ]
}
export { checkpoint }
