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
      v-if="!Object.keys(callback.jobs).length"
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
            :items="$options.taskChoices"
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

<script>
import {
  debounce
} from 'lodash'
import gql from 'graphql-tag'
import graphqlMixin from '@/mixins/graphql'
import {
  initialOptions,
  useInitialOptions
} from '@/utils/initialOptions'
import GanttChart from '@/components/cylc/gantt/GanttChart.vue'
import DeltasCallback from '@/services/callbacks'
import {
  matchTasks,
  platformOptions
} from '@/components/cylc/gantt/filter'

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
  jobs(live: false, workflows: $workflows, states: ["succeeded"]) {
    ${jobFields.join('\n')}
  }
}
`

/** The callback which gets called when data comes in from the query */
export class GanttCallback extends DeltasCallback {
  constructor () {
    super()
    this.jobs = {}
  }
  /**
   * Add jobs contained in data to this.jobs
   */

  add (data) {
    this.uniqueTasks = Array.from(
      new Set(data.jobs.map((job) => job.name))
    )
    const sortedData = Object.fromEntries(this.uniqueTasks.map(key => [key, []]))
    for (let i = 0; i < data.jobs.length; i++) {
      sortedData[data.jobs[i].name].push(data.jobs[i])
    }
    Object.assign(this.jobs, sortedData)
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

  props: {
    initialOptions,
  },

  setup (props, { emit }) {
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

    return {
      tasksPerPage,
      jobsFilter,
    }
  },

  beforeMount () {
    this.jobsQuery()
  },

  data () {
    return {
      callback: new GanttCallback(),
      timingOptions: [
        { value: 'totalTimes', title: 'Total times' },
        { value: 'runTimes', title: 'Run times' },
        { value: 'queueTimes', title: 'Queue times' },
      ],
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
      return matchTasks(this.callback.jobs, this.jobsFilter)
    },
    platformOptions () {
      return platformOptions(this.callback.jobs)
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
