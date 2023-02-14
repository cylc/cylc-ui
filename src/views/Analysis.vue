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
  <div class="c-analysis" style="width: 100%; height: 100%">
    <v-container
    fluid
    class="c-table ma-0 pa-2 h-100 flex-column d-flex"
    >
      <!-- Toolbar -->
      <v-row
        class="d-flex flex-wrap table-option-bar no-gutters flex-grow-0"
      >
        <!-- Filters -->
        <v-row class="no-gutters">
          <v-col
            cols="12"
            md="4"
            class="pr-md-2 mb-2 mb-md-0"
          >
            <v-text-field
              id="c-analysis-filter-task-name"
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
            md="4"
            class="mb-2 mb-md-0"
          >
            <v-select
              id="c-analysis-filter-task-timings"
              :items="timingOptions"
              dense
              flat
              hide-details
              outlined
              prefix="Displaying: "
              v-model="tasksFilter.timingOption"
            ></v-select>
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="pl-md-2 mb-2 mb-md-0"
          >
            <v-select
              id="c-analysis-filter-task-platforms"
              :items="platformOptions"
              dense
              flat
              hide-details
              outlined
              prefix="Platform: "
              v-model="tasksFilter.platformOption"
              @change="filterTasks"
            ></v-select>
          </v-col>
        </v-row>
      </v-row>
      <ViewToolbar :groups="groups" />
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
              :headers="shownHeaders"
              :items="filteredTasks"
              :sort-by.sync="sortBy"
              dense
              :footer-props="{
                itemsPerPageOptions: [10, 20, 50, 100, 200, -1],
                showFirstLastPage: true
              }"
              :options="{ itemsPerPage: 50 }"
            ></v-data-table>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import pick from 'lodash/pick'
import Vue from 'vue'
import gql from 'graphql-tag'
import pageMixin from '@/mixins/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionViewMixin from '@/mixins/subscriptionView'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import ViewToolbar from '@/components/cylc/ViewToolbar'
import {
  mdiChartLine
} from '@mdi/js'

// list of fields to request for jobs
const jobFields = [
  'id',
  'name',
  'state',
  'platform',
  'submittedTime',
  'startedTime',
  'finishedTime'
]

// the one-off query which retrieves historical objects not
// normally visible in the GUI
const QUERY = gql`
query ($workflows: [ID]) {
  jobs(live: false, workflows: $workflows) {
    ${jobFields.join('\n')}
  }
}
`

// the subscription which keeps up to date with the live
// state of the workflow
const SUBSCRIPTION = gql`
subscription WorkflowGraphSubscription ($workflowId: ID) {
  deltas(workflows: [$workflowId]) {
    ...Deltas
  }
}

fragment JobData on Job {
  ${jobFields.join('\n')}
}

fragment AddedDelta on Added {
  jobs {
    ...JobData
  }
}

fragment UpdatedDelta on Updated {
  jobs {
    ...JobData
  }
}

fragment Deltas on Deltas {
  added {
    ...AddedDelta
  }
  updated (stripNull: true) {
    ...UpdatedDelta
  }
}
`

// the callback which gets automatically called when data comes in on
// the subscription
class AnalysisCallback {
  constructor (jobs) {
    this.jobs = jobs
  }

