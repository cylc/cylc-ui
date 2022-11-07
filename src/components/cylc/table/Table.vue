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
      class="d-flex flex-wrap table-option-bar no-gutters flex-grow-0"
    >
      <!-- Filters -->
      <v-col
        v-if="filterable"
        class=""
      >
        <v-row class="no-gutters">
          <v-col
            cols="12"
            md="6"
            class="pr-md-2 mb-2 mb-md-0"
          >
            <v-text-field
              id="c-table-filter-task-name"
              clearable
              dense
              flat
              hide-details
              outlined
              placeholder="Filter by task name"
              v-model.trim="tasksFilter.name"
              @keyup="filterTasks"
              @click:clear="clearInput"
              ref="filterNameInput"
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="mb-2 mb-md-0"
          >
            <v-select
              id="c-table-filter-task-states"
              :items="taskStates"
              clearable
              dense
              flat
              hide-details
              multiple
              outlined
              placeholder="Filter by task state"
              v-model="tasksFilter.states"
              @change="filterTasks"
            >
              <template v-slot:item="slotProps">
                <Task :task="{ state: slotProps.item.value }" />
                <span class="ml-2">{{ slotProps.item.value }}</span>
              </template>
              <template v-slot:selection="slotProps">
                <div class="mr-2" v-if="slotProps.index >= 0 && slotProps.index < maximumTasks">
                  <Task :task="{ state: slotProps.item.value }" />
                </div>
                <span
                  v-if="slotProps.index === maximumTasks"
                  class="grey--text caption"
                >
                  (+{{ tasksFilter.states.length - maximumTasks }})
                </span>
              </template>
            </v-select>
          </v-col>
        </v-row>
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
          class="ma-0 pa-0 w-100 h-100 left-0 top-0 position-absolute"
        >
          <v-data-table
            :headers="headers"
            :items="filteredTasks"
            :single-expand="false"
            :expanded.sync="expanded"
            multi-sort
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            item-key="task.id"
            show-expand
            dense
            :footer-props="{
              itemsPerPageOptions: [10, 20, 50, 100, 200, -1],
              showFirstLastPage: true
            }"
            :options="{ itemsPerPage: 50 }"
          >
            <template
              v-slot:item="{ item }"
            >
              <tr>
                <td>
                  <div class="d-flex align-content-center flex-nowrap">
                    <div class="mr-1">
                      <Task
                        v-cylc-object="item.task.node"
                        :task="item.task.node"
                        :startTime="taskStartTime(item.task.node, (item.latestJob || {}).node)"
                      />
                    </div>
                    <div class="mr-1">
                      <Job
                        v-cylc-object="item.task.node"
                        :status="item.task.node.state"
                        :previous-state="((item.previousJob || {}).node || {}).state"
                      />
                    </div>
                    <div>{{ item.task.name }}</div>
                  </div>
                </td>
                <td>
                  <v-btn
                    icon
                    class="v-data-table__expand-icon"
                    @click="expanded.push(item)"
                    v-if="
                      (item.task.children|| []).length > 0 &&
                      !expanded.includes(item)
                    "
                  >
                    <v-icon>{{ icons.mdiChevronDown }}</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    class="v-data-table__expand-icon v-data-table__expand-icon--active"
                    @click="expanded.splice(expanded.indexOf(item), 1)"
                    v-if="
                      (item.task.children || []).length > 0 &&
                      expanded.includes(item)
                    "
                  >
                    <v-icon>{{ icons.mdiChevronDown }}</v-icon>
                  </v-btn>
                </td>
                <td>{{ item.task.tokens.cycle }}</td>
                <td>{{ ((item.latestJob || {}).node || {}).platform }}</td>
                <td>{{ ((item.latestJob || {}).node || {}).jobRunnerName }}</td>
                <td>{{ ((item.latestJob || {}).node || {}).jobId }}</td>
                <td>{{ ((item.latestJob || {}).node || {}).submittedTime }}</td>
                <td>{{ ((item.latestJob || {}).node || {}).startedTime }}</td>
                <td>{{ ((item.latestJob || {}).node || {}).finishedTime }}</td>
                <td>{{ item.task.node.meanElapsedTime }}</td>
              </tr>
            </template>
            <template v-slot:expanded-item="{ item }">
<!--                v-slot:expanded-item="{ headers, item }">-->
<!--              <td :colspan="headers.length">-->
<!--                More info about {{ item.node.id }}-->
<!--              </td>-->
              <tr
                v-bind:key="job.id"
                v-for="(job, index) in item.task.children"
                class="grey lighten-5"
              >
                <td>
                  <div class="d-flex align-content-center flex-nowrap">
                    <div class="mr-1">
                      <Job
                        v-cylc-object="job.node"
                        :key="`${job.id}-summary-${index}`"
                        :status="job.node.state"
                        style="margin-left: 1.3em;"
                      />
                      <span class="mx-1">#{{ job.node.submitNum }}</span>
                    </div>
                  </div>
                </td>
                <td></td>
                <td>
                  <!--{{ item.tokens.cycle }}-->
                </td>
                <td>{{job.node.platform }}</td>
                <td>{{job.node.jobRunnerName }}</td>
                <td>{{job.node.jobId }}</td>
                <td>{{job.node.submittedTime }}</td>
                <td>{{job.node.startedTime }}</td>
                <td>{{job.node.finishedTime }}</td>
                <td></td>
              </tr>
            </template>
          </v-data-table>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import TaskState from '@/model/TaskState.model'
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'
import cloneDeep from 'lodash/cloneDeep'
import { taskStartTime, taskEstimatedDuration } from '@/utils/tasks'
import { mdiChevronDown, mdiArrowDown } from '@mdi/js'
import { DEFAULT_COMPARATOR } from '@/components/cylc/common/sort'
import { datetimeComparator } from '@/components/cylc/table/sort'

