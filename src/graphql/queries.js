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
  state
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
  state
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
  state
  isHeld
  isQueued
  isRunahead
  task {
    meanElapsedTime
  }
}
`

const JOB_DATA_FRAGMENT = `
fragment JobData on Job {
  id
  jobRunnerName
  jobId
  platform
  startedTime
  submittedTime
  finishedTime
  state
  submitNum
  messages
  taskProxy {
    outputs (satisfied: true) {
      label
      message
    }
  }
}
`
// TODO: We should really be requesting the outputs on the taskProxy field
// rather than the job field as this results in duplication. This will require
// a little refactoring (i.e. extracting the parent task proxy from the store)
// See https://github.com/cylc/cylc-ui/issues/1135

/**
 * Query used to retrieve data for the GScan component.
 *
 * @type {DocumentNode}
 */
const GSCAN_DELTAS_SUBSCRIPTION = gql`
subscription App {
  deltas {
    ...Deltas
  }
}

# GSCAN DELTAS BEGIN

fragment Deltas on Deltas {
  id
  added {
    ...AddedDelta
  }
  updated (stripNull: true) {
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
  deltas {
    ...Deltas
  }
}

# GSCAN DELTAS BEGIN

fragment Deltas on Deltas {
  id
  added {
    ...AddedDelta
  }
  updated (stripNull: true) {
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
 * Query used to retrieve data for the Log view.
 *
 * @type {DocumentNode}
*/
const LOGS_SUBSCRIPTION = gql`
subscription LogData ($workflowName: ID, $task: String!, $file: String!) {
  logs (workflow: $workflowName, task:$task, file: $file) {
    lines
  }
}
`

/**
 * Query used to retrieve available log files for the Log view.
 *
 * @type {DocumentNode}
*/
const LOG_FILE_QUERY = gql`
query LogFiles($workflowName: ID, $task: String!) {
  logFiles(workflow: $workflowName, task: $task) {
    files
  }
}
`

/**
 * Query used to retrieve data for the WorkflowsTable view.
 *
 * @type {DocumentNode}
 */
const WORKFLOWS_TABLE_DELTAS_SUBSCRIPTION = gql`
subscription Workflow {
  deltas {
    id
    added {
      workflow {
        ...WorkflowData
      }
    }
    updated (stripNull: true) {
      workflow {
        ...WorkflowData
      }
    }
    pruned {
      workflow
    }
  }
}

fragment WorkflowData on Workflow {
  id
  status
  owner
  host
  port
}
`

/**
 * Query used to retrieve data for the tree view.
 *
 * @type {DocumentNode}
 */
const WORKFLOW_TREE_DELTAS_SUBSCRIPTION = gql`
subscription Workflow ($workflowId: ID) {
  deltas (workflows: [$workflowId]) {
   ...Deltas
  }
}

# TREE DELTAS BEGIN

fragment Deltas on Deltas {
  id
  added {
    ...AddedDelta
  }
  updated (stripNull: true) {
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
  familyProxies {
    ...FamilyProxyData
  }
  taskProxies {
    ...TaskProxyData
  }
  jobs {
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
  familyProxies {
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
  deltas(workflows: [$workflowId]) {
    ...Deltas
  }
}

# TABLE DELTAS BEGIN

fragment Deltas on Deltas {
  id
  added {
    ...AddedDelta
  }
  updated (stripNull: true) {
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
  taskProxies {
    ...TaskProxyData
  }
  jobs {
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
  LOG_FILE_QUERY,
  GSCAN_DELTAS_SUBSCRIPTION,
  DASHBOARD_DELTAS_SUBSCRIPTION,
  LOGS_SUBSCRIPTION,
  WORKFLOWS_TABLE_DELTAS_SUBSCRIPTION,
  WORKFLOW_TREE_DELTAS_SUBSCRIPTION,
  WORKFLOW_TABLE_DELTAS_SUBSCRIPTION
}
