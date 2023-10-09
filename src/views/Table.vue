<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <div class="h-100">
    <TableComponent
      :tasks="tasks"
      ref="table0"
      key="table0"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getPageTitle } from '@/utils/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import TableComponent from '@/components/cylc/table/Table.vue'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
// import { WORKFLOW_TABLE_DELTAS_SUBSCRIPTION } from '@/graphql/queries'
import gql from 'graphql-tag'

const QUERY = gql`
subscription Workflow ($workflowId: ID) {
  deltas (workflows: [$workflowId]) {
   ...Deltas
  }
}

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

fragment TaskProxyData on TaskProxy {
  id
  state
  isHeld
  isQueued
  isRunahead
  task {
    meanElapsedTime
  }
  firstParent {
    id
  }
}

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

export default {
  // eslint-disable-next-line vue/no-reserved-component-names
  name: 'Table',

  mixins: [
    graphqlMixin,
    subscriptionComponentMixin
  ],

  components: {
    TableComponent
  },

  head () {
    return {
      title: getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  computed: {
    ...mapState('workflows', ['cylcTree']),
    ...mapGetters('workflows', ['getNodes']),
    workflowIDs () {
      return [this.workflowId]
    },
    workflows () {
      return this.getNodes('workflow', this.workflowIDs)
    },
    tasks () {
      const ret = []
      for (const workflow of this.workflows) {
        for (const cycle of workflow.children) {
          for (const task of cycle.children) {
            ret.push({
              task,
              latestJob: task.children[0],
              previousJob: task.children[1],
            })
          }
        }
      }
      return ret
    },

    query () {
      return new SubscriptionQuery(
        // this is disabled for now as differences in the fragment names are causing the
        // subscription to be reloaded when its merged. This will need to be re-enabled in
        // future, if we need more information then the currently active WORKFLOW_TREE_DELTAS_SUBSCRIPTION provides
        // QUERY,
        QUERY,
        this.variables,
        // we really should consider giving these unique names, as technically they are just use as the subscription names
        // By using a unique name, we can avoid callback merging errors like the one documented line 350 in the workflow.service.js file
        'workflow',
        [],
        /* isDelta */ true,
        /* isGlobalCallback */ true
      )
    }
  }
}
</script>
