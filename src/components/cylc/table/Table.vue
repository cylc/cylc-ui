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
                <Task :status="slotProps.item.value"/>
                <span class="ml-2">{{ slotProps.item.value }}</span>
              </template>
              <template v-slot:selection="slotProps">
                <div class="mr-2" v-if="slotProps.index >= 0 && slotProps.index < maximumTasks">
                  <Task :status="slotProps.item.value"/>
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
        class="overflow-y-scroll mh-100 position-relative hide-scroll-bars"
      >
        <v-container
          fluid
          class="ma-0 pa-0 w-100 h-100 left-0 top-0 position-absolute"
        >
          <v-data-table
            :headers.sync="headers"
            :items.sync="filteredTasks"
            :single-expand="false"
            :expanded.sync="expanded"
            :hide-default-header="true"
            item-key="id"
            show-expand
          >
            <template
              v-slot:header="{ props: { headers } }"
            >
              <thead>
                <tr>
                  <th class="px-2" v-bind:key="header.id" v-for="(header) in headers">
                    <v-btn x-small plain @click="toggleColumnSort(header.text)" v-text="header.text"></v-btn>
                    <v-btn icon x-small class="v-data-table__expand-icon" @click="toggleColumnSortDirection(header.text)" v-if="sortBy.includes(header.text) && sortDesc[sortBy.indexOf(header.text)]">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path></svg>
                    </v-btn>
                    <v-btn icon x-small class="v-data-table__expand-icon v-data-table__expand-icon--active" @click="toggleColumnSortDirection(header.text)" v-if="sortBy.includes(header.text) && !sortDesc[sortBy.indexOf(header.text)]">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path></svg>
                    </v-btn>
                  </th>
                </tr>
              </thead>
            </template>
            <template
                slot="item"
                slot-scope="{ item }"
              >
              <tr>
                <td>
                  <div class="d-flex align-content-center flex-nowrap">
                    <div class="mr-1">
                      <Task
                        v-cylc-object="item.id"
                        :status="item.node.state"
                        :isHeld="item.node.isHeld"
                        :isQueued="item.node.isQueued"
                        :isRunahead="item.node.isRunahead"
                        :startTime="taskStartTime(item.node, item.latestJob)"
                        :estimatedDuration="taskEstimatedDuration(item.node)"
                      />
                    </div>
                    <div class="mr-1">
                      <Job
                        :status="item.node.state"
                        :previous-state="item.jobs.length > 1 ? item.jobs[1].state : ''"
                      />
                    </div>
                    <div>{{ item.node.name }}</div>
                  </div>
                </td>
                <td>
                  <v-btn icon class="v-data-table__expand-icon" @click="expanded.push(item)" v-if="item.jobs.length > 0 && !expanded.includes(item)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path></svg>
                  </v-btn>
                  <v-btn icon class="v-data-table__expand-icon v-data-table__expand-icon--active" @click="expanded.splice(expanded.indexOf(item), 1)" v-if="item.jobs.length > 0 && expanded.includes(item)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path></svg>
                  </v-btn>
                </td>
                <td>{{ item.node.cyclePoint }}</td>
                <td>{{ item.latestJob.platform }}</td>
                <td>{{ item.latestJob.jobRunnerName }}</td>
                <td>{{ item.latestJob.jobId }}</td>
                <td>{{ item.latestJob.submittedTime }}</td>
                <td>{{ item.latestJob.startedTime }}</td>
                <td>{{ item.latestJob.finishedTime }}</td>
                <td>{{ item.meanElapsedTime }}</td>
              </tr>
            </template>
            <template v-slot:expanded-item="{ item }">
