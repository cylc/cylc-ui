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
  <div class="c-gantt">
    <v-skeleton-loader
      v-if="!jobs.length"
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
          class="pr-md-2 mb-2 mb-md-0"
        >
          <v-autocomplete
            multiple
            chips
            closable-chips
            clearable
            placeholder="Search"
            :items="callback.uniqueTasks"
            v-model="jobsFilter.name"
            label="Select tasks"
            ref="selectTasks"
          >
          </v-autocomplete>
        </v-col>
        <v-col
          cols="12"
          md="4"
          class="mb-2 mb-md-0"
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
          class="pl-md-2 mb-2 mb-md-0"
        >
          <v-select
            id="c-gantt-filter-job-platforms"
            :items="platformOptions"
            prefix="Platform:"
            v-model="jobsFilter.platformOption"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col
          cols="12"
          md="4"
          class="pr-md-2 mb-2 mb-md-0"
        >
          <v-select
            id="c-gantt-tasks-per-page"
            :items="$options.taskChoices"
            prefix="Tasks Per Page"
            v-model="tasksPerPage"/>
        </v-col>
      </v-row>
      <div
        id="gantt-toolbar"
        class="d-flex align-center flex-wrap my-2 col-gap-2 row-gap-4">
      </div>
      <GanttChart
        :jobs="filteredJobs"
        :timing-option="timingOption"
        :tasks-per-page="tasksPerPage"
      />
    </v-container>
  </div>
</template>

<script>
import {
  debounce
} from 'lodash'
import gql from 'graphql-tag'
import { getPageTitle } from '@/utils/index'
import graphqlMixin from '@/mixins/graphql'
import GanttChart from '@/components/cylc/gantt/GanttChart.vue'
import DeltasCallback from '@/services/callbacks'
import {
  matchTasks,
  platformOptions
} from '@/components/cylc/analysis/filter'
/** List of fields to request for each job */
const jobFields = [
  'name',
  'id',
  'submittedTime',
  'startedTime',
  'finishedTime',
  'platform'
]
/** The query which retrieves historical Job timing statistics */
const QUERY = gql`
query ganttQuery ($workflows: [ID]) {
  jobs(live: false, workflows: $workflows) {
    ${jobFields.join('\n')}
  }
}
`
/** The callback which gets called when data comes in from the query */
export class GanttCallback extends DeltasCallback {
  /**
   * @param {Object[]} jobs
   */
  constructor (jobs) {
    super(jobs)
    this.jobs = jobs
  }
  /**
   * Add jobs contained in data to this.jobs
   */

  add (data) {
    const taskNameList = Array.from(
      new Set(data.jobs.map((job) => job.name))
    )
    this.uniqueTasks = Array.from(
      new Set(data.jobs.map((job) => job.name))
    )
    const sortedData = Object.fromEntries(taskNameList.map(key => [key, []]))
    for (let i = 0; i < data.jobs.length; i++) {
      sortedData[data.jobs[i].name].push(data.jobs[i])
    }
    this.jobs.push(sortedData)
  }
  // called when new objects are added
  // NOTE: we manually call this to add items which come through on the query

  onAdded (added, store, errors) {
    this.add(added)
  }

  // called when existing objects are updated
  onUpdated (updated, store, errors) {
    this.add(updated)
  }
}
export default {
  name: 'Gantt',
  mixins: [
    graphqlMixin
  ],
  components: {
    GanttChart,
  },
  head () {
    return {
      title: getPageTitle('App.workflow', { name: this.workflowName })
    }
  },
  beforeMount () {
    this.jobsQuery()
  },
  data () {
    const jobs = []
    return {
      tasksPerPage: 10,
      callback: new GanttCallback(jobs),
      /** Object containing all of the jobs added by the callback */
      jobs,
      timingOptions: [
        { value: 'totalTimes', title: 'Total times' },
        { value: 'runTimes', title: 'Run times' },
        { value: 'queueTimes', title: 'Queue times' },
      ],
      jobsFilter: {
        name: [],
        timingOption: 'totalTimes',
        platformOption: -1,
      },
    }
  },
  computed: {
    // a list of the workflow IDs this view is "viewing"
    // NOTE: we plan multi-workflow functionality so we are writing views
    // to be mult-workflow compatible in advance of this feature arriving
    workflowIDs () {
      return [this.workflowId]
    },
    filteredJobs () {
      if (this.jobsFilter.name.length === 0) {
        return this.jobs
      }
      return [matchTasks(this.jobs[0], this.jobsFilter)]
    },
    platformOptions () {
      return platformOptions(this.jobs)
    },
    timingOption () {
      return this.jobsFilter.timingOption.replace(/Times/, '')
    },
  },
  methods: {
    /**
     * Run the one-off query for historical job data and pass its results
     * through the callback
     */
    jobsQuery: debounce(
      async function () {
        this.jobs = []
        this.callback = new GanttCallback(this.jobs)
        const ret = await this.$workflowService.query2(
          QUERY,
          { workflows: this.workflowIDs }
        )
        this.callback.onAdded(ret.data)
      },
      200 // only re-run this once every 0.2 seconds
    ),
  },
  taskChoices: [
    10, 25, 50, 100
  ],
}
</script>