export default {
  name: 'TableComponent',
  props: {
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
    Job
  },
  data () {
    return {
      icons: {
        mdiChevronDown,
        mdiArrowDown
      },
      sortBy: ['task.tokens.cycle'],
      sortDesc: [localStorage.cyclePointsOrderDesc ? JSON.parse(localStorage.cyclePointsOrderDesc) : true],
      expanded: [],
      headers: [
        {
          text: 'Task',
          value: 'task.name',
          sort: DEFAULT_COMPARATOR
        },
        {
          text: 'Jobs',
          value: 'data-table-expand',
          sortable: false
        },
        {
          text: 'Cycle Point',
          value: 'task.tokens.cycle',
          sort: (a, b) => DEFAULT_COMPARATOR(String(a ?? ''), String(b ?? ''))
        },
        {
          text: 'Platform',
          value: 'latestJob.node.platform',
          sort: (a, b) => DEFAULT_COMPARATOR(a ?? '', b ?? '')
        },
        {
          text: 'Job System',
          value: 'latestJob.node.jobRunnerName',
          sort: (a, b) => DEFAULT_COMPARATOR(a ?? '', b ?? '')
        },
        {
          text: 'Job ID',
          value: 'latestJob.node.jobId',
          sort: (a, b) => DEFAULT_COMPARATOR(a ?? '', b ?? '')
        },
        {
          text: 'T-submit',
          value: 'latestJob.node.submittedTime',
          sort: (a, b) => datetimeComparator(a ?? '', b ?? '')
        },
        {
          text: 'T-start',
          value: 'latestJob.node.startedTime',
          sort: (a, b) => datetimeComparator(a ?? '', b ?? '')
        },
        {
          text: 'T-finish',
          value: 'latestJob.node.finishedTime',
          sort: (a, b) => datetimeComparator(a ?? '', b ?? '')
        },
        {
          text: 'dT-mean',
          value: 'task.meanElapsedTime',
          sort: (a, b) => parseInt(a ?? 0) - parseInt(b ?? 0)
        }
      ],
      tasksFilter: {
        name: '',
        states: []
      },
      activeFilters: null,
      maximumTasks: 4
    }
  },
  computed: {
    taskStates () {
      return TaskState.enumValues.map(taskState => {
        return {
          text: taskState.name.replace(/_/g, ' '),
          value: taskState.name
        }
      }).sort((left, right) => {
        return left.text.localeCompare(right.text)
      })
    },
    tasksFilterStates () {
      return this.activeFilters.states
    },
    filteredTasks () {
      const filterByName = this.filterByTaskName()
      const filterByState = this.filterByTaskState()
      return this.tasks.filter(task => {
        if (filterByName && filterByState) {
          return (
            task.task.name.includes(this.activeFilters.name) &&
            this.tasksFilterStates.includes(task.task.node.state)
          )
        } else if (filterByName) {
          return task.task.name.includes(this.activeFilters.name)
        } else if (filterByState) {
          return this.tasksFilterStates.includes(task.task.node.state)
        }
        return true
      })
    }
  },
  methods: {
    filterByTaskName () {
      return this.activeFilters &&
        this.activeFilters.name !== undefined &&
        this.activeFilters.name !== null &&
        this.activeFilters.name !== ''
    },
    filterByTaskState () {
      return this.activeFilters &&
        this.activeFilters.states !== undefined &&
        this.activeFilters.states !== null &&
        this.activeFilters.states.length > 0
    },
    filterTasks () {
      const taskNameFilterSet = this.tasksFilter.name !== undefined &&
        this.tasksFilter.name !== null &&
        this.tasksFilter.name !== ''
      const taskStatesFilterSet = this.tasksFilter.states !== undefined &&
        this.tasksFilter.states !== null &&
        this.tasksFilter.states.length > 0
      if (taskNameFilterSet || taskStatesFilterSet) {
        this.activeFilters = cloneDeep(this.tasksFilter)
      } else {
        this.activeFilters = null
      }
    },
    clearInput (event) {
      // I don't really like this, but we need to somehow force the 'change detection' to run again once the clear has taken place
      this.tasksFilter.name = null
      this.$refs.filterNameInput.$el.querySelector('input').dispatchEvent(new Event('keyup'))
    },
    taskStartTime,
    taskEstimatedDuration
  }
}
</script>
