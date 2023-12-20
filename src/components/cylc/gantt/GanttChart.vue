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
    width="95%"
    class="d-flex justify-center"
  />
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'
import {
  mdiDownload,
  mdiSortReverseVariant,
  mdiSortVariant,
} from '@mdi/js'

export default {
  name: 'GanttChart',

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
    },
    itemsPerPage: {
      type: Number,
      default: 20,
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
    return {
      page: 1,
      sortBy: 'name',
      sortDesc: false,
    }
  },

  computed: {
    series () {
      const data = []
      if (this.jobs.length !== 0) {
        const colours = [
          '#008FFB',
          '#00E396',
          '#775DD0',
          '#FEB019',
          '#FF4560',
        ]
        const jobColours = {}
        const jobNameList = Array.from(
          new Set(this.jobs.map((job) => job.name))
        )

        for (let i = 0; i < jobNameList.length; i++) {
          jobColours[jobNameList[i]] = colours[i % colours.length]
        }

        const startIndex = 0
        const endIndex = this.jobs.length

        if (this.timingOption === 'total') {
          for (let i = startIndex; i < endIndex; i++) {
            data.push({
              x: this.jobs[i].name,
              y: [
                new Date(this.jobs[i].submittedTime).getTime(),
                new Date(this.jobs[i].finishedTime).getTime(),
              ],
              fillColor: jobColours[this.jobs[i].name],
            })
          }
        } else if (this.timingOption === 'run') {
          for (let i = startIndex; i < endIndex; i++) {
            data.push({
              x: this.jobs[i].name,
              y: [
                new Date(this.jobs[i].startedTime).getTime(),
                new Date(this.jobs[i].finishedTime).getTime(),
              ],
              fillColor: jobColours[this.jobs[i].name],
            })
          }
        } else if (this.timingOption === 'queue') {
          for (let i = startIndex; i < endIndex; i++) {
            data.push({
              x: this.jobs[i].name,
              y: [
                new Date(this.jobs[i].submittedTime).getTime(),
                new Date(this.jobs[i].startedTime).getTime(),
              ],
              fillColor: jobColours[this.jobs[i].name],
            })
          }
        }
      }
      return [{ data }]
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
          title: {
            text: 'Time',
          },
          type: 'datetime',
        },
      }
    },
  },

  icons: {
    sortAsc: mdiSortReverseVariant,
    sortDesc: mdiSortVariant,
  },
  itemsPerPageOptions: [
    { value: 10, title: '10' },
    { value: 20, title: '20' },
    { value: 50, title: '50' },
    { value: 100, title: '100' },
    { value: 200, title: '200' },
    { value: -1, title: 'All' }
  ],
}
</script>

<style>
.apexcharts-text {
  font-size: 1.1rem;
}
</style>