  add (data) {
    // add jobs contained in data to this.jobs
    for (const job of data.jobs) {
      if (job.id in this.jobs) {
        // merge new data into existing entry
        const storedJob = this.jobs[job.id]
        for (const field of jobFields) {
          if (job[field]) {
            Vue.set(storedJob, field, job[field])
          }
        }
      } else {
        // add new entry
        Vue.set(
          this.jobs,
          job.id,
          pick(job, jobFields)
        )
      }
    }
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
  mixins: [
    pageMixin,
    graphqlMixin,
    subscriptionComponentMixin,
    subscriptionViewMixin
  ],

  name: 'Analysis',

  components: {
    ViewToolbar
  },

  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  data () {
    const jobs = {}
    return {
      // defines how the view view appears in the "add view" dropdown
      widget: {
        title: 'analysis',
        icon: mdiChartLine
      },
      // defines controls which get added to the toolbar
      // (see Graph.vue for example usage)
      groups: [
        {
          title: 'Analysis',
          controls: [
          ]
        }
      ],
      // instance of the callback class
      callback: new AnalysisCallback(jobs),
      // object containing all of the jobs added by the callback
      jobs,
      sortBy: 'name',
      timingOptions: [
        { text: 'Total times', value: 'totalTimes' },
        { text: 'Run times', value: 'runTimes' },
        { text: 'Queue times', value: 'queueTimes' }
      ],
      tasksFilter: {
        name: '',
        timingOption: 'totalTimes',
        platformOption: null
      },
      activeFilters: null,
      headers: [
        {
          text: 'Task',
          value: 'name'
        },
        {
          text: 'Platform',
          value: 'platform'
        },
        {
          text: 'Count',
          value: 'successfulJobs'
        },
        {
          text: 'Failure rate (%)',
          value: 'failureRate'
        }
      ],
      queueTimeHeaders: [
        {
          text: 'Mean T-queue (s)',
          value: 'meanQueueTime'
        }
      ],
      runTimeHeaders: [
        {
          text: 'Mean T-run (s)',
          value: 'meanRunTime'
        }
      ],
      totalTimeHeaders: [
        {
          text: 'Mean T-total (s)',
          value: 'meanTotalTime'
        }
      ]
    }
  },

  computed: {
    // registers the subscription (unhelpfully named query)
    // (this is called automatically)
    query () {
      this.historicalQuery() // TODO order
      return new SubscriptionQuery(
        SUBSCRIPTION,
        this.variables,
        'workflow',
        [this.callback]
      )
    },

    // a list of the workflow IDs this view is "viewing"
    // NOTE: we plan multi-workflow functionality so we are writing views
    // to be mult-workflow compatible in advance of this feature arriving
    workflowIDs () {
      return [this.workflowId]
    },
    tasks () {
      const tasks = {}
      for (const [key, job] of Object.entries(this.jobs)) {
        if (job.state === '0' || job.state === 'succeeded') {
          // Calculate timings in seconds
          const submittedT = new Date(job.submittedTime)
          const startedT = new Date(job.startedTime)
          const finishedT = new Date(job.finishedTime)
          const queueT = (startedT - submittedT) / 1000
          const runT = (finishedT - startedT) / 1000
          const totalT = (finishedT - submittedT) / 1000

          if (job.name in tasks) {
            tasks[job.name].queueTimes.push(queueT)
            tasks[job.name].runTimes.push(runT)
            tasks[job.name].totalTimes.push(totalT)
            tasks[job.name].successfulJobs += 1
          } else {
            tasks[job.name] = {
              name: job.name,
              platform: job.platform,
              queueTimes: [queueT],
              runTimes: [runT],
              totalTimes: [totalT],
              successfulJobs: 1,
              failedJobs: 0
            }
          }
        }
      }
      return tasks
    },
    taskStats () {
      const taskStats = []
      const mean = times => times.reduce((prev, curr) => prev + curr) / times.length
      if (Object.keys(this.tasks).length > 0) {
        for (const [taskName, task] of Object.entries(this.tasks)) {
          const stats = {
            name: taskName,
            platform: task.platform,
            successfulJobs: task.successfulJobs,
            failureRate: 100 * task.failedJobs / task.successfulJobs,
            meanQueueTime: mean(task.queueTimes),
            meanRunTime: mean(task.runTimes),
            meanTotalTime: mean(task.totalTimes)
          }
          taskStats.push(stats)
        }
      }
      return taskStats
    },
    filteredTasks () {
      const filterByName = this.filterByTaskName()
      const filterByPlatform = this.filterByTaskPlatform()
      return this.taskStats.filter(task => {
        if (filterByName && filterByPlatform) {
          return (
            task.name.includes(this.activeFilters.name) &&
            task.platform === this.activeFilters.platformOption
          )
        } else if (filterByName) {
          return task.name.includes(this.activeFilters.name)
        } else if (filterByPlatform) {
          return task.platform === this.activeFilters.platformOption
        }
        return true
      })
    },
    shownHeaders () {
      let timingHeaders
      if (this.tasksFilter.timingOption === 'totalTimes') {
        timingHeaders = this.totalTimeHeaders
      } else if (this.tasksFilter.timingOption === 'runTimes') {
        timingHeaders = this.runTimeHeaders
      } else if (this.tasksFilter.timingOption === 'queueTimes') {
        timingHeaders = this.queueTimeHeaders
      } else {
        return []
      }
      return this.headers.concat(timingHeaders)
    },
    platformOptions () {
      const platformOptions = [{ text: 'All', value: null }]
      const platforms = []
      for (const [key, task] of Object.entries(this.tasks)) {
        if (!platforms.includes(task.platform)) {
          platforms.push(task.platform)
          platformOptions.push({ text: task.platform })
        }
      }
      return platformOptions
    }
  },

  methods: {
    // run the one-off query for historical job data and pass its results
    // through the callback
    async historicalQuery () {
      const ret = await this.$workflowService.query2(
        QUERY,
        { workflows: this.workflowIDs }
      )
      this.callback.onAdded(ret.data)
    },
    filterByTaskName () {
      return this.activeFilters &&
        this.activeFilters.name !== undefined &&
        this.activeFilters.name !== null &&
        this.activeFilters.name !== ''
    },
    filterByTaskPlatform () {
      return this.activeFilters &&
        this.activeFilters.platformOption !== undefined &&
        this.activeFilters.platformOption !== null &&
        this.activeFilters.platformOption.length !== ''
    },
    filterTasks () {
      const taskNameFilterSet = this.tasksFilter.name !== undefined &&
        this.tasksFilter.name !== null &&
        this.tasksFilter.name !== ''
      const taskPlatformFilterSet = this.tasksFilter.platformOption !== undefined &&
        this.tasksFilter.platformOption !== null &&
        this.tasksFilter.platformOption !== ''
      if (taskNameFilterSet || taskPlatformFilterSet) {
        this.activeFilters = cloneDeep(this.tasksFilter)
      } else {
        this.activeFilters = null
      }
    },
    clearInput (event) {
      // I don't really like this, but we need to somehow force the 'change detection' to run again once the clear has taken place
      this.tasksFilter.name = null
      this.$refs.filterNameInput.$el.querySelector('input').dispatchEvent(new Event('keyup'))
    }
  }
}
</script>
