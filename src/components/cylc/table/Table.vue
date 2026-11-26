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
        :class="{ 'dimmed': item.task.node.graphDepth }"
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
    <!--
      Note: job column cells read the job fields here (per row) rather than
      via the column values (see jobColumn())
    -->
    <template
      v-for="field in jobTextFields"
      :key="field"
      #[`item.latestJob.node.${field}`]="{ item }"
    >
      {{ item.latestJob?.node?.[field] }}
    </template>
    <template #item.latestJob.node.finishedTime="{ item }">
      <EstimatedTime
        :actual="item.latestJob?.node?.finishedTime"
        :estimate="item.latestJob?.node?.estimatedFinishTime"
      />
    </template>
    <template #item.task.node.task.meanElapsedTime="{ item }">
      <EstimatedTime
        v-bind="getTaskRunTimes(item)"
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
          transform: isExpanded(internalItem) ? 'rotate(180deg)' : null,
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
import { ref } from 'vue'
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
  isTruthyOrZero,
} from '@/utils/tasks'
import FlowNumsChip from '@/components/cylc/common/FlowNumsChip.vue'
import EstimatedTime from '@/components/cylc/common/EstimatedTime.vue'

defineProps({
  tasks: {
    type: Array,
    required: true,
  },
  filterState: {
    type: [Object, null],
    default: null,
  },
})

const sortBy = defineModel('sortBy')
const page = defineModel('page')
const itemsPerPage = defineModel('itemsPerPage')

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
  jobColumn('Platform', 'platform', DEFAULT_COMPARATOR),
  jobColumn('Job Runner', 'jobRunnerName', DEFAULT_COMPARATOR),
  jobColumn('Job ID', 'jobId', DEFAULT_COMPARATOR),
  jobColumn('Submit', 'submittedTime', datetimeComparator),
  jobColumn('Start', 'startedTime', datetimeComparator),
  {
    title: 'Finish',
    key: 'latestJob.node.finishedTime',
    value: NO_VALUE,
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
    value: NO_VALUE,
    sortRaw (node1, node2) {
      const a = getTaskRunTimes(node1)
      const b = getTaskRunTimes(node2)
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
 * Column value function for columns whose cells are rendered via slots.
 *
 * Vuetify builds its internal list of items by reading the value of every
 * column for every row. If those values come from jobs, then any change to
 * any job (e.g. a job starting or finishing) makes Vuetify rebuild (and
 * re-sort) every item and re-render every visible row, which is very slow for
 * large workflows. So for job-related columns we don't provide a value;
 * the cells are rendered by slots (which only re-render the affected row) and
 * sorting is done via sortRaw (which only reads the job fields when sorting
 * by that column).
 */
function NO_VALUE () {
  return undefined
}

/**
 * Return a header for a column displaying a field of the latest job.
 *
 * @param {string} title
 * @param {string} field - the job field.
 * @param {function} sortFunc - comparator for the field values.
 */
function jobColumn (title, field, sortFunc) {
  const key = `latestJob.node.${field}`
  return {
    title,
    key,
    value: NO_VALUE,
    sortRaw: (row1, row2) => nullSorter(
      key,
      sortFunc,
      row1.latestJob?.node?.[field],
      row2.latestJob?.node?.[field]
    ),
  }
}

/** Job fields displayed as plain text. */
const jobTextFields = ['platform', 'jobRunnerName', 'jobId', 'submittedTime', 'startedTime']

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

/**
 * Data for the run time column for a row (based on the task's latest job).
 *
 * Note: this is computed per row (rather than as a computed property for all
 * rows) so that a change to one job's times only re-renders that row.
 */
function getTaskRunTimes ({ task, latestJob }) {
  return {
    actual: getRunTime(latestJob?.node),
    estimate: task.node?.task?.meanElapsedTime,
  }
}

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
