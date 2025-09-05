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
    <v-skeleton-loader
      v-if="!Object.keys(callback.tasks).length"
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
          <v-combobox
            id="c-analysis-filter-task-name"
            clearable
            chips
            multiple
            closable-chips
            placeholder="Filter by task name"
            v-model="tasksFilter.name"
            ref="filterNameInput"
            :items="this.tasks.map(task => task.name)"
            :disabled="chartType === 'timeSeries'"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
          class="mb-2 mb-md-0"
        >
          <v-select
            id="c-analysis-filter-task-timings"
            :items="$options.timingOptions"
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
            prefix="Platform:"
            v-model="tasksFilter.platformOption"
          />
        </v-col>
      </v-row>
      <div
        ref="toolbar"
        class="d-flex align-center flex-wrap my-2 col-gap-2 row-gap-4"
      >
        <!-- Toolbar -->
        <v-defaults-provider
          :defaults="{
            VBtn: { icon: true, variant: 'text' },
          }"
        >
          <v-btn-toggle
            v-model="chartType"
            mandatory
            variant="outlined"
            color="primary"
          >
            <v-btn
              :value="'table'"
              data-cy="table-toggle"
            >
              <v-icon :icon="$options.icons.mdiTable" />
              <v-tooltip>Table view</v-tooltip>
            </v-btn>
            <v-btn
              :value="'box'"
              data-cy="box-plot-toggle"
            >
              <v-icon :icon="$options.icons.mdiChartTimeline" />
              <v-tooltip>Box &amp; whiskers view</v-tooltip>
            </v-btn>
            <v-btn
              :value="'timeSeries'"
              data-cy="time-series-toggle"
            >
              <v-icon :icon="$options.icons.mdiChartTimelineVariant" />
              <v-tooltip>Time series view</v-tooltip>
            </v-btn>
          </v-btn-toggle>
          <v-btn
            v-if="chartType === 'table' || chartType === 'box'"
            @click="tasksQuery"
            data-cy="analysis-refresh-btn"
          >
            <v-icon :icon="$options.icons.mdiRefresh" />
            <v-tooltip>Refresh data</v-tooltip>
          </v-btn>
          <v-chip location="right" v-if="timingOption === 'cpuTime'">
            Total CPU Time: {{
            formatDuration(tasks[0].totalOfTotals, false, 'cpuTime') }}
          </v-chip>
          <v-btn>
            <v-icon :icon="$options.icons.mdiInformationOutline" />
            <v-tooltip>
              The Analysis View shows data for all succeeded jobs in all cycles
              of the workflow.
            </v-tooltip>
          </v-btn>
        </v-defaults-provider>
        <!-- Box plot sort input teleports here -->
      </div>
      <AnalysisTable
        v-if="chartType === 'table'"
        :tasks="filteredTasks"
        :timing-option="timingOption"
        v-model:initial-options="dataTableOptions"
      />
      <BoxPlot
        v-else-if="chartType === 'box'"
        :tasks="filteredTasks"
        :timing-option="timingOption"
        :sort-input-teleport-target="toolbarRef"
        v-model:initial-options="boxPlotOptions"
      />
      <TimeSeries
        v-else-if="chartType === 'timeSeries'"
        :workflowIDs="workflowIDs"
        :platform-option="tasksFilter.platformOption"
        :timing-option="timingOption"
        :sort-input-teleport-target="toolbarRef"
        v-model:initial-options="timeseriesPlotOptions"
      />
    </v-container>
  </div>
</template>

