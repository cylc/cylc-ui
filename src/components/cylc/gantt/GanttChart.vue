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
    jobs: {
      type: Array,
      required: true,
    },
    timingOption: {
      type: String,
      required: true,
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
    series () {
      const data = []
      if (this.jobs.length !== 0) {
        const taskNameList = Object.keys(this.jobs)
        const startTask = Math.max(0, this.tasksPerPage * (this.page - 1))
        const endTask = Math.min(taskNameList.length, startTask + this.tasksPerPage)

        const colours = [
          '#008FFB',
          '#00E396',
          '#775DD0',
          '#FEB019',
          '#FF4560',
        ]
        const taskColours = {}

        for (let i = 0; i < taskNameList.length; i++) {
          taskColours[taskNameList[i]] = colours[i % colours.length]
        }
        const timingOptions = {
          total: { start: 'submittedTime', end: 'finishedTime' },
          run: { start: 'startedTime', end: 'finishedTime' },
          queue: { start: 'submittedTime', end: 'startedTime' },
        }
        const { start, end } = timingOptions[this.timingOption]
        for (let i = startTask; i < endTask; i++) {
          for (let j = 0; j < this.jobs[taskNameList[i]].length; j++) {
            data.push({
              x: taskNameList[i],
              y: [
                new Date(this.jobs[taskNameList[i]][j][start]).getTime(),
                new Date(this.jobs[taskNameList[i]][j][end]).getTime()
              ],
              fillColor: taskColours[taskNameList[i]],
            })
          }
        }
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
      return {
        chart: {
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
            },
          },
        },
        tooltip: {
          custom: function ({ seriesIndex, dataPointIndex, w }) {
            const startTime = new Date(w.config.series[seriesIndex].data[dataPointIndex].y[0])
            const finishTime = new Date(w.config.series[seriesIndex].data[dataPointIndex].y[1])
            return (
              '<div class="apexcharts-tooltip-candlestick">' +
              '<div>Start: <span class="value">' +
              startTime +
              '</span></div>' +
              '<div>Finish: <span class="value">' +
              finishTime +
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
              return new Date(value).toTimeString().slice(0, 9)
            }
          },
          title: {
            text: 'Time',
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

<style scoped>
:deep(.apexcharts-text) {
  font-size: 0.9rem;
}
</style>
