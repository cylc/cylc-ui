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
// eslint-disable-next-line no-unused-vars
import { DocumentNode } from 'graphql'

// IMPORTANT: queries here may be used in the offline mode to create mock data. Before removing or renaming
// queries here, please check under the services/mock folder for occurrences of the variable name.

const WORKFLOW_DATA_FRAGMENT = `
fragment WorkflowData on Workflow {
  id
  name
  status
  statusMsg
  owner
  host
  port
  stateTotals
  latestStateTasks(states: [
    "failed",
    "preparing",
    "submit-failed",
    "submitted",
    "running"
  ])
}
`

const CYCLEPOINT_DATA_FRAGMENT = `
fragment CyclePointData on FamilyProxy {
  __typename
  id
  cyclePoint
  ancestors {
    name
  }
  childTasks {
    id
  }
}
`

const FAMILY_PROXY_DATA_FRAGMENT = `
fragment FamilyProxyData on FamilyProxy {
  __typename
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
  ancestors {
    name
  }
  childTasks {
    id
  }
}
`

const TASK_PROXY_DATA_FRAGMENT = `
fragment TaskProxyData on TaskProxy {
  id
  name
  state
  isHeld
  isQueued
  isRunahead
  cyclePoint
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
`

const JOB_DATA_FRAGMENT = `
fragment JobData on Job {
  id
  firstParent: taskProxy {
    id
  }
  jobRunnerName
  jobId
  platform
  startedTime
  submittedTime
  finishedTime
  state
  submitNum
  taskProxy {
    outputs (satisfied: true, sort: { keys: ["time"], reverse: true}) {
      label
      message
    }
  }
}
`

/**
 * Query used to retrieve data for the GScan component.
 *
 * @type {DocumentNode}
 */
const GSCAN_DELTAS_SUBSCRIPTION = gql`
subscription App {
  deltas (stripNull: true) {
    ...Deltas
  }
}

# GSCAN DELTAS BEGIN

fragment Deltas on Deltas {
  id
  added {
    ...AddedDelta
  }
  updated {
    ...UpdatedDelta
  }
  pruned {
    workflow
  }
}

fragment AddedDelta on Added {
  workflow {
    ...WorkflowData
  }
}

fragment UpdatedDelta on Updated {
  workflow {
    ...WorkflowData
  }
}

${WORKFLOW_DATA_FRAGMENT}
`

/**
 * Query used to retrieve data for the Dashboard view. Note that this query will
 * likely change, bringing more information for the dashboards, and/or allowing
 * users to customize the query.
 *
 * @type {DocumentNode}
 * @see https://github.com/cylc/cylc-ui/issues/94
 */
const DASHBOARD_DELTAS_SUBSCRIPTION = gql`
subscription App {
  deltas (stripNull: true) {
    ...Deltas
  }
}

# GSCAN DELTAS BEGIN

fragment Deltas on Deltas {
  id
  added {
    ...AddedDelta
  }
  updated {
    ...UpdatedDelta
  }
  pruned {
    workflow
  }
}

fragment AddedDelta on Added {
  workflow {
    ...WorkflowData
  }
}

fragment UpdatedDelta on Updated {
  workflow {
    ...WorkflowData
  }
}

${WORKFLOW_DATA_FRAGMENT}
`

/**
 * Query used to retrieve data for the WorkflowsTable view.
 *
 * @type {DocumentNode}
 */
const WORKFLOWS_TABLE_DELTAS_SUBSCRIPTION = gql`
subscription Workflow {
  deltas (stripNull: true) {
    id
    added {
      workflow {
        ...WorkflowData
      }
    }
    updated {
      workflow {
        ...WorkflowData
      }
    }
    pruned {
      workflow
    }
  }
}

${WORKFLOW_DATA_FRAGMENT}
`

/**
 * Query used to retrieve data for the tree view.
 *
 * @type {DocumentNode}
 */
const WORKFLOW_TREE_DELTAS_SUBSCRIPTION = gql`
subscription Workflow ($workflowId: ID) {
  deltas (workflows: [$workflowId], stripNull: true) {
   ...Deltas
  }
}

# TREE DELTAS BEGIN

fragment Deltas on Deltas {
  id
  added {
    ...AddedDelta
  }
  updated {
    ...UpdatedDelta
  }
  pruned {
    ...PrunedDelta
  }
}

fragment AddedDelta on Added {
  workflow {
    ...WorkflowData
  }
  cyclePoints: familyProxies (ids: ["*/root"]) {
    ...CyclePointData
  }
  familyProxies (exids: ["*/root"], sort: { keys: ["name"] }) {
    ...FamilyProxyData
  }
  taskProxies (sort: { keys: ["cyclePoint"], reverse: false }) {
    ...TaskProxyData
  }
  jobs (sort: { keys: ["submit_num"], reverse:true }) {
    ...JobData
  }
}

fragment UpdatedDelta on Updated {
  taskProxies {
    ...TaskProxyData
  }
  jobs {
    ...JobData
  }
  familyProxies (exids: ["*/root"]) {
    ...FamilyProxyData
  }
}

fragment PrunedDelta on Pruned {
  familyProxies
  taskProxies
  jobs
}

# TREE DELTAS END

# WORKFLOW DATA BEGIN

${WORKFLOW_DATA_FRAGMENT}

${CYCLEPOINT_DATA_FRAGMENT}

${FAMILY_PROXY_DATA_FRAGMENT}

${TASK_PROXY_DATA_FRAGMENT}

${JOB_DATA_FRAGMENT}

# WORKFLOW DATA END
`

/**
 * Query used to retrieve data for the table view.
 *
 * @type {DocumentNode}
 */
const WORKFLOW_TABLE_DELTAS_SUBSCRIPTION = gql`
subscription Workflow ($workflowId: ID) {
  deltas(workflows: [$workflowId], stripNull: true) {
    ...Deltas
  }
}

# TABLE DELTAS BEGIN

fragment Deltas on Deltas {
  id
  added {
    ...AddedDelta
  }
  updated {
    ...UpdatedDelta
  }
  pruned {
    ...PrunedDelta
  }
}

fragment AddedDelta on Added {
  workflow {
    ...WorkflowData
  }
  taskProxies(sort: {keys: ["cyclePoint"], reverse: false}) {
    ...TaskProxyData
  }
  jobs(sort: {keys: ["submit_num"], reverse: true}) {
    ...JobData
  }
}

fragment UpdatedDelta on Updated {
  taskProxies {
    ...TaskProxyData
  }
  jobs {
    ...JobData
  }
}

fragment PrunedDelta on Pruned {
  taskProxies
  jobs
}

# TABLE DELTAS END

# WORKFLOW DATA BEGINS

${WORKFLOW_DATA_FRAGMENT}

${TASK_PROXY_DATA_FRAGMENT}

${JOB_DATA_FRAGMENT}

# WORKFLOW DATA END

`

export {
  GSCAN_DELTAS_SUBSCRIPTION,
  DASHBOARD_DELTAS_SUBSCRIPTION,
  WORKFLOWS_TABLE_DELTAS_SUBSCRIPTION,
  WORKFLOW_TREE_DELTAS_SUBSCRIPTION,
  WORKFLOW_TABLE_DELTAS_SUBSCRIPTION
}
