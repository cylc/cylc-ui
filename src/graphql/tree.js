const treeSubscription = `subscription {
  workflows(ids: ["WORKFLOW_ID"]) {
    id
    name
    status
    owner
    host
    port
    cyclePoints: familyProxies(ids: ["root"]) {
      cyclePoint
    }
    familyProxies (exids: ["root"], sort: { keys: ["firstParent"]}) {
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
  }
}`

export { treeSubscription }
