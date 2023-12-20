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
    <v-container
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
          <v-text-field
            id="c-gantt-filter-job-name"
            clearable
            placeholder="Filter by job name"
            v-model.trim="jobsFilter.name"
            ref="filterNameInput"
          />
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
      <div
        id="gantt-toolbar"
        class="d-flex align-center flex-wrap my-2 col-gap-2 row-gap-4">

        <!-- Toolbar -->
        <v-defaults-provider>

          <!-- Box plot sort input teleports here -->
        </v-defaults-provider>
      </div>
      <GanttChart
        :jobs="filteredJobs"
        :timing-option="timingOption"
      />
    </v-container>
  </div>
</template>

<script>
import {
  debounce,
  pick,
} from 'lodash'
import gql from 'graphql-tag'
import { getPageTitle } from '@/utils/index'
import graphqlMixin from '@/mixins/graphql'
import GanttChart from '@/components/cylc/gantt/GanttChart.vue'
import {
  matchTask,
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
class GanttCallback {
  /**
   * @param {Object[]} jobs
   */
  constructor (jobs) {
    this.jobs = jobs
  }
  /**
   * Add jobs contained in data to this.jobs
   */

  add (data) {
    this.jobs.push(
      ...data.jobs.map((job) => pick(job, jobFields))
    )
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

  // other hooks we don't need but must declare (for now)
  before () {}
  after () {}
  onPruned () {}
  commit () {}
  tearDown () {}
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
      currentPage: 1,
      callback: new GanttCallback(jobs),
      /** Object containing all of the jobs added by the callback */
      jobs,
      timingOptions: [
        { value: 'totalTimes', title: 'Total times' },
        { value: 'runTimes', title: 'Run times' },
        { value: 'queueTimes', title: 'Queue times' },
      ],
      jobsFilter: {
        name: '',
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
      return this.jobs.filter(job => matchTask(job, this.jobsFilter))
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
}
</script>