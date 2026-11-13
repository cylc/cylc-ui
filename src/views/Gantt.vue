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
  <div class="c-gantt">
    <v-skeleton-loader
      v-if="!Object.keys(jobs).length"
      type="table"
      class="align-content-start"
    />
    <v-container
      v-else
      fluid
      class="pa-2"
    >
      <!-- Filters -->
      <v-row no-gutters>
        <v-col
          cols="12"
          md="4"
          class="pr-md-2 mb-2"
        >
          <v-autocomplete
            id="c-gantt-filter-job-name"
            multiple
            chips
            closable-chips
            clearable
            placeholder="Search"
            :items="uniqueTasks"
            v-model="jobsFilter.name"
            label="Select tasks"
            ref="selectTasks"
          >
          </v-autocomplete>
        </v-col>
        <v-col
          cols="12"
          md="4"
          class="mb-2"
        >
          <v-select
            id="c-gantt-filter-job-timings"
            :items="timingOptions"
            prefix="Displaying:"
            v-model="jobsFilter.timingOption"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
          class="pl-md-2 mb-2"
        >
          <v-select
            id="c-gantt-filter-job-platforms"
            :items="platformOptions"
            prefix="Platform:"
            v-model="jobsFilter.platformOption"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
          class="pr-md-2 mb-2"
        >
          <v-select
            id="c-gantt-tasks-per-page"
            :items="taskChoices"
            prefix="Tasks Per Page"
            v-model="tasksPerPage"/>
        </v-col>
      </v-row>
      <GanttChart
        :jobs="filteredJobs"
        :timing-option="timingOption"
        :tasks-per-page="tasksPerPage"
      />
    </v-container>
  </div>
</template>

<script setup>
import { inject, onBeforeMount, ref, computed } from 'vue'
import gql from 'graphql-tag'
import { useWorkflowVariables } from '@/mixins/graphql'
import {
  initialOptions as initialOptionsProp,
  updateInitialOptionsEvent,
  useInitialOptions,
} from '@/utils/initialOptions'
import GanttChart from '@/components/cylc/gantt/GanttChart.vue'
import {
  matchTasks,
  getPlatformOptions,
} from '@/components/cylc/gantt/filter'

/** List of fields to request for each job */
const jobFields = [
  'name',
  'id',
  'submittedTime',
  'startedTime',
  'finishedTime',
  'platform',
]

/** The query which retrieves historical Job timing statistics */
const QUERY = gql`
query ganttQuery ($workflows: [ID]) {
  jobs(live: false, workflows: $workflows, states: ["succeeded"]) {
    ${jobFields.join('\n')}
  }
}
`

const props = defineProps({
  initialOptions: initialOptionsProp,
})

const emit = defineEmits([updateInitialOptionsEvent])

/** @type {import('@/services/workflow.service').WorkflowService} */
const workflowService = inject('workflowService')

/**
 * The tasks per page filter state.
 * @type {import('vue').Ref<number>}
 */
const tasksPerPage = useInitialOptions('tasksPerPage', { props, emit }, 10)

/**
 * The task name, timing option and platform filter state.
 * @type {import('vue').Ref<object>}
 */
const jobsFilter = useInitialOptions('jobsFilter', { props, emit }, {
  name: [],
  timingOption: 'totalTimes',
  platformOption: -1,
})

const { workflowIDs } = useWorkflowVariables()

const jobs = ref({})
const uniqueTasks = computed(() => Object.keys(jobs.value))

onBeforeMount(() => {
  jobsQuery()
})

const timingOptions = ref([
  { value: 'totalTimes', title: 'Total times' },
  { value: 'runTimes', title: 'Run times' },
  { value: 'queueTimes', title: 'Queue times' },
])

const filteredJobs = computed(
  () => matchTasks(jobs.value, jobsFilter.value)
)
const platformOptions = computed(
  () => getPlatformOptions(jobs.value)
)
const timingOption = computed(
  () => jobsFilter.value.timingOption.replace(/Times/, '')
)

/**
 * Run the one-off query for historical job data.
 */
async function jobsQuery () {
  const { data } = await workflowService.query2(
    QUERY,
    { workflows: workflowIDs.value }
  )
  jobs.value = Object.groupBy(data.jobs, (job) => job.name)
}

const taskChoices = [
  10, 25, 50, 100,
]
</script>
