query = '''
{
    workflows {
        id
        name
        status
        owner
        host
        port
        taskProxies(sort: { keys: ["cyclePoint"] }) {
            id
            state
            cyclePoint
            latestMessage
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
    }
}
'''

wrapper = {
    'request_string': query
}

import json
print(json.dumps(wrapper, indent=2))
