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
              :page.sync="page"
              :sortDesc.sync="sortDesc"
              :itemsPerPage.sync="itemsPerPage"
              dense
              :footer-props="{
                itemsPerPageOptions: [5, 10, 20, 50, 100, 200, -1],
                showFirstLastPage: true
              }"
              :options="{ itemsPerPage: 50 }"
            >
            <template v-slot:top="{ pagination, options, updateOptions }">
              <v-data-footer
                :pagination="pagination"
                :options="options"
                @update:options="updateOptions"
                items-per-page-text="$vuetify.dataTable.itemsPerPageText"/>
            </template>
          </v-data-table>
            <BoxPlot :configOptions="configOptions" :workflowName="workflowName" :tasks="filteredTasks" :timingOption="tasksFilter.timingOption"></BoxPlot>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
      </div>
</template>

<script>
import pick from 'lodash/pick'
import Vue from 'vue'
import gql from 'graphql-tag'
import pageMixin from '@/mixins/index'
import graphqlMixin from '@/mixins/graphql'
import ViewToolbar from '@/components/cylc/ViewToolbar'
import BoxPlot from '@/components/cylc/analysis/BoxPlot'
import {
  mdiChartLine,
  mdiRefresh
} from '@mdi/js'

// list of fields to request for tasks
const taskFields = [
  'name',
  'platform',
  'count',
  'meanTotalTime',
  'stdDevTotalTime',
  'minTotalTime',
  'firstQuartileTotal',
  'secondQuartileTotal',
  'thirdQuartileTotal',
  'maxTotalTime',
  'meanRunTime',
  'stdDevRunTime',
  'minRunTime',
  'firstQuartileRun',
  'secondQuartileRun',
  'thirdQuartileRun',
  'maxRunTime',
  'meanQueueTime',
  'stdDevQueueTime',
  'minQueueTime',
  'firstQuartileQueue',
  'secondQuartileQueue',
  'thirdQuartileQueue',
  'maxQueueTime'
]

// the one-off query which retrieves historical objects not
// normally visible in the GUI
const QUERY = gql`
query ($workflows: [ID]) {
  tasks(live: false, workflows: $workflows) {
    ${taskFields.join('\n')}
  }
}
`

// the callback which gets automatically called when data comes in on
// the subscription
class AnalysisCallback {
  constructor (tasks) {
    this.tasks = tasks
  }

  add (data) {
    // add tasks contained in data to this.tasks
    for (const task of data.tasks) {
      // add new entry
      Vue.set(
        this.tasks,
        this.tasks.length,
        pick(task, taskFields)
      )
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
    graphqlMixin
  ],

  name: 'Analysis',

  components: {
    ViewToolbar,
    BoxPlot
  },

  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  beforeMount () {
    this.historicalQuery()
  },

  data () {
    const tasks = []
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
            {
              title: 'Refresh data',
              icon: mdiRefresh,
              action: 'callback',
              callback: this.historicalQuery
            }
          ]
        }
      ],
      // instance of the callback class
      callback: new AnalysisCallback(tasks),
      // object containing all of the tasks added by the callback
      tasks,
      sortBy: 'name',
      page: 1,
      sortDesc: false,
      itemsPerPage: 50,
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
          value: 'count'
        }
        // {
        //   text: 'Failure rate (%)',
        //   value: 'failureRate'
        // }
      ],
      queueTimeHeaders: [
        {
          text: 'Mean T-queue (s)',
          value: 'meanQueueTime'
        },
        {
          text: 'Std Dev T-queue (s)',
          value: 'stdDevQueueTime'
        },
        {
          text: 'Min T-queue (s)',
          value: 'minQueueTime'
        },
        {
          text: 'Q1 T-queue (s)',
          value: 'firstQuartileQueue'
        },
        {
          text: 'Median T-queue (s)',
          value: 'secondQuartileQueue'
        },
        {
          text: 'Q3 T-queue (s)',
          value: 'thirdQuartileQueue'
        },
        {
          text: 'Max T-queue (s)',
          value: 'maxQueueTime'
        }
      ],
      runTimeHeaders: [
        {
          text: 'Mean T-run (s)',
          value: 'meanRunTime'
        },
        {
          text: 'Std Dev T-run (s)',
          value: 'stdDevRunTime'
        },
        {
          text: 'Min T-run (s)',
          value: 'minRunTime'
        },
        {
          text: 'Q1 T-run (s)',
          value: 'firstQuartileRun'
        },
        {
          text: 'Median T-run (s)',
          value: 'secondQuartileRun'
        },
        {
          text: 'Q3 T-run (s)',
          value: 'thirdQuartileRun'
        },
        {
          text: 'Max T-run (s)',
          value: 'maxRunTime'
        }
      ],
      totalTimeHeaders: [
        {
          text: 'Mean T-total (s)',
          value: 'meanTotalTime'
        },
        {
          text: 'Std Dev T-total (s)',
          value: 'stdDevTotalTime'
        },
        {
          text: 'Min T-total (s)',
          value: 'minTotalTime'
        },
        {
          text: 'Q1 T-total (s)',
          value: 'firstQuartileTotal'
        },
        {
          text: 'Median T-total (s)',
          value: 'secondQuartileTotal'
        },
        {
          text: 'Q3 T-total (s)',
          value: 'thirdQuartileTotal'
        },
        {
          text: 'Max T-total (s)',
          value: 'maxTotalTime'
        }
      ]
    }
  },

  computed: {
    // a list of the workflow IDs this view is "viewing"
    // NOTE: we plan multi-workflow functionality so we are writing views
    // to be mult-workflow compatible in advance of this feature arriving
    workflowIDs () {
      return [this.workflowId]
    },
    configOptions () {
      return {
        sortBy: this.sortBy,
        page: this.page,
        sortDesc: this.sortDesc,
        itemsPerPage: this.itemsPerPage
      }
    },
    filteredTasks () {
      return this.tasks.filter(task => this.matchTask(task))
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
      this.tasks = []
      this.callback = new AnalysisCallback(this.tasks)
      const ret = await this.$workflowService.query2(
        QUERY,
        { workflows: this.workflowIDs }
      )
      this.callback.onAdded(ret.data)
    },
    matchTask (task) {
      let ret = true
      if (this.tasksFilter.name?.trim()) {
        ret &&= task.name.includes(this.tasksFilter.name)
      }
      if (this.tasksFilter.platformOption?.trim()) {
        ret &&= task.platform.includes(this.tasksFilter.platformOption)
      }
      return ret
    }
  }
}
</script>
