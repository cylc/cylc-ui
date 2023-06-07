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
  <div class="c-analysis">
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
            id="c-analysis-filter-task-name"
            clearable
            hide-details
            placeholder="Filter by task name"
            v-model.trim="tasksFilter.name"
            ref="filterNameInput"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
          class="mb-2 mb-md-0"
        >
          <v-select
            id="c-analysis-filter-task-timings"
            :items="timingOptions"
            hide-details
            prefix="Displaying:"
            v-model="tasksFilter.timingOption"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
          class="pl-md-2 mb-2 mb-md-0"
        >
          <v-select
            id="c-analysis-filter-task-platforms"
            :items="platformOptions"
            hide-details
            prefix="Platform:"
            v-model="tasksFilter.platformOption"
          />
        </v-col>
      </v-row>
      <ViewToolbar :groups="groups" />
      <AnalysisTable
        :tasks="filteredTasks"
        :timingOption="tasksFilter.timingOption"
      />
    </v-container>
  </div>
</template>

<script>
import {
  pick,
  debounce
} from 'lodash'
import gql from 'graphql-tag'
import { getPageTitle } from '@/utils/index'
import graphqlMixin from '@/mixins/graphql'
import ViewToolbar from '@/components/cylc/ViewToolbar.vue'
import AnalysisTable from '@/components/cylc/analysis/AnalysisTable.vue'
import {
  matchTask,
  platformOptions
} from '@/components/cylc/analysis/filter'
import {
  mdiChartLine,
  mdiRefresh
} from '@mdi/js'

/** List of fields to request for task for each task */
const taskFields = [
  'name',
  'platform',
  'count',
  'meanTotalTime',
  'stdDevTotalTime',
  'minTotalTime',
  'totalQuartiles',
  'maxTotalTime',
  'meanRunTime',
  'stdDevRunTime',
  'minRunTime',
  'runQuartiles',
  'maxRunTime',
  'meanQueueTime',
  'stdDevQueueTime',
  'minQueueTime',
  'queueQuartiles',
  'maxQueueTime'
]

/** The one-off query which retrieves historical task timing statistics */
const QUERY = gql`
query analysisQuery ($workflows: [ID]) {
  tasks(live: false, workflows: $workflows) {
    ${taskFields.join('\n')}
  }
}
`

/** The callback which gets called when data comes in from the query */
class AnalysisCallback {
  /**
   * @param {Object[]} tasks
   */
  constructor (tasks) {
    this.tasks = tasks
  }

  /**
   * Add tasks contained in data to this.tasks
   */
  add (data) {
    this.tasks.push(
      ...data.tasks.map((task) => pick(task, taskFields))
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
  name: 'Analysis',

  mixins: [
    graphqlMixin
  ],

  components: {
    ViewToolbar,
    AnalysisTable
  },

  head () {
    return {
      title: getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  beforeMount () {
    this.historicalQuery()
  },

  data () {
    const tasks = []
    return {
      widget: {
        title: 'analysis',
        icon: mdiChartLine
      },
      /** Defines controls which get added to the toolbar */
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
      callback: new AnalysisCallback(tasks),
      /** Object containing all of the tasks added by the callback */
      tasks,
      timingOptions: [
        { value: 'totalTimes', title: 'Total times' },
        { value: 'runTimes', title: 'Run times' },
        { value: 'queueTimes', title: 'Queue times' },
      ],
      tasksFilter: {
        name: '',
        timingOption: 'totalTimes',
        platformOption: -1,
      }
    }
  },

  computed: {
    // a list of the workflow IDs this view is "viewing"
    // NOTE: we plan multi-workflow functionality so we are writing views
    // to be mult-workflow compatible in advance of this feature arriving
    workflowIDs () {
      return [this.workflowId]
    },
    filteredTasks () {
      return this.tasks.filter(task => matchTask(task, this.tasksFilter))
    },
    platformOptions () {
      return platformOptions(this.tasks)
    }
  },

  methods: {
    // run the one-off query for historical job data and pass its results
    // through the callback
    historicalQuery: debounce(
      async function () {
        this.tasks = []
        this.callback = new AnalysisCallback(this.tasks)
        const ret = await this.$workflowService.query2(
          QUERY,
          { workflows: this.workflowIDs }
        )
        this.callback.onAdded(ret.data)
      },
      200 // only re-run this once every 0.2 seconds
    )
  }
}
</script>
