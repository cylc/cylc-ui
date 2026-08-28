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
            v-command-menu="selectedNodes"
            :prepend-icon="mdiPencilBoxMultiple"
            :disabled="!selectedIDs.length"
            color="primary"
          >
            <template #append>
              <v-badge
                v-if="selectedIDs.length"
                :content="selectedIDs.length"
                inline
                color="primary"
              />
            </template>
          </v-btn>
          <v-btn
            text="Cancel"
            @click="() => enableSelect = false"
            :prepend-icon="mdiSelectOff"
          />
        </template>
      </template>
    </ViewToolbar>
    <v-fade-transition hide-on-leave>
      <div v-show="enableSelect">
        <v-alert
          :icon="mdiInformationOutline"
          text="Selection mode enabled. The list of displayed tasks will not update. Any selection will be lost if you leave this workflow."
          type="info"
          variant="tonal"
          density="compact"
          class="my-2"
        />
      </div>
    </v-fade-transition>
    <div class="overflow-hidden">
      <TableComponent
        :tasks="filteredItems"
        v-model:selection="selectedIDs"
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
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { whenever } from '@vueuse/core'
import { mdiInformationOutline, mdiPencilBoxMultiple, mdiSelect, mdiSelectOff } from '@mdi/js'
import { useWorkflowVariables } from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import {
  initialOptions,
  updateInitialOptionsEvent,
  useInitialOptions,
} from '@/utils/initialOptions'
import { matchNode, groupStateFilters, globToRegex, useTasksFilterState } from '@/components/cylc/common/filter'
import ViewToolbar from '@/components/cylc/viewToolbar/ViewToolbar.vue'
import TableComponent from '@/components/cylc/table/Table.vue'
import { SubscriptionQuery } from '@/model/SubscriptionQuery.model'
import gql from 'graphql-tag'
import TaskFilter from '@/components/cylc/viewToolbar/TaskFilter.vue'
import { useCyclePointsOrderDesc } from '@/composables/localStorage'
import { cloneDeep } from 'lodash-es'

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
  },

  emits: [updateInitialOptionsEvent],

  props: {
    initialOptions,
  },

  setup (props, { emit }) {
    const store = useStore()

    const getIndex = store.getters['workflows/getIndex']

    const { workflows, variables } = useWorkflowVariables()

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

    const enableSelect = ref(false)
    /** Track selected tasks by ID. */
    const selectedIDs = ref([])
    /**
     * Track selected nodes based on selected IDs.
     * This is because the source for the node changes when a task is pruned, but the ID remains the same.
    */
    const selectedNodes = computed(() => selectedIDs.value.map(
      (id) => getIndex(id) ?? prunedTasks.value.get(id)
    ))

    whenever(() => !enableSelect.value, () => {
      prunedTasks.value.clear()
      selectedIDs.value = []
    })

    /**
     * When in selection mode, keep references to nodes pruned from data store, to stop them disappearing from the table.
     * @type {import('vue').Ref<Map<string, Object>>}
     */
    const prunedTasks = ref(new Map())

    const tasks = computed((previous) => {
      if (enableSelect.value) {
        // Freeze the list of tasks when selection is enabled, to stop selected tasks disappearing
        return previous
      }
      return workflows.value.flatMap(
        (workflow) => workflow.children.flatMap(
          (cycle) => cycle.children
        )
      )
    })

    const items = computed(
      () => tasks.value.map((task) => {
        task = prunedTasks.value.get(task.id) ?? task
        return {
          task,
          latestJob: task.children[0],
          previousJob: task.children[1],
        }
      })
    )

    const filteredItems = computed(() => {
      const [states, waitingStateModifiers, genericModifiers] = groupStateFilters(
        tasksFilter.value.states ?? []
      )
      return items.value.filter(({ task }) => matchNode(
        task,
        globToRegex(tasksFilter.value.id),
        states,
        waitingStateModifiers,
        genericModifiers
      ))
    })

    return {
      getIndex,
      filteredItems,
      sortBy,
      page,
      itemsPerPage,
      tasksFilter,
      filterState,
      workflows,
      variables,
      enableSelect,
      selectedIDs,
      selectedNodes,
      prunedTasks,
      mdiSelect,
      mdiSelectOff,
      mdiPencilBoxMultiple,
      mdiInformationOutline,
    }
  },

  computed: {
    query () {
      return new SubscriptionQuery(
        QUERY,
        this.variables,
        // we really should consider giving these unique names, as technically they are just use as the subscription names
        // By using a unique name, we can avoid callback merging errors like the one documented line 350 in the workflow.service.js file
        'workflow',
        {
          onBeforeDelta: ({ pruned }) => {
            // Grab task nodes just before they are removed from the store
            if (this.enableSelect && pruned?.taskProxies?.length) {
              for (const id of pruned.taskProxies) {
                this.prunedTasks.set(id, cloneDeep(this.getIndex(id)))
              }
            }
          },
        }
      )
    },
  },
}
</script>
