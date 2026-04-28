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
  <Teleport
    v-if="sortInputTeleportTarget"
    :to="sortInputTeleportTarget"
  >
    <div class="d-flex flex-grow-1 col-gap-1">
      <v-autocomplete
        multiple
        chips
        closable-chips
        clearable
        placeholder="Search"
        :items="taskNames"
        v-model="displayedTasks"
        label="Select tasks"
        ref="selectTasks"
        data-cy="time-series-task-select"
      >
        <template v-slot:prepend-item>
          <v-select-actions>
            <v-btn @click="selectSearchResults">
              Select all
            </v-btn>
            <v-btn @click="deselectSearchResults">
              Deselect all
            </v-btn>
          </v-select-actions>
          <v-divider/>
        </template>
      </v-autocomplete>
      <v-btn
        @click="refreshData()"
        data-cy="analysis-jobs-refresh-btn"
        icon
        variant="text"
      >
        <v-icon :icon="$options.icons.mdiRefresh" />
        <v-tooltip>Refresh data</v-tooltip>
      </v-btn>
      <v-checkbox
        class="ma-0 pa-0"
        v-model="showOrigin"
        label="Show origin"
        density="compact"
        hide-details="true"
        style="min-width: 120px;"
      />
    </div>
  </Teleport>
  <div id="mainTimeSeries">
    <div ref="mainChart" style="height: 450px; width: 95%;" class="d-flex justify-center" />
  </div>
  <div id="miniTimeSeries">
    <div ref="miniChart" style="height: 120px; width: 95%;" class="d-flex justify-center" />
  </div>
  </template>

<script>
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  ToolboxComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  debounce,
  difference,
  pick,
  union,
  uniq,
  upperFirst
} from 'lodash'
import gql from 'graphql-tag'
import { formatDuration } from '@/utils/tasks'
import {
  mdiRefresh,
} from '@mdi/js'
import { useReducedAnimation } from '@/composables/localStorage'
import DeltasCallback from '@/services/callbacks'
import {
  initialOptions,
  updateInitialOptionsEvent,
  useInitialOptions
} from '@/utils/initialOptions'

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  ToolboxComponent,
  LegendComponent,
  CanvasRenderer
])

/** List of fields to request for task for each task */
const jobFields = [
  'name',
  'id',
  'platform',
  'cyclePoint',
  'totalTime',
  'queueTime',
  'runTime',
  'startedTime'
]

/** The one-off query which retrieves historical job timing statistics */
const JOB_QUERY = gql`
query analysisJobQuery ($workflows: [ID], $tasks: [ID]) {
  jobs(live: false, workflows: $workflows, tasks: $tasks, states: ["succeeded"]) {
    ${jobFields.join('\n')}
  }
}
`

/** The one-off query which retrieves historical tasks names */
const TASK_NAMES_QUERY = gql`
query analysisTaskQuery ($workflows: [ID]) {
  tasks(live: false, workflows: $workflows) {
    name
  }
}
`

