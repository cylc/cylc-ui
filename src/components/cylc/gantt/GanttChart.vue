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
  <VueApexCharts
    type="rangeBar"
    :options="chartOptions"
    :series="series"
    width="100%"
    height="auto"
    class="d-flex justify-center"
  />
  <v-pagination
    v-model="page"
    :length="numPages"
    :total-visible="7"
    density="comfortable"
  />
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'
import {
  mdiDownload,
} from '@mdi/js'
import { useReducedAnimation } from '@/composables/localStorage'
import { Tokens } from '@/utils/uid'

const timingOptions = new Map([
  ['total', { start: 'submittedTime', end: 'finishedTime' }],
  ['run', { start: 'startedTime', end: 'finishedTime' }],
  ['queue', { start: 'submittedTime', end: 'startedTime' }],
])

const colours = [
  '#008FFB',
  '#00E396',
  '#775DD0',
  '#FEB019',
  '#FF4560',
]

export default {
  name: 'GanttChart',

  watch: {
    tasksPerPage: function () {
      this.page = 1
    },
  },
  components: {
    VueApexCharts,
  },

  props: {
    /** @type {Record<string, Object[]>} */
    jobs: {
      type: Object,
      required: true,
    },
    timingOption: {
      type: String,
      default: 'total',
    },
    tasksPerPage: {
      type: Number,
      default: 10,
    },
    animate: {
      type: Boolean,
      default: true,
    },
  },

  setup () {
    const reducedAnimation = useReducedAnimation()
    return { reducedAnimation }
  },

  data () {
    return {
      page: 1,
      sortBy: 'name',
      sortDesc: false,
    }
  },

  methods: {
    /**
     * @param {string|number} a
     * @param {string|number} b
     * @returns {number}
     */
    compare (a, b) {
      const ret = a[this.sortBy] < b[this.sortBy] ? -1 : 1
      return this.sortDesc ? -ret : ret
    },
  },

  computed: {
    displayedJobs () {
      const taskNameList = Object.keys(this.jobs)
      const firstIndex = Math.max(0, this.tasksPerPage * (this.page - 1))
      const numTasks = Math.min(taskNameList.length, firstIndex + this.tasksPerPage)

      return Object.values(this.jobs).slice(firstIndex, numTasks).flatMap(
        (jobs) => jobs
      )
    },
    series () {
      let data = []
      if (this.jobs.length !== 0) {
        const { start, end } = timingOptions.get(this.timingOption)
        /** Mapping of cycle points to colours */
        const jobColours = new Map()
        let colourIndex = 0
        data = this.displayedJobs.map(
          (job) => {
            const { cycle } = new Tokens(job.id)
            let fillColor = jobColours.get(cycle)
            if (!fillColor) {
              fillColor = colours[colourIndex++ % colours.length]
              jobColours.set(cycle, fillColor)
            }
            return {
              x: job.name,
              y: [
                new Date(job[start]).getTime(),
                new Date(job[end]).getTime(),
              ],
              fillColor,
            }
          }
        )
      }
      return [{ data }]
    },
    numPages () {
      if (this.jobs.length !== 0) {
        return Math.ceil(Object.keys(this.jobs).length / this.tasksPerPage)
      } else {
        return 1
      }
    },

    chartOptions () {
      const { displayedJobs } = this
      const { start, end } = timingOptions.get(this.timingOption)
      return {
        chart: {
          defaultLocale: 'en',
          locales: [
            {
              name: 'en',
              options: {
                toolbar: {
                  exportToSVG: 'Download SVG',
                  exportToPNG: 'Download PNG',
                  menu: 'Download',
                  selection: 'Selection',
                  selectionZoom: 'Selection Zoom',
                  zoomIn: 'Zoom In',
                  zoomOut: 'Zoom Out',
                  pan: 'Panning',
                  reset: 'Reset Zoom',
                },
              },
            },
          ],
          animations: {
            enabled: this.animate && !this.reducedAnimation,
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
            tools: {
              download: `<svg class="w-100 h-100"><path d="${mdiDownload}"></path></svg>`,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
            },
          },
        },
        tooltip: {
          custom ({ dataPointIndex }) {
            const job = displayedJobs[dataPointIndex]
            const { relativeID } = new Tokens(job.id)
            return (
              '<div class="apexcharts-tooltip-candlestick">' +
              '<div>Job: <span class="value">' +
              relativeID +
              '</span></div>' +
              '<div>Start: <span class="value">' +
              job[start] +
              '</span></div>' +
              '<div>Finish: <span class="value">' +
              job[end] +
              '</span></div>' +
              '</div>'
            )
          },
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        xaxis: {
          labels: {
            formatter: function (value, timestamp, opts) {
              return new Date(value).toUTCString().slice(17, -3)
            },
          },
          title: {
            text: 'Time (UTC)',
          },
        },
        yaxis: {
          labels: {
            maxWidth: 280,
            offsetX: -10,
          },
        },
      }
    },
  },
}
</script>
