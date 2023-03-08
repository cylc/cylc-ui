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
  <v-container>
    <apexchart type='boxPlot' :options="this.chartOptions" :series="this.boxPlot"></apexchart>
  </v-container>
</template>

<script>
import Vue from 'vue'
import VueApexCharts from 'vue-apexcharts'

Vue.use(VueApexCharts)
Vue.component('apexchart', VueApexCharts)

export default {

  name: 'BoxPlot',
  props: {
    tasks: {
      type: Array,
      required: true
    },
    timingOption: {
      type: String,
      required: true
    },
    workflowName: {
      type: String,
      required: true
    },
    configOptions: {
      type: Object,
      required: true
    }
  },
  components: {
    apexchart: VueApexCharts
  },

  computed: {

    boxPlot () {
      const startingNumber = (this.configOptions.itemsPerPage * this.configOptions.page) - (this.configOptions.itemsPerPage)
      let sortedTasks = []
      let endingNumber = startingNumber + (this.configOptions.itemsPerPage)

      sortedTasks = this.tasks
      sortedTasks.sort(this.compare)

      if (sortedTasks.length < this.configOptions.itemsPerPage) {
        endingNumber = sortedTasks.length
      }
      const boxPlot = [{
        data: []
      }]

      if (this.timingOption === 'totalTimes') {
        for (let i = startingNumber; i < endingNumber; i++) {
          boxPlot[0].data.push(
            {
              x: sortedTasks[i].name,
              y: [sortedTasks[i].minTotalTime,
                sortedTasks[i].firstQuartileTotal,
                sortedTasks[i].secondQuartileTotal,
                sortedTasks[i].thirdQuartileTotal,
                sortedTasks[i].maxTotalTime]
            }
          )
        }
      } else if (this.timingOption === 'runTimes') {
        for (let i = startingNumber; i < endingNumber; i++) {
          boxPlot[0].data.push(
            {
              x: sortedTasks[i].name,
              y: [sortedTasks[i].minRunTime,
                sortedTasks[i].firstQuartileRun,
                sortedTasks[i].secondQuartileRun,
                sortedTasks[i].thirdQuartileRun,
                sortedTasks[i].maxRunTime]
            }
          )
        }
      } else if (this.timingOption === 'queueTimes') {
        for (let i = startingNumber; i < endingNumber; i++) {
          boxPlot[0].data.push(
            {
              x: sortedTasks[i].name,
              y: [sortedTasks[i].minQueueTime,
                sortedTasks[i].firstQuartileQueue,
                sortedTasks[i].secondQuartileQueue,
                sortedTasks[i].thirdQuartileQueue,
                sortedTasks[i].maxQueueTime]
            }
          )
        }
      }
      return boxPlot
    },

    chartOptions () {
      const chartOptions = {
        chart: {
          id: this.workflowName + ' Box and Whisker Plot'
        },
        title: {
          text: this.workflowName + ' Box and Whisker Plot',
          align: 'left'
        },
        plotOptions: {
          bar: {
            horizontal: true
          },
          boxPlot: {
            colors: {
              upper: '#C4E90C',
              lower: '#000000'
            }
          }
        }
      }
      return chartOptions
    }
  },
  methods: {
    compare (a, b) {
      if (this.sortBy === 'name') {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      } else if (this.sortBy === 'platform') {
        if (a.platform < b.platform) {
          return -1
        }
        if (a.platform > b.platform) {
          return 1
        }
        return 0
      } else if (this.sortBy === 'count') {
        if (a.count < b.count) {
          return -1
        }
        if (a.count > b.count) {
          return 1
        }
        return 0
      } else if (this.sortBy === 'meanTotalTime') {
        if (a.meanTotalTime < b.meanTotalTime) {
          return -1
        }
        if (a.meanTotalTime > b.meanTotalTime) {
          return 1
        }
        return 0
      } else if (this.sortBy === 'stdDevTotalTime') {
        if (a.stdDevTotalTime < b.stdDevTotalTime) {
          return -1
        }
        if (a.stdDevTotalTime > b.stdDevTotalTime) {
          return 1
        }
        return 0
      } else if (this.sortBy === 'minTotalTime') {
        if (a.minTotalTime < b.minTotalTime) {
          return -1
        }
        if (a.minTotalTime > b.minTotalTime) {
          return 1
        }
        return 0
      } else if (this.sortBy === 'firstQuartileTotal') {
        if (a.firstQuartileTotal < b.firstQuartileTotal) {
          return -1
        }
        if (a.firstQuartileTotal > b.firstQuartileTotal) {
          return 1
        }
        return 0
      } else if (this.sortBy === 'secondQuartileTotal') {
        if (a.secondQuartileTotal < b.secondQuartileTotal) {
          return -1
        }
        if (a.secondQuartileTotal > b.secondQuartileTotal) {
          return 1
        }
        return 0
      } else if (this.sortBy === 'thirdQuartileTotal') {
        if (a.thirdQuartileTotal < b.thirdQuartileTotal) {
          return -1
        }
        if (a.thirdQuartileTotal > b.thirdQuartileTotal) {
          return 1
        }
        return 0
      } else if (this.sortBy === 'maxTotalTime') {
        if (a.maxTotalTime < b.maxTotalTime) {
          return -1
        }
        if (a.maxTotalTime > b.maxTotalTime) {
          return 1
        }
        return 0
      }
    }
  }
}
</script>