/** The callback which gets called when data comes in from the job query */
class AnalysisJobCallback extends DeltasCallback {
  /**
   * @param {Object[]} jobs
   */
  constructor (jobs) {
    super()
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
}

export default {
  name: 'TimeSeries',

  components: {},

  emits: [updateInitialOptionsEvent],

  props: {
    workflowIDs: {
      type: Array,
      required: true,
    },
    timingOption: {
      type: String,
      required: true,
    },
    initialOptions,
    platformOption: {
      type: [String, Number],
      required: true,
    },
    animate: {
      type: Boolean,
      default: true,
    },
    /** Where to teleport the sorting input (or don't render if null) */
    sortInputTeleportTarget: {
      type: HTMLElement,
      default: null,
    },
  },

  setup (props, { emit }) {
    const reducedAnimation = useReducedAnimation()

    /**
     * The state for storing displayed tasks
     * @type {import('vue').Ref<array>}
     */
    const displayedTasks = useInitialOptions('displayedTasks', { props, emit }, [])

    /**
     * The show origin option toggle state
     * @type {import('vue').Ref<boolean>}
     */
    const showOrigin = useInitialOptions('showOrigin', { props, emit }, false)

    return {
      reducedAnimation,
      displayedTasks,
      showOrigin
    }
  },

  beforeMount () {
    this.taskNamesQuery()
  },

  mounted () {
    this.initCharts()
    this.refreshData()
    window.addEventListener('resize', this.handleResize)
  },

  beforeUnmount () {
    window.removeEventListener('resize', this.handleResize)
    this.mainChart?.dispose()
    this.miniChart?.dispose()
  },

  data () {
    const jobs = []
    return {
      jobCallback: new AnalysisJobCallback(jobs),
      /** Object containing all of the jobs added by the callback */
      jobs,
      taskNames: [],
      mainChart: null,
      miniChart: null
    }
  },

  watch: {
    displayedTasks (newTasks, oldTasks) {
      const addedTasks = newTasks.filter(task => !oldTasks.includes(task))
      if (addedTasks.length > 0) {
        this.jobsQuery(newTasks)
      }
    },
    series: {
      handler: 'updateCharts',
      deep: true
    },
    chartOptions: 'updateCharts',
    miniChartOptions: 'updateCharts'
  },

  computed: {
    cyclePoints () {
      // Only plot cycles that have visible data points
      const cycles = uniq(this.jobs.flatMap(
        job => this.displayedTasks.includes(job.name) ? job.cyclePoint : []
      ))
      return cycles.sort()
    },
    series () {
      let seriesData = {}
      let time

      for (const task of this.displayedTasks) {
        const data = {}
        for (const cycle of this.cyclePoints) {
          data[cycle] = { x: cycle, y: null }
        }
        seriesData[task] = {
          name: task,
          data
        }
      }

      for (const job of this.jobs) {
        if (this.displayedTasks.includes(job.name)) {
          if (this.platformOption === -1 || job.platform === this.platformOption) {
            const currentStartedTime = seriesData[job.name].data[job.cyclePoint].startedTime
            // Only add data if this job was run more recently than any existing data
            if (currentStartedTime === undefined || job.startedTime.localeCompare(currentStartedTime) === 1) {
              time = job[`${this.timingOption}Time`]
              Object.assign(seriesData[job.name].data[job.cyclePoint], {
                x: job.cyclePoint,
                y: time,
                platform: job.platform,
                startedTime: job.startedTime
              })
            }
          }
        }
      }
      seriesData = Object.values(seriesData)
      for (const series of seriesData) {
        series.data = Object.values(series.data)
      }
      return seriesData
    },

    chartOptions () {
      return {
        animation: this.animate && !this.reducedAnimation,
        grid: {
          left: '5%',
          right: '5%',
          top: '15%',
          bottom: '15%'
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            let result = `${params[0].axisValueLabel}<br/>`
            for (const p of params) {
              if (p.value) {
                const y = formatDuration(p.value, { allowZeros: true })
                const platform = this.series.find(s => s.name === p.seriesName).data.find(d => d.x === p.name)?.platform
                result += `${p.marker} ${p.seriesName}: ${y} (${platform})<br/>`
              }
            }
            return result
          }
        },
        toolbox: {
          feature: {
            saveAsImage: { title: 'Download' },
            dataZoom: { title: { zoom: 'Selection Zoom', back: 'Reset Zoom' } }
          }
        },
        dataZoom: [
          {
            type: 'inside',
            filterMode: 'weak'
          }
        ],
        xAxis: {
          type: 'category',
          data: this.cyclePoints,
          name: 'Cycle point',
          nameLocation: 'middle',
          nameGap: 30
        },
        yAxis: {
          type: 'value',
          min: this.showOrigin ? 0 : undefined,
          name: upperFirst(this.timingOption) + ' time',
          nameLocation: 'middle',
          nameGap: 50,
          axisLabel: {
            formatter: (value) => formatDuration(value, { allowZeros: true })
          }
        },
        series: this.series.map(s => ({
          ...s,
          type: 'line',
          symbolSize: 8,
          data: s.data.map(d => [d.x, d.y])
        }))
      }
    },

    miniChartOptions () {
      return {
        animation: this.animate && !this.reducedAnimation,
        tooltip: {
          show: false
        },
        grid: {
          left: '5%',
          right: '5%',
          top: '10%',
          bottom: '25%'
        },
        dataZoom: [
          {
            type: 'slider',
            showDataShadow: false,
            bottom: 5,
            filterMode: 'weak',
            startValue: 0,
            endValue: this.cyclePoints.length - 1,
            labelFormatter: ''
          }
        ],
        xAxis: {
          type: 'category',
          data: this.cyclePoints,
          axisLabel: {
            rotate: 0
          }
        },
        yAxis: {
          type: 'value',
          min: this.showOrigin ? 0 : undefined,
          axisLabel: {
            formatter: (value) => formatDuration(value, { allowZeros: true })
          }
        },
        series: this.series.map(s => ({
          ...s,
          type: 'line',
          symbolSize: 4,
          data: s.data.map(d => [d.x, d.y])
        }))
      }
    }
  },

  methods: {
    initCharts () {
      this.mainChart = echarts.init(this.$refs.mainChart)
      this.miniChart = echarts.init(this.$refs.miniChart)

      this.mainChart.on('datazoom', (params) => {
        this.miniChart.dispatchAction({
          type: 'dataZoom',
          start: params.start,
          end: params.end
        })
      })

      this.miniChart.on('datazoom', (params) => {
        this.mainChart.dispatchAction({
          type: 'dataZoom',
          start: params.start,
          end: params.end
        })
      })

      this.updateCharts()
    },
    updateCharts () {
      if (!this.mainChart || !this.miniChart) return

      this.mainChart.setOption(this.chartOptions, true)
      this.miniChart.setOption(this.miniChartOptions, true)
    },
    handleResize () {
      this.mainChart?.resize()
      this.miniChart?.resize()
    },
    selectSearchResults: function () {
      // Do we need a limit to number of tasks that can be added?
      const filteredTasks = this.$refs.selectTasks.filteredItems.map(
        (filteredTask) => (filteredTask.value))
      this.displayedTasks = union(this.displayedTasks, filteredTasks)
    },
    deselectSearchResults: function () {
      const filteredTasks = this.$refs.selectTasks.filteredItems.map(
        (filteredTask) => (filteredTask.value))
      this.displayedTasks = difference(this.displayedTasks, filteredTasks)
    },
    jobsQuery: debounce(
      async function (queryTasks) {
        // Ensure query isn't run over all tasks
        if (queryTasks.length > 0) {
          this.jobs = []
          this.jobCallback = new AnalysisJobCallback(this.jobs)
          const retJob = await this.$workflowService.query2(
            JOB_QUERY,
            { workflows: this.workflowIDs, tasks: queryTasks }
          )
          this.jobCallback.onAdded(retJob.data)
        }
      },
      200 // only re-run this once every 0.2 seconds
    ),
    taskNamesQuery: debounce(
      async function () {
        const retJob = await this.$workflowService.query2(
          TASK_NAMES_QUERY,
          { workflows: this.workflowIDs }
        )
        this.taskNames = retJob.data.tasks.map(task => task.name)
      },
      200 // only re-run this once every 0.2 seconds
    ),
    refreshData: function () {
      this.taskNamesQuery()
      this.jobsQuery(this.displayedTasks)
    }
  },

  icons: {
    mdiRefresh,
  },
}
</script>
