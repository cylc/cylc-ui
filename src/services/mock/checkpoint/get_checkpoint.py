query = '''
{
    workflows {
        id
        name
        status
        owner
        host
        port
        taskProxies {
            id
            state
            cyclePoint
            task {
                name
            }
            jobs {
                id
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
print(json.dumps(wrapper))
