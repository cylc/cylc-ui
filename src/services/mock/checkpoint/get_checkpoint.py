query = '''
{
    workflows {
        id
        name
        status
        owner
        host
        port
        cyclePoints: familyProxies(ids: ["root"]) {
          cyclePoint
        }
        taskProxies(sort: { keys: ["cyclePoint"] }) {
            id
            name
            state
            cyclePoint
            latestMessage
            firstParent {
                id
                name
                cyclePoint
                state
            }
            task {
                meanElapsedTime
                name
            }
            jobs(sort: { keys: ["submit_num"], reverse:true }) {
                id
                batchSysName
                batchSysJobId
                host
                startedTime
                submittedTime
                finishedTime
                state
                submitNum
            }
        }
        familyProxies (sort: { keys: ["firstParent"]}) {
            id
            name
            state
            cyclePoint
            firstParent {
                id
                name
                cyclePoint
                state
            }
        }
    }
}
'''

wrapper = {
    'request_string': query
}

import json
print(json.dumps(wrapper, indent=2))
