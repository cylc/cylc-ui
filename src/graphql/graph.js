const graphSubscription = `subscription {
  workflows(ids: ["WORKFLOW_ID"]) {
    id
    name
    status
    owner
    host
    port
    nodesEdges {
      nodes {
        id
        label: id
        parent: firstParent {
          id
          state
        }
        state
        cyclePoint
        task {
          name
        }
        jobs(sort: {keys: ["submit_num"], reverse: true}) {
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
      edges {
        id
        source
        target
        label: id
      }
    }
    taskProxies(sort: { keys: ["cyclePoint"] }) {
      id
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
}`

export { graphSubscription }