<script>
import { useTemplateRef } from 'vue'
import {
  debounce,
  pick,
} from 'lodash'
import gql from 'graphql-tag'
import { formatDuration } from '@/utils/tasks'
import graphqlMixin from '@/mixins/graphql'
import {
  initialOptions,
  updateInitialOptionsEvent,
  useInitialOptions
} from '@/utils/initialOptions'
import DeltasCallback from '@/services/callbacks'
import AnalysisTable from '@/components/cylc/analysis/AnalysisTable.vue'
import BoxPlot from '@/components/cylc/analysis/BoxPlot.vue'
import TimeSeries from '@/components/cylc/analysis/TimeSeries.vue'
import {
  matchTask,
  platformOptions
} from '@/components/cylc/analysis/filter'
import {
  mdiChartTimeline,
  mdiChartTimelineVariant,
  mdiRefresh,
  mdiTable,
  mdiInformationOutline,
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
  'maxQueueTime',
  'maxMaxRss',
  'meanMaxRss',
  'stdDevMaxRss',
  'minMaxRss',
  'maxRssQuartiles',
  'maxCpuTime',
  'meanCpuTime',
  'stdDevCpuTime',
  'minCpuTime',
  'totalCpuTime',
  'cpuTimeQuartiles',
  'totalOfTotals'
]

/** The one-off query which retrieves historical task timing statistics */
const TASK_QUERY = gql`
query analysisTaskQuery ($workflows: [ID]) {
  tasks(live: false, workflows: $workflows) {
    ${taskFields.join('\n')}
  }
}
`

/** The callback which gets called when data comes in from the query */
class AnalysisTaskCallback extends DeltasCallback {
  /**
   * @param {Object[]} tasks
   */
  constructor (tasks) {
    super()
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
    AnalysisTable,
    BoxPlot,
    TimeSeries
  },

  beforeMount () {
    this.tasksQuery()
  },

  emits: [updateInitialOptionsEvent],

  props: { initialOptions },

  setup (props, { emit }) {
    /**
     * The task name, timing option and platform filter state.
     * @type {import('vue').Ref<object>}
     */
    const tasksFilter = useInitialOptions('tasksFilter', { props, emit }, { name: [], timingOption: 'totalTimes', platformOption: -1 })

    /**
     * Determines the Analysis type ('table' | 'box' | 'timeSeries')
     * @type {import('vue').Ref<string>}
     */
    const chartType = useInitialOptions('chartType', { props, emit }, 'table')

    const toolbarRef = useTemplateRef('toolbar')

    /**
     * The Vuetify data table options (sortBy, page etc).
     * @type {import('vue').Ref<object>}
     */
    const dataTableOptions = useInitialOptions('dataTableOptions', { props, emit })

    /**
     * The Vuetify box and whisker plot options (sortBy, page etc).
     * @type {import('vue').Ref<object>}
     */
    const boxPlotOptions = useInitialOptions('boxPlotOptions', { props, emit })

    /**
     * The Vuetify box and whisker plot options (displayedTasks, showOrigin).
     * @type {import('vue').Ref<object>}
     */
    const timeseriesPlotOptions = useInitialOptions('timeseriesPlotOptions', { props, emit })

    return {
      tasksFilter,
      chartType,
      toolbarRef,
      dataTableOptions,
      boxPlotOptions,
      timeseriesPlotOptions,
    }
  },

  data () {
    const tasks = []
    return {
      callback: new AnalysisTaskCallback(tasks),
      /** Object containing all of the tasks added by the callback */
      tasks,
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
    },

    timingOption () {
      return this.tasksFilter.timingOption.replace(/Times/, '')
    }
  },

  methods: {
    /**
     * Run the one-off query for historical task data and pass its results
     * through the callback
     */
    tasksQuery: debounce(
      async function () {
        this.tasks = []
        this.callback = new AnalysisTaskCallback(this.tasks)
        const ret = await this.$workflowService.query2(
          TASK_QUERY,
          { workflows: this.workflowIDs }
        )
        this.callback.onAdded(ret.data)
      },
      200 // only re-run this once every 0.2 seconds
    ),
    formatDuration
  },

  icons: {
    mdiChartTimeline,
    mdiChartTimelineVariant,
    mdiRefresh,
    mdiTable,
    mdiInformationOutline,
  },

  timingOptions: [
    { value: 'totalTimes', title: 'Total times' },
    { value: 'runTimes', title: 'Run times' },
    { value: 'queueTimes', title: 'Queue times' },
    { value: 'maxRss', title: 'Max RSS' },
    { value: 'cpuTime', title: 'CPU Time' },
  ],
}
</script>
