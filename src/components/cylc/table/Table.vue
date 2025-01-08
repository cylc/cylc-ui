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
  <v-data-table
    :headers="headers"
    :items="tasks"
    item-value="task.id"
    multi-sort
    v-model:sort-by="sortBy"
    show-expand
    density="compact"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
  >
    <template v-slot:item.task.name="{ item }">
      <div
        class="d-flex align-center flex-nowrap"
        :class="{ 'flow-none': isFlowNone(item.task.node.flowNums) }"
        :data-cy-task-name="item.task.name"
      >
        <div style="width: 2em;">
          <Task
            v-command-menu="item.task"
            :task="item.task.node"
            :startTime="item.latestJob?.node?.startedTime"
          />
        </div>
        <div style="width: 2em;">
          <Job
            v-if="item.latestJob"
            v-command-menu="item.latestJob"
            :status="item.latestJob.node.state"
            :previous-state="item.previousJob?.node?.state"
          />
        </div>
        {{ item.task.name }}
        <FlowNumsChip
          :flowNums="item.task.node.flowNums"
          class="ml-2"
        />
      </div>
    </template>
    <template v-slot:item.task.node.task.meanElapsedTime="{ item }">
      <td>{{ dtMean(item.task) }}</td>
    </template>
    <template v-slot:item.data-table-expand="{ item, internalItem, toggleExpand, isExpanded }">
      <v-btn
        @click="toggleExpand(internalItem)"
        icon
        variant="text"
        size="small"
        :style="{
          visibility: (item.task.children || []).length ? null : 'hidden',
          transform: isExpanded(internalItem) ? 'rotate(180deg)' : null
        }"
      >
        <v-icon
          :icon="icons.mdiChevronDown"
          size="large"
        />
      </v-btn>
    </template>
    <template v-slot:expanded-row="{ item }">
      <tr
        v-bind:key="job.id"
        v-for="(job, index) in item.task.children"
        class="expanded-row bg-grey-lighten-5"
      >
        <td :colspan="3">
          <div class="d-flex align-content-center flex-nowrap">
            <div class="d-flex" style="margin-left: 2em;">
              <Job
                v-command-menu="job"
                :key="`${job.id}-summary-${index}`"
                :status="job.node.state"
              />
              <span class="ml-2">#{{ job.node.submitNum }}</span>
            </div>
          </div>
        </td>
        <td>{{ job.node.platform }}</td>
        <td>{{ job.node.jobRunnerName }}</td>
        <td>{{ job.node.jobId }}</td>
        <td>{{ job.node.submittedTime }}</td>
        <td>{{ job.node.startedTime }}</td>
        <td>{{ job.node.finishedTime }}</td>
        <td></td>
      </tr>
    </template>
    <template v-slot:bottom>
      <v-data-table-footer :itemsPerPageOptions="itemsPerPageOptions" />
    </template>
  </v-data-table>
</template>

<script>
import { ref, watch } from 'vue'
import Task from '@/components/cylc/Task.vue'
import Job from '@/components/cylc/Job.vue'
import { mdiChevronDown } from '@mdi/js'
import { DEFAULT_COMPARATOR } from '@/components/cylc/common/sort'
import {
  datetimeComparator,
  numberComparator,
} from '@/components/cylc/table/sort'
import {
  dtMean,
  isFlowNone,
} from '@/utils/tasks'
import { useCyclePointsOrderDesc } from '@/composables/localStorage'
import {
  initialOptions,
  updateInitialOptionsEvent,
  useInitialOptions
} from '@/utils/initialOptions'
import FlowNumsChip from '@/components/cylc/common/FlowNumsChip.vue'

export default {
  name: 'TableComponent',

  emits: [updateInitialOptionsEvent],

  props: {
    tasks: {
      type: Array,
      required: true
    },
    initialOptions,
  },

  components: {
    FlowNumsChip,
    Task,
    Job,
  },

  setup (props, { emit }) {
    const cyclePointsOrderDesc = useCyclePointsOrderDesc()

    const sortBy = useInitialOptions(
      'sortBy',
      { props, emit },
      [
        {
          key: 'task.tokens.cycle',
          order: cyclePointsOrderDesc.value ? 'desc' : 'asc'
        },
      ]
    )

    const page = useInitialOptions('page', { props, emit }, 1)

    const itemsPerPage = useInitialOptions('itemsPerPage', { props, emit }, 50)

    const headers = ref([
      {
        title: 'Task',
        key: 'task.name',
        sortable: true,
        sortFunc: DEFAULT_COMPARATOR
      },
      {
        title: 'Jobs',
        key: 'data-table-expand',
        sortable: false
      },
      {
        title: 'Cycle Point',
        key: 'task.tokens.cycle',
        sortable: true,
        sortFunc: DEFAULT_COMPARATOR,
      },
      {
        title: 'Platform',
        key: 'latestJob.node.platform',
        sortable: true,
        sortFunc: DEFAULT_COMPARATOR,
      },
      {
        title: 'Job Runner',
        key: 'latestJob.node.jobRunnerName',
        sortable: true,
        sortFunc: DEFAULT_COMPARATOR,
      },
      {
        title: 'Job ID',
        key: 'latestJob.node.jobId',
        sortable: true,
        sortFunc: DEFAULT_COMPARATOR,
      },
      {
        title: 'Submit',
        key: 'latestJob.node.submittedTime',
        sortable: true,
        sortFunc: datetimeComparator,
      },
      {
        title: 'Start',
        key: 'latestJob.node.startedTime',
        sortable: true,
        sortFunc: datetimeComparator,
      },
      {
        title: 'Finish',
        key: 'latestJob.node.finishedTime',
        sortable: true,
        sortFunc: datetimeComparator,
      },
      {
        title: 'Run Time',
        key: 'task.node.task.meanElapsedTime',
        sortable: true,
        sortFunc: numberComparator,
      },
    ])

    // Ensure that whenever a sort order changes, empty/nullish values are
    // always sorted last regardless.
    watch(
      sortBy,
      (val) => {
        for (const { key, order } of val) {
          const header = headers.value.find((x) => x.key === key)
          header.sort = (a, b) => {
            if (!a && !b) return 0
            if (!a) return order === 'asc' ? 1 : -1
            if (!b) return order === 'asc' ? -1 : 1
            return header.sortFunc(a, b)
          }
        }
      },
      { deep: true, immediate: true }
    )

    return {
      dtMean,
      itemsPerPage,
      page,
      sortBy,
      headers,
      icons: {
        mdiChevronDown
      },
      isFlowNone,
      itemsPerPageOptions: [
        { value: 10, title: '10' },
        { value: 20, title: '20' },
        { value: 50, title: '50' },
        { value: 100, title: '100' },
        { value: 200, title: '200' },
        { value: -1, title: 'All' },
      ],
    }
  },
}
</script>
