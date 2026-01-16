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
    fixed-header
  >
    <template #item.task.name="{ item }">
      <div
        class="d-flex align-center flex-nowrap"
        :class="{ 'flow-none': isFlowNone(item.task.node.flowNums) }"
        :data-cy-task-name="item.task.name"
      >
        <div v-bind="jobIconParentProps">
          <Task
            v-command-menu="item.task"
            :task="item.task.node"
            :startTime="item.latestJob?.node?.startedTime"
          />
        </div>
        <div v-bind="jobIconParentProps">
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
    <template #item.latestJob.node.finishedTime="{ item, value }">
      <EstimatedTime
        :actual="value"
        :estimate="item.latestJob?.node.estimatedFinishTime"
      />
    </template>
    <template #item.task.node.task.meanElapsedTime="{ item }">
      <EstimatedTime
        v-bind="taskRunTimes.get(item.task.id)"
        :formatter="(x) => formatDuration(x, { allowZeros: true })"
        tooltip="Mean for this task"
      />
    </template>
    <template #item.data-table-expand="{ item, internalItem, toggleExpand, isExpanded }">
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
          :icon="mdiChevronDown"
          size="large"
        />
      </v-btn>
    </template>
    <template #expanded-row="{ item }">
      <tr
        v-bind:key="job.id"
        v-for="(job, index) in item.task.children"
        class="expanded-row bg-grey-lighten-5"
      >
        <td :colspan="3">
          <div class="d-flex align-content-center flex-nowrap">
            <div v-bind="jobIconParentProps" :style="{ marginLeft: jobIconParentProps.style.width }">
              <Job
                v-command-menu="job"
                :key="`${job.id}-summary-${index}`"
                :status="job.node.state"
              />
            </div>
            <span>#{{ job.node.submitNum }}</span>
          </div>
        </td>
        <td>{{ job.node.platform }}</td>
        <td>{{ job.node.jobRunnerName }}</td>
        <td>{{ job.node.jobId }}</td>
        <td>{{ job.node.submittedTime }}</td>
        <td>{{ job.node.startedTime }}</td>
        <td>
          <EstimatedTime
            :actual="job.node.finishedTime"
            :estimate="job.node.estimatedFinishTime"
          />
        </td>
        <td>
          <EstimatedTime
            :actual="getRunTime(job.node)"
            :estimate="item.task.node?.task.meanElapsedTime"
            :formatter="(x) => formatDuration(x, { allowZeros: true })"
            tooltip="Mean"
          />
        </td>
      </tr>
    </template>
    <template #bottom>
      <v-data-table-footer :itemsPerPageOptions="itemsPerPageOptions" />
    </template>
    <template #no-data v-if="filterState">
      <v-filter-empty-state data-cy="filter-no-results"/>
    </template>
  </v-data-table>
</template>

<script setup>
import { ref, computed } from 'vue'
import Task from '@/components/cylc/Task.vue'
import Job from '@/components/cylc/Job.vue'
import { mdiChevronDown } from '@mdi/js'
import { DEFAULT_COMPARATOR } from '@/components/cylc/common/sort'
import {
  datetimeComparator,
  numberComparator,
} from '@/components/cylc/table/sort'
import {
  getRunTime,
  formatDuration,
  isFlowNone,
  isTruthyOrZero,
} from '@/utils/tasks'
import { useCyclePointsOrderDesc } from '@/composables/localStorage'
import {
  initialOptions as initialOptionsProp,
  updateInitialOptionsEvent,
  useInitialOptions
} from '@/utils/initialOptions'
import FlowNumsChip from '@/components/cylc/common/FlowNumsChip.vue'
import EstimatedTime from '@/components/cylc/common/EstimatedTime.vue'

const emit = defineEmits([updateInitialOptionsEvent])

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  },
  initialOptions: initialOptionsProp,
  filterState: {
    type: [Object, null],
    default: null,
  },
})

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
    sortFunc: DEFAULT_COMPARATOR,
  },
  {
    title: 'Jobs',
    key: 'data-table-expand',
  },
  {
    title: 'Cycle Point',
    key: 'task.tokens.cycle',
    sortFunc: DEFAULT_COMPARATOR,
  },
  {
    title: 'Platform',
    key: 'latestJob.node.platform',
    sortFunc: DEFAULT_COMPARATOR,
  },
  {
    title: 'Job Runner',
    key: 'latestJob.node.jobRunnerName',
    sortFunc: DEFAULT_COMPARATOR,
  },
  {
    title: 'Job ID',
    key: 'latestJob.node.jobId',
    sortFunc: DEFAULT_COMPARATOR,
  },
  {
    title: 'Submit',
    key: 'latestJob.node.submittedTime',
    sortFunc: datetimeComparator,
  },
  {
    title: 'Start',
    key: 'latestJob.node.startedTime',
    sortFunc: datetimeComparator,
  },
  {
    title: 'Finish',
    key: 'latestJob.node.finishedTime',
    sortRaw (node1, node2) {
      const a = node1.latestJob?.node
      const b = node2.latestJob?.node
      return nullSorter(
        'latestJob.node.finishedTime',
        datetimeComparator,
        a?.finishedTime || a?.estimatedFinishTime,
        b?.finishedTime || b?.estimatedFinishTime
      )
    },
  },
  {
    title: 'Run Time',
    key: 'task.node.task.meanElapsedTime',
    sortRaw (node1, node2) {
      const a = taskRunTimes.value.get(node1.task.id)
      const b = taskRunTimes.value.get(node2.task.id)
      return nullSorter(
        'task.node.task.meanElapsedTime',
        numberComparator,
        a?.actual || a?.estimate,
        b?.actual || b?.estimate
      )
    },
  },
])

/**
 * A comparator that ensures empty/nullish values are always sorted last regardless of sort order.
 *
 * @param {string} key - The key for the column being sorted.
 * @param {function} sortFunc - The comparator function to use if both values are truthy or zero.
 * @param {any} a - The first value to compare.
 * @param {any} b - The second value to compare.
 * @returns {number} A number > 0 if a > b, or < 0 if a < b, or 0 if a === b
 */
function nullSorter (key, sortFunc, a, b) {
  const x = isTruthyOrZero(a)
  const y = isTruthyOrZero(b)
  if (x && y) return sortFunc(a, b)
  if (!x && !y) return 0
  const { order } = sortBy.value.find((x) => x.key === key)
  if (!x) return order === 'asc' ? 1 : -1
  if (!y) return order === 'asc' ? -1 : 1
}

for (const header of headers.value) {
  if (header.sortFunc) {
    header.sort = (a, b) => nullSorter(header.key, header.sortFunc, a, b)
  }
}

/** Data for the run time column, for each task's latest job. */
const taskRunTimes = computed(() => new Map(
  props.tasks.map(({ task, latestJob }) => [
    task.id,
    {
      actual: getRunTime(latestJob?.node),
      estimate: task.node?.task?.meanElapsedTime,
    }
  ])
))

const jobIconParentProps = {
  class: ['d-flex', 'align-center'],
  style: { width: '2em' },
}

const itemsPerPageOptions = [
  { value: 10, title: '10' },
  { value: 20, title: '20' },
  { value: 50, title: '50' },
  { value: 100, title: '100' },
  { value: 200, title: '200' },
  { value: -1, title: 'All' },
]

</script>
