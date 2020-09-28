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
            "port": 43015,
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
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "started",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "retrying"
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
                            "batchSysJobId": "32528",
                            "host": "localhost",
                            "startedTime": "2020-09-28T01:22:35Z",
                            "submittedTime": "2020-09-28T01:22:34Z",
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
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "submitted",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|SUCCEEDED",
                        "name": "SUCCEEDED",
                        "cyclePoint": "20000102T0000Z",
                        "state": "running"
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
                            "batchSysName": "background",
                            "batchSysJobId": "32464",
                            "host": "localhost",
                            "startedTime": "2020-09-28T01:22:28Z",
                            "submittedTime": "2020-09-28T01:22:27Z",
                            "finishedTime": "2020-09-28T01:22:28Z",
                            "state": "succeeded",
                            "submitNum": 4
                        },
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|3",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|eventually_succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "32432",
                            "host": "localhost",
                            "startedTime": "2020-09-28T01:22:23Z",
                            "submittedTime": "2020-09-28T01:22:22Z",
                            "finishedTime": "2020-09-28T01:22:24Z",
                            "state": "failed",
                            "submitNum": 3
                        },
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|2",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|eventually_succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "32398",
                            "host": "localhost",
                            "startedTime": "2020-09-28T01:22:20Z",
                            "submittedTime": "2020-09-28T01:22:19Z",
                            "finishedTime": "2020-09-28T01:22:20Z",
                            "state": "failed",
                            "submitNum": 2
                        },
                        {
                            "id": "user|one|20000102T0000Z|eventually_succeeded|1",
                            "firstParent": {
                                "id": "user|one|20000102T0000Z|eventually_succeeded"
                            },
                            "batchSysName": "background",
                            "batchSysJobId": "32307",
                            "host": "localhost",
                            "startedTime": "2020-09-28T01:22:14Z",
                            "submittedTime": "2020-09-28T01:22:14Z",
                            "finishedTime": "2020-09-28T01:22:15Z",
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
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "submitted",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|BAD",
                        "name": "BAD",
                        "cyclePoint": "20000102T0000Z",
                        "state": "retrying"
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
                            "batchSysJobId": "32497",
                            "host": "localhost",
                            "startedTime": "2020-09-28T01:22:31Z",
                            "submittedTime": "2020-09-28T01:22:31Z",
                            "finishedTime": "2020-09-28T01:22:32Z",
                            "state": "failed",
                            "submitNum": 1
                        }
                    ]
                },
                {
                    "id": "user|one|20000102T0000Z|retrying",
                    "name": "retrying",
                    "state": "retrying",
                    "isHeld": false,
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "failed, retrying in PT5M (after 2020-09-28T01:27:16Z)",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|BAD",
                        "name": "BAD",
                        "cyclePoint": "20000102T0000Z",
                        "state": "retrying"
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
                            "batchSysJobId": "32308",
                            "host": "localhost",
                            "startedTime": "2020-09-28T01:22:14Z",
                            "submittedTime": "2020-09-28T01:22:14Z",
                            "finishedTime": "2020-09-28T01:22:15Z",
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
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "retrying"
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
                    "state": "running",
                    "isHeld": false,
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "started",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|SUCCEEDED",
                        "name": "SUCCEEDED",
                        "cyclePoint": "20000102T0000Z",
                        "state": "running"
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
                            "batchSysName": "background",
                            "batchSysJobId": "32311",
                            "host": "localhost",
                            "startedTime": "2020-09-28T01:22:14Z",
                            "submittedTime": "2020-09-28T01:22:14Z",
                            "finishedTime": "2020-09-28T01:22:15Z",
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
                    "cyclePoint": "20000102T0000Z",
                    "latestMessage": "",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "retrying"
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
                    "state": "retrying",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "retrying"
                    }
                },
                {
                    "id": "user|one|20000102T0000Z|GOOD",
                    "name": "GOOD",
                    "state": "running",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|root",
                        "name": "root",
                        "cyclePoint": "20000102T0000Z",
                        "state": "retrying"
                    }
                },
                {
                    "id": "user|one|20000102T0000Z|SUCCEEDED",
                    "name": "SUCCEEDED",
                    "state": "running",
                    "cyclePoint": "20000102T0000Z",
                    "firstParent": {
                        "id": "user|one|20000102T0000Z|GOOD",
                        "name": "GOOD",
                        "cyclePoint": "20000102T0000Z",
                        "state": "running"
                    }
                }
            ]
        }
    ]
}
export { checkpoint }
