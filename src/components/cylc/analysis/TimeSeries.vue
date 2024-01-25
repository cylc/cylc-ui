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
        :items="tasks"
        v-model="displayedTasks"
        label="Select tasks"
        ref="selectTasks"
        @update:search="updateSelectionOptions"
      >
        <template
          v-slot:prepend-item
          v-if="this.showSelectAll"
        >
          <v-list-item
            ripple
            @click="selectSearchResults"
          >
            Select all search results
          </v-list-item>
          <v-list-item
            ripple
            @click="deselectSearchResults"
          >
            Remove all search results
          </v-list-item>
          <v-divider class="mt-2"></v-divider>
        </template>
      </v-autocomplete>
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
    <VueApexCharts
      type="line"
      :options="chartOptions"
      :series="series"
      :height="450"
      width="95%"
      class="d-flex justify-center"
          />
  </div>
  <div id="miniTimeSeries">
    <VueApexCharts
      type="line"
      :options="miniChartOptions"
      :series="series"
      height="120"
      width="95%"
      @selection="zoomMainChart"
      class="d-flex justify-center"
    />
  </div>
  <p>{{ displayedTasks }}</p>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'
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
  mdiDownload,
} from '@mdi/js'

/** List of fields to request for task for each task */
const jobFields = [
  'name',
  'id',
  'platform',
  'cyclePoint',
  'totalTime',
  'queueTime',
  'runTime'
]

/** The one-off query which retrieves historical job timing statistics */
const JOB_QUERY = gql`
query analysisJobQuery ($workflows: [ID], $tasks: [ID]) {
  jobs(live: false, workflows: $workflows, tasks: $tasks) {
    ${jobFields.join('\n')}
  }
}
`

/** The callback which gets called when data comes in from the job query */
class AnalysisJobCallback {
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
  name: 'TimeSeries',

  components: {
    VueApexCharts,
  },

  props: {
    workflowIDs: {
      type: Array,
      required: true,
    },
    tasks: {
      type: Array,
      required: true,
    },
    timingOption: {
      type: String,
      required: true,
    },
    platformOption: {
      type: String,
      required: true,
    },
    animate: {
      type: Boolean,
      default: true,
    },
    /** Where to teleport the sorting input (or don't render if null) */
    sortInputTeleportTarget: {
      type: String,
      default: null,
    },
  },

  data () {
    const jobs = []
    return {
      jobCallback: new AnalysisJobCallback(jobs),
      /** Object containing all of the jobs added by the callback */
      jobs,
      taskName: '',
      displayedTasks: [],
      showOrigin: false,
      xRange: [undefined, undefined],
      selectionRange: [undefined, undefined],
      autocompleteFilteredTasks: [],
      showSelectAll: false,
    }
  },

  watch: {
    displayedTasks (newTasks, oldTasks) {
      const addedTasks = newTasks.filter(task => !oldTasks.includes(task))
      if (addedTasks.length > 0) {
        this.jobsQuery(newTasks)
      }
    }
  },

