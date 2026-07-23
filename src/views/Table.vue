<!--
Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.

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
  <v-container
    fluid
    class="c-table pa-2 pb-0 h-100 flex-column d-flex"
  >
    <ViewToolbar>
      <template #filters>
        <TaskFilter v-model="tasksFilter"/>
      </template>
      <template #select>
        <v-btn
          v-if="!enableSelect"
          text="Select"
          @click="() => enableSelect = true"
          :prepend-icon="mdiSelect"
        />
        <template v-else>
          <v-btn
            text="Enact"
            v-command-menu="selection"
            :prepend-icon="mdiPencilBoxMultiple"
            :disabled="!selection.length"
          >
            <template #append>
              <v-badge
                v-if="selection.length"
                :content="selection.length"
                inline
              />
            </template>
          </v-btn>
          <v-btn
            text="Cancel"
            @click="() => { enableSelect = false; selection = [] }"
            :prepend-icon="mdiSelectOff"
          />
        </template>
      </template>
    </ViewToolbar>
    <div class="overflow-hidden">
      <TableComponent
        :tasks="filteredTasks"
        v-model:selection="selection"
        v-model:sort-by="sortBy"
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        v-bind="{ filterState }"
        :show-select="enableSelect"
        class="mh-100"
      />
    </div>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { mdiPencilBoxMultiple, mdiSelect, mdiSelectOff } from '@mdi/js'
import { useGraphQL } from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import {
  initialOptions,
  updateInitialOptionsEvent,
  useInitialOptions,
} from '@/utils/initialOptions'
import { matchNode, groupStateFilters, globToRegex, useTasksFilterState } from '@/components/cylc/common/filter'
import ViewToolbar from '@/components/cylc/viewToolbar/ViewToolbar.vue'
import ViewToolbarBtn from '@/components/cylc/viewToolbar/ViewToolbarBtn.vue'
import TableComponent from '@/components/cylc/table/Table.vue'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import gql from 'graphql-tag'
import TaskFilter from '@/components/cylc/viewToolbar/TaskFilter.vue'
import { useCyclePointsOrderDesc } from '@/composables/localStorage'

const QUERY = gql`
subscription Workflow ($workflowID: ID) {
  deltas (workflows: [$workflowID]) {
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
  isRetry
  isWallclock
  isXtriggered
  task {
    meanElapsedTime
  }
  firstParent {
    id
  }
  runtime {
    runMode
  }
  flowNums
  graphDepth
}

fragment JobData on Job {
  id
  jobRunnerName
  jobId
  platform
  startedTime
  submittedTime
  finishedTime
  estimatedFinishTime
  state
  submitNum
}
`

export default {
  // eslint-disable-next-line vue/no-reserved-component-names
  name: 'Table',

  mixins: [
    subscriptionComponentMixin,
  ],

  components: {
    TableComponent,
    TaskFilter,
    ViewToolbar,
    ViewToolbarBtn,
  },

  emits: [updateInitialOptionsEvent],

  props: {
    initialOptions,
  },

  setup (props, { emit }) {
    const { workflowIDs, variables } = useGraphQL()

    /**
     * The job id input and selected task filter state.
     * @type {import('vue').Ref<object>}
     */
    const tasksFilter = useInitialOptions('tasksFilter', { props, emit }, {})
    const filterState = useTasksFilterState(tasksFilter)

    const cyclePointsOrderDesc = useCyclePointsOrderDesc()

    const sortBy = useInitialOptions(
      'sortBy',
      { props, emit },
      [
        {
          key: 'task.tokens.cycle',
          order: cyclePointsOrderDesc.value ? 'desc' : 'asc',
        },
      ]
    )

    const page = useInitialOptions('page', { props, emit }, 1)

    const itemsPerPage = useInitialOptions('itemsPerPage', { props, emit }, 50)

    const enableSelect = useInitialOptions('enableSelect', { props, emit }, false)
    const selection = useInitialOptions('selection', { props, emit }, [])

    return {
      sortBy,
      page,
      itemsPerPage,
      tasksFilter,
      filterState,
      workflowIDs,
      variables,
      enableSelect,
      selection,
      mdiSelect,
      mdiSelectOff,
      mdiPencilBoxMultiple,
    }
  },

  computed: {
    ...mapState('workflows', ['cylcTree']),
    ...mapGetters('workflows', ['getNodes']),
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
      const [states, waitingStateModifiers, genericModifiers] = groupStateFilters(
        this.tasksFilter.states?.length ? this.tasksFilter.states : []
      )
      return this.tasks.filter(({ task }) => matchNode(
        task,
        globToRegex(this.tasksFilter.id),
        states,
        waitingStateModifiers,
        genericModifiers
      ))
    },
  },
}
</script>
