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
        <TaskFilter v-model="tasksFilterLocal"/>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="flex-grow-1 position-relative"
    >
      <v-col
        cols="12"
        class="mh-100 position-relative"
      >
        <v-container
          fluid
          class="ma-0 pa-0 w-100 h-100 left-0 top-0 position-absolute pt-2"
        >
          <v-data-table
            :headers="$options.headers"
            :items="filteredTasks"
            item-value="task.id"
            multi-sort
            :sort-by="sortBy"
            show-expand
            density="compact"
            v-model:items-per-page="itemsPerPage"
          >
            <template v-slot:item.task.name="{ item }">
              <div class="d-flex align-content-center flex-nowrap">
                <div style="width: 2em;">
                  <Task
                    v-cylc-object="item.task"
                    :task="item.task.node"
                    :startTime="item.latestJob?.node?.startedTime"
                  />
                </div>
                <div style="width: 2em;">
                  <Job
                    v-if="item.latestJob"
                    v-cylc-object="item.latestJob"
                    :status="item.latestJob.node.state"
                    :previous-state="item.previousJob?.node?.state"
                  />
                </div>
                <div>{{ item.task.name }}</div>
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
                  :icon="$options.icons.mdiChevronDown"
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
                        v-cylc-object="job"
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
              <v-data-table-footer :itemsPerPageOptions="$options.itemsPerPageOptions" />
            </template>
          </v-data-table>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue'
import Task from '@/components/cylc/Task.vue'
import Job from '@/components/cylc/Job.vue'
import { mdiChevronDown } from '@mdi/js'
import { DEFAULT_COMPARATOR } from '@/components/cylc/common/sort'
import { datetimeComparator } from '@/components/cylc/table/sort'
import { matchNode } from '@/components/cylc/common/filter'
import TaskFilter from '@/components/cylc/TaskFilter.vue'
import { dtMean } from '@/utils/tasks'
import { useCyclePointsOrderDesc } from '@/composables/localStorage'

export default {
  name: 'TableComponent',

  props: {
    tasksFilter: {
      type: Object,
      required: true
    },
    tasks: {
      type: Array,
      required: true
    },
    filterable: {
      type: Boolean,
      default: true
    }
  },

  components: {
    Task,
    Job,
    TaskFilter
  },

  setup () {
    const cyclePointsOrderDesc = useCyclePointsOrderDesc()
    return {
      itemsPerPage: ref(50),
      sortBy: ref([
        {
          key: 'task.tokens.cycle',
          order: cyclePointsOrderDesc.value ? 'desc' : 'asc'
        },
      ]),
    }
  },

  data () {
    return {
      tasksFilterLocal: this.tasksFilter,
    }
  },

  computed: {
    filteredTasks () {
      return this.tasks.filter(({ task }) => matchNode(task, this.tasksFilterLocal.id, this.tasksFilterLocal.states))
    }
  },

  methods: {
    dtMean
  },

  headers: [
    {
      title: 'Task',
      key: 'task.name',
      sortable: true,
      sort: DEFAULT_COMPARATOR
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
      sort: (a, b) => DEFAULT_COMPARATOR(String(a ?? ''), String(b ?? ''))
    },
    {
      title: 'Platform',
      key: 'latestJob.node.platform',
      sortable: true,
      sort: (a, b) => DEFAULT_COMPARATOR(a ?? '', b ?? '')
    },
    {
      title: 'Job Runner',
      key: 'latestJob.node.jobRunnerName',
      sortable: true,
      sort: (a, b) => DEFAULT_COMPARATOR(a ?? '', b ?? '')
    },
    {
      title: 'Job ID',
      key: 'latestJob.node.jobId',
      sortable: true,
      sort: (a, b) => DEFAULT_COMPARATOR(a ?? '', b ?? '')
    },
    {
      title: 'Submit',
      key: 'latestJob.node.submittedTime',
      sortable: true,
      sort: (a, b) => datetimeComparator(a ?? '', b ?? '')
    },
    {
      title: 'Start',
      key: 'latestJob.node.startedTime',
      sortable: true,
      sort: (a, b) => datetimeComparator(a ?? '', b ?? '')
    },
    {
      title: 'Finish',
      key: 'latestJob.node.finishedTime',
      sortable: true,
      sort: (a, b) => datetimeComparator(a ?? '', b ?? '')
    },
    {
      title: 'Run Time',
      key: 'task.node.task.meanElapsedTime',
      sortable: true,
      sort: (a, b) => parseInt(a ?? 0) - parseInt(b ?? 0)
    },
  ],

  icons: {
    mdiChevronDown
  },

  itemsPerPageOptions: [
    { value: 10, title: '10' },
    { value: 20, title: '20' },
    { value: 50, title: '50' },
    { value: 100, title: '100' },
    { value: 200, title: '200' },
    { value: -1, title: 'All' }
  ]
}
</script>
