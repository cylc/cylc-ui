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

// IMPORTANT: queries here may be used in the offline mode to create mock data. Before removing or renaming
// queries here, please check under the services/mock folder for occurrences of the variable name.

/**
 * Query used to retrieve data for a workflow Tree view.
 * @type {string}
 */
export const WORKFLOW_TREE_QUERY = `
query {
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

/**
 * Subscription used to update the data retrieved with a query.
 * @type {string}
 */
export const WORKFLOW_TREE_SUBSCRIPTION = `
subscription ($stripNull: Boolean, $workflowId: ID) {
  deltas (ids: [$workflowId], stripNull: $stripNull) {
    id
    added (stripNull: $stripNull) {
      cyclePoints: familyProxies(ids: ["root"], stripNull: $stripNull) {
        cyclePoint
      }
      familyProxies (exids: ["root"], stripNull: $stripNull) {
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
      taskProxies (stripNull: $stripNull) {
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
      jobs (stripNull: $stripNull) {
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
    updated (stripNull: $stripNull) {
      workflow (stripNull: $stripNull) {
        name
        status
        owner
        host
        port
      }
      cyclePoints: familyProxies(ids: ["root"], stripNull: $stripNull) {
        cyclePoint
      }
      familyProxies (exids: ["root"], stripNull: $stripNull) {
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
      taskProxies (stripNull: $stripNull) {
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
      jobs (stripNull: $stripNull) {
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
    pruned {
      # 1. NO CYCLE POINTS, i.e., whenever you prune a family proxy, check
      # if its parent is a cycle point and if now it is childless (and if
      # so, remove it!)
      # 2. family proxies
      familyProxies
      taskProxies
      jobs
    }
  }
}

`

/**
 * Query used to retrieve data for a workflow Graph view.
 * @type {string}
 */
export const WORKFLOW_GRAPH_QUERY = `
query {
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
query {
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
query {
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
query {
  workflows {
    id
    name
    owner
    host
    port
  }
}
`