<!--                v-slot:expanded-item="{ headers, item }">-->
<!--              <td :colspan="headers.length">-->
<!--                More info about {{ item.node.id }}-->
<!--              </td>-->
              <tr v-bind:key="job.id" v-for="(job, index) in item.jobs" class="grey lighten-5">
                <td>
                  <div class="d-flex align-content-center flex-nowrap">
                    <div class="mr-1">
                      <job
                        v-cylc-object="job.id"
                        :key="`${job.id}-summary-${index}`"
                        :status="job.state"
                        style="margin-left: 1.3em;"
                      />
                      <span class="mx-1">#{{ job.submitNum }}</span>
                    </div>
                  </div>
                </td>
                <td></td>
                <td>
                  <!--{{ item.node.cyclePoint }}-->
                </td>
                <td>{{ job.platform }}</td>
                <td>{{ job.jobRunnerName }}</td>
                <td>{{ job.jobId }}</td>
                <td>{{ job.submittedTime }}</td>
                <td>{{ job.startedTime }}</td>
                <td>{{ job.finishedTime }}</td>
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
      sortBy: [],
      sortDesc: [],
      expanded: [],
      headers: [
        {
          text: 'Task'
        },
        {
          text: 'Jobs',
          value: 'data-table-expand'
        },
        {
          text: 'Cycle Point'
        },
        {
          text: 'Host'
        },
        {
          text: 'Job System'
        },
        {
          text: 'Job ID'
        },
        {
          text: 'T-submit'
        },
        {
          text: 'T-start'
        },
        {
          text: 'T-finish'
        },
        {
          text: 'dT-mean'
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
      let filteredSortedTasks = this.tasks
        .filter(task => {
          if (filterByName && filterByState) {
            return task.node.name.includes(this.activeFilters.name) && this.tasksFilterStates.includes(task.node.state)
          } else if (filterByName) {
            return task.node.name.includes(this.activeFilters.name)
          } else if (filterByState) {
            return this.tasksFilterStates.includes(task.node.state)
          }
          return true
        })
      this.sortBy.forEach(sortByProperty => {
        filteredSortedTasks = filteredSortedTasks.sort((taskA, taskB) => {
          let valueA
          let valueB
          const sortDesc = this.sortDesc[this.sortBy.indexOf(sortByProperty)]
          switch (sortByProperty) {
          case 'Task':
            valueA = typeof taskA.node.name !== 'undefined' ? taskA.node.name : ''
            valueB = typeof taskB.node.name !== 'undefined' ? taskB.node.name : ''
            return sortDesc ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB)
          case 'Cycle Point':
            valueA = taskA.node.cyclePoint !== '' && typeof taskA.node.cyclePoint !== 'undefined' ? (new Date(taskA.node.cyclePoint)).getTime() : 0
            valueB = taskB.node.cyclePoint !== '' && typeof taskB.node.cyclePoint !== 'undefined' ? (new Date(taskB.node.cyclePoint)).getTime() : 0
            return sortDesc ? valueB - valueA : valueA - valueB
          case 'Jobs':
            valueA = typeof taskA.jobs !== 'undefined' ? taskA.jobs.length : 0
            valueB = typeof taskB.jobs !== 'undefined' ? taskB.jobs.length : 0
            return sortDesc ? valueB - valueA : valueA - valueB
          case 'Host':
            valueA = typeof taskA.latestJob.platform !== 'undefined' ? taskA.latestJob.platform : ''
            valueB = typeof taskB.latestJob.platform !== 'undefined' ? taskB.latestJob.platform : ''
            return sortDesc ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB)
          case 'Job System':
            valueA = typeof taskA.latestJob.jobRunnerName !== 'undefined' ? taskA.latestJob.jobRunnerName : ''
            valueB = typeof taskB.latestJob.jobRunnerName !== 'undefined' ? taskB.latestJob.jobRunnerName : ''
            return sortDesc ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB)
          case 'Job ID':
            valueA = typeof taskA.latestJob.jobId !== 'undefined' ? taskA.latestJob.jobId : 0
            valueB = typeof taskB.latestJob.jobId !== 'undefined' ? taskB.latestJob.jobId : 0
            return sortDesc ? valueB - valueA : valueA - valueB
          case 'T-submit':
            valueA = taskA.latestJob.submittedTime !== '' && typeof taskA.latestJob.submittedTime !== 'undefined' ? (new Date(taskA.latestJob.submittedTime)).getTime() : 0
            valueB = taskB.latestJob.submittedTime !== '' && typeof taskB.latestJob.submittedTime !== 'undefined' ? (new Date(taskB.latestJob.submittedTime)).getTime() : 0
            return sortDesc ? valueB - valueA : valueA - valueB
          case 'T-start':
            valueA = taskA.latestJob.startedTime !== '' && typeof taskA.latestJob.startedTime !== 'undefined' ? (new Date(taskA.latestJob.startedTime)).getTime() : 0
            valueB = taskB.latestJob.startedTime !== '' && typeof taskB.latestJob.startedTime !== 'undefined' ? (new Date(taskB.latestJob.startedTime)).getTime() : 0
            return sortDesc ? valueB - valueA : valueA - valueB
          case 'T-finish':
            valueA = taskA.latestJob.finishedTime !== '' && typeof taskA.latestJob.finishedTime !== 'undefined' ? (new Date(taskA.latestJob.finishedTime)).getTime() : 0
            valueB = taskB.latestJob.finishedTime !== '' && typeof taskB.latestJob.finishedTime !== 'undefined' ? (new Date(taskB.latestJob.finishedTime)).getTime() : 0
            return sortDesc ? valueB - valueA : valueA - valueB
          case 'dT-mean':
            valueA = typeof taskA.meanElapsedTime !== 'undefined' ? taskA.meanElapsedTime : 0
            valueB = typeof taskB.meanElapsedTime !== 'undefined' ? taskB.meanElapsedTime : 0
            return sortDesc ? valueB - valueA : valueA - valueB
          default:
            return 0
          }
        })
      })
      return filteredSortedTasks
    }
  },
  methods: {
    toggleColumnSort (headingText) {
      if (this.sortBy.indexOf(headingText) < 0) {
        this.sortBy.push(headingText)
        this.sortDesc.push(true)
      } else {
        this.sortBy.splice(this.sortBy.indexOf(headingText), 1)
        this.sortDesc.splice(this.sortBy.indexOf(headingText), 1)
      }
    },
    toggleColumnSortDirection (headingText) {
      this.sortDesc.splice(this.sortBy.indexOf(headingText), 1, !this.sortDesc[this.sortBy.indexOf(headingText)])
    },
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
    taskStartTime,
    taskEstimatedDuration
  }
}
</script>
