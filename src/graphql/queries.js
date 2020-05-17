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

// Code related to GraphQL queries, fragments, variables, etc.

import gql from 'graphql-tag'

// IMPORTANT: queries here may be used in the offline mode to create mock data. Before removing or renaming
// queries here, please check under the services/mock folder for occurrences of the variable name.

/**
 * Query used to retrieve data for a workflow Tree view.
 * @type {string}
 */
export const WORKFLOW_TREE_QUERY = `
subscription {
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
    taskProxies(sort: { keys: ["cyclePoint"] }) {
      id
      name
      state
      isHeld
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
        firstParent: taskProxy {
          id
        }
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
  }
}
`

export const WORKFLOW_TREE_SUBSCRIPTION = gql`
subscription ($workflowId: ID) {
  deltas (workflows: [$workflowId]) {
    id
    shutdown
    added {
      workflow {
        ...WorkflowData
        cyclePoints: familyProxies(ids: ["root"], ghosts: true) {
          cyclePoint
        }
        taskProxies(sort: { keys: ["cyclePoint"] }, ghosts: true) {
          ...TaskProxyData
          jobs(sort: { keys: ["submit_num"], reverse:true }) {
            ...JobData
          }
        }
        familyProxies (exids: ["root"], sort: { keys: ["firstParent"]}, ghosts: true) {
          ...FamilyProxyData
        }
      }
      cyclePoints: familyProxies(ids: ["root"], ghosts: true) {
        cyclePoint
      }
      familyProxies (exids: ["root"], sort: { keys: ["firstParent"]}, ghosts: true) {
        ...FamilyProxyData
      }
      taskProxies(sort: { keys: ["cyclePoint"] }, ghosts: true) {
        ...TaskProxyData
      }
      jobs(sort: { keys: ["submit_num"], reverse:true }) {
        ...JobData
      }
    }
    updated {
      taskProxies(sort: { keys: ["cyclePoint"] }, ghosts: true) {
        ...TaskProxyData
      }
      jobs(sort: { keys: ["submit_num"], reverse:true }) {
        ...JobData
      }
      familyProxies (exids: ["root"], sort: { keys: ["firstParent"]}, ghosts: true) {
        ...FamilyProxyData
      }
    }
    pruned {
      jobs
      taskProxies
      familyProxies
    }
  }
}

fragment WorkflowData on Workflow {
  id
  name
  status
  owner
  host
  port
}

fragment FamilyProxyData on FamilyProxy {
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

fragment TaskProxyData on TaskProxy {
  id
  name
  state
  isHeld
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
}

fragment JobData on Job {
  id
  firstParent: taskProxy {
    id
  }
  batchSysName
  batchSysJobId
  host
  startedTime
  submittedTime
  finishedTime
  state
  submitNum
}
`

/**
 * Query used to retrieve data for a workflow Graph view.
 * @type {string}
 */
export const WORKFLOW_GRAPH_QUERY = `
subscription {
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
}
`

/**
 * Query used to retrieve data for the application Dashboard.
 * @type {string}
 */
export const DASHBOARD_QUERY = `
subscription {
  workflows {
    id
    name
    status
  }
}
`

/**
 * Query used to retrieve data for the GScan sidebar.
 * @type {string}
 */
export const GSCAN_QUERY = `
subscription {
  workflows {
    id
    name
    status
    owner
    host
    port
    taskProxies(sort: { keys: ["cyclePoint"] }) {
      id
      name
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
`

export const WORKFLOWS_TABLE_QUERY = `
subscription {
  workflows {
    id
    name
    owner
    host
    port
  }
}
`