  computed: {
    cyclePoints () {
      // Only plot cycles that have visible data points
      let cycles = this.jobs.filter(
        job => this.displayedTasks.includes(job.name)
      )
      cycles = uniq(cycles.map(
        job => job.cyclePoint)
      )

      // Sort the cycles in numerical order
      cycles = cycles.sort(
        (a, b) => a.replace(/\w/g, '') - b.replace(/\w/g, '')
      )
      return cycles
    },
    series () {
      let seriesData = {}
      let time

      for (const task of this.displayedTasks) {
        const data = {}
        for (const cycle of this.cyclePoints) {
          data[cycle] = { x: cycle, y: null, z: null }
        }
        seriesData[task] = { name: task, data: data }
      }

      for (const job of this.jobs) {
        if (this.displayedTasks.includes(job.name)) {
          if (this.platformOption === -1 || job.platform === this.platformOption) {
            if (this.timingOption === 'total') {
              time = job.totalTime
            } else if (this.timingOption === 'run') {
              time = job.runTime
            } else if (this.timingOption === 'queue') {
              time = job.queueTime
            }
            // todo: check job is latest before setting
            // What happens if I make x, y, z etc an array? (cf dataPointIndex in y tooltip)
            seriesData[job.name].data[job.cyclePoint].x = job.cyclePoint
            seriesData[job.name].data[job.cyclePoint].y = time
            seriesData[job.name].data[job.cyclePoint].z = job.platform
            seriesData[job.name].data[job.cyclePoint].platform = job.platform
            seriesData[job.name].data[job.cyclePoint].time = job.runTime
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
        chart: {
          animations: {
            enabled: this.$store.state.app.reducedAnimation ? false : this.animate,
            easing: 'easeinout',
            speed: 300,
            animateGradually: {
              enabled: true,
              delay: 150,
            },
            dynamicAnimation: {
              enabled: true,
              speed: 350,
            },
          },
          fontFamily: 'inherit',
          toolbar: {
            autoSelected: 'none',
            tools: {
              download: `<svg class="w-100 h-100"><path d="${mdiDownload}"></path></svg>`,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false
            }
          }
        },
        stroke: {
          width: 2
        },
        markers: {
          size: 4
        },
        tooltip: {
          z: {
            // title: 'Platform: '
            formatter: () => null,
          },
          y: {
            formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
              if (!value) {
                return null
              }
              const y = formatDuration(value, true)
              // console.log(w.globals)
              // Can I get this information from this.series instead?
              const platform = w.globals.seriesZ[seriesIndex][dataPointIndex]
              return `${y} (${platform})`
            }
          }
        },
        xaxis: {
          title: {
            text: 'Cycle point',
          },
          categories: this.cyclePoints,
          min: this.xRange[0],
          max: this.xRange[1]
        },
        yaxis: {
          forceNiceScale: true,
          min: this.showOrigin ? 0 : undefined,
          title: {
            text: upperFirst(this.timingOption) + ' time',
          },
          labels: {
            formatter: function (value) {
              return formatDuration(value, true)
            }
          },
        },
      }
    },

    miniChartOptions () {
      return {
        chart: {
          selection: {
            enabled: true,
            xaxis: {
              min: this.selectionRange[0],
              max: this.selectionRange[1],
            }
          },
          toolbar: {
            autoSelected: 'selection',
            show: false
          }
        },
        legend: {
          show: false
        },
        markers: {
          size: 3
        },
        stroke: {
          width: 2
        },
        tooltip: {
          enabled: false
        },
        xaxis: {
          categories: this.cyclePoints,
          tickAmount: 4,
          labels: {
            rotate: 0
          }
        },
        yaxis: {
          tickAmount: 3,
          title: {
            text: upperFirst(this.timingOption) + ' time',
          },
          labels: {
            formatter: function (value) {
              return formatDuration(value, true)
            }
          },
          min: this.showOrigin ? 0 : undefined
        },
      }
    },
  },

  methods: {
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
    updateSelectionOptions: function () {
      this.showSelectAll = Boolean(this.$refs.selectTasks.search)
    },
    jobsQuery: debounce(
      async function (queryTasks) {
        this.jobs = []
        this.jobCallback = new AnalysisJobCallback(this.jobs)
        const retJob = await this.$workflowService.query2(
          JOB_QUERY,
          { workflows: this.workflowIDs, tasks: queryTasks }
        )
        this.jobCallback.onAdded(retJob.data)
      },
      200 // only re-run this once every 0.2 seconds
    ),
    zoomMainChart: function (context, { xaxis }) {
      this.xRange = [Math.ceil(xaxis.min), Math.floor(xaxis.max)]
    }
  }
}
</script>

<style>
.apexcharts-text {
  font-size: 0.9rem;
}
</style>
