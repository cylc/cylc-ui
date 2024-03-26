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
    <v-container
      fluid
      class="c-table ma-0 pa-2 h-100 flex-column d-flex"
    >
      <!-- Toolbar -->
      <v-row
        no-gutters
        class="d-flex flex-wrap flex-grow-0"
      >
        <!-- Filters -->
        <v-col
          v-if="filterable"
          class=""
        >
          <TaskFilter v-model="tasksFilter"/>
        </v-col>
      </v-row>
      <TableComponent
        :filteredTasks="filteredTasks"
        ref="table0"
        key="table0"
      />
    </v-container>
  </div>
</template>

<script>
import { ref } from 'vue'
import { mapState, mapGetters } from 'vuex'
import { getPageTitle } from '@/utils/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import {
  initialOptions,
  useInitialOptions
} from '@/utils/initialOptions'
import { matchNode } from '@/components/cylc/common/filter'
import TableComponent from '@/components/cylc/table/Table.vue'
import TaskFilter from '@/components/cylc/TaskFilter.vue'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import gql from 'graphql-tag'

const QUERY = gql`
subscription Workflow ($workflowId: ID) {
  deltas (workflows: [$workflowId]) {
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

fragment PrunedDelta on Pruned {
  workflow
  familyProxies
  taskProxies
  jobs
}

fragment WorkflowData on Workflow {
  id
  reloaded
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
    TableComponent,
    TaskFilter
  },

  head () {
    return {
      title: getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  props: {
    initialOptions,
  },

  setup (props, { emit }) {
    /**
     * The job id input and selected task filter state.
     * @type {import('vue').Ref<object>}
     */
    const tasksFilter = useInitialOptions('tasksFilter', { props, emit }, ref({}))
    /**
     * The state for toggling whether the filters are rendered
     * @type {import('vue').Ref<boolean>}
     */
    const filterable = useInitialOptions('filterable', { props, emit }, ref(true))

    return {
      tasksFilter,
      filterable
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
        QUERY,
        this.variables,
        // we really should consider giving these unique names, as technically they are just use as the subscription names
        // By using a unique name, we can avoid callback merging errors like the one documented line 350 in the workflow.service.js file
        'workflow',
        [],
        /* isDelta */ true,
        /* isGlobalCallback */ true
      )
    },

    filteredTasks () {
      return this.tasks.filter(({ task }) => matchNode(task, this.tasksFilter.id, this.tasksFilter.states))
    }
  }
}
</script>
