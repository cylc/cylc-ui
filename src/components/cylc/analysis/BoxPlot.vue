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
          if (!sortedTasks[i]) { continue }
          boxPlot[0].data.push(
            {
              x: sortedTasks[i].name,
              y: [sortedTasks[i].minTotalTime,
                sortedTasks[i].totalQuartiles[0],
                sortedTasks[i].totalQuartiles[1],
                sortedTasks[i].totalQuartiles[2],
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
                sortedTasks[i].runQuartiles[0],
                sortedTasks[i].runQuartiles[1],
                sortedTasks[i].runQuartiles[2],
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
                sortedTasks[i].queueQuartiles[0],
                sortedTasks[i].queueQuartiles[1],
                sortedTasks[i].queueQuartiles[2],
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
          id: this.workflowName,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 300,
            animateGradually: {
              enabled: true,
              delay: 150
            },
            dynamicAnimation: {
              enabled: true,
              speed: 350
            }
          }
        },
        title: {
          text: this.workflowName
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
      let returnValue = 0
      if (this.configOptions.sortBy === 'name') {
        if (a.name < b.name) {
          returnValue = -1
        }
        if (a.name > b.name) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'platform') {
        if (a.platform < b.platform) {
          returnValue = -1
        }
        if (a.platform > b.platform) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'count') {
        if (a.count < b.count) {
          returnValue = -1
        }
        if (a.count > b.count) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'meanTotalTime') {
        if (a.meanTotalTime < b.meanTotalTime) {
          returnValue = -1
        }
        if (a.meanTotalTime > b.meanTotalTime) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'stdDevTotalTime') {
        if (a.stdDevTotalTime < b.stdDevTotalTime) {
          returnValue = -1
        }
        if (a.stdDevTotalTime > b.stdDevTotalTime) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'minTotalTime') {
        if (a.minTotalTime < b.minTotalTime) {
          returnValue = -1
        }
        if (a.minTotalTime > b.minTotalTime) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'firstQuartileTotal') {
        if (a.firstQuartileTotal < b.firstQuartileTotal) {
          returnValue = -1
        }
        if (a.firstQuartileTotal > b.firstQuartileTotal) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'secondQuartileTotal') {
        if (a.secondQuartileTotal < b.secondQuartileTotal) {
          returnValue = -1
        }
        if (a.secondQuartileTotal > b.secondQuartileTotal) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'thirdQuartileTotal') {
        if (a.thirdQuartileTotal < b.thirdQuartileTotal) {
          returnValue = -1
        }
        if (a.thirdQuartileTotal > b.thirdQuartileTotal) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'maxTotalTime') {
        if (a.maxTotalTime < b.maxTotalTime) {
          returnValue = -1
        }
        if (a.maxTotalTime > b.maxTotalTime) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'meanRunTime') {
        if (a.meanRunTime < b.meanRunTime) {
          returnValue = -1
        }
        if (a.meanRunTime > b.meanRunTime) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'stdDevRunTime') {
        if (a.stdDevRunTime < b.stdDevRunTime) {
          returnValue = -1
        }
        if (a.stdDevRunTime > b.stdDevRunTime) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'minRunTime') {
        if (a.minRunTime < b.minRunTime) {
          returnValue = -1
        }
        if (a.minRunTime > b.minRunTime) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'firstQuartileRun') {
        if (a.firstQuartileRun < b.firstQuartileRun) {
          returnValue = -1
        }
        if (a.firstQuartileRun > b.firstQuartileRun) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'secondQuartileRun') {
        if (a.secondQuartileRun < b.secondQuartileRun) {
          returnValue = -1
        }
        if (a.secondQuartileRun > b.secondQuartileRun) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'thirdQuartileRun') {
        if (a.thirdQuartileRun < b.thirdQuartileRun) {
          returnValue = -1
        }
        if (a.thirdQuartileRun > b.thirdQuartileRun) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'maxRunTime') {
        if (a.maxRunTime < b.maxRunTime) {
          returnValue = -1
        }
        if (a.maxRunTime > b.maxRunTime) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'meanQueueTime') {
        if (a.meanQueueTime < b.meanQueueTime) {
          returnValue = -1
        }
        if (a.meanQueueTime > b.meanQueueTime) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'stdDevQueueTime') {
        if (a.stdDevQueueTime < b.stdDevQueueTime) {
          returnValue = -1
        }
        if (a.stdDevQueueTime > b.stdDevQueueTime) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'minQueueTime') {
        if (a.minQueueTime < b.minQueueTime) {
          returnValue = -1
        }
        if (a.minQueueTime > b.minQueueTime) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'firstQuartileQueue') {
        if (a.firstQuartileQueue < b.firstQuartileQueue) {
          returnValue = -1
        }
        if (a.firstQuartileQueue > b.firstQuartileQueue) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'secondQuartileQueue') {
        if (a.secondQuartileQueue < b.secondQuartileQueue) {
          returnValue = -1
        }
        if (a.secondQuartileQueue > b.secondQuartileQueue) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'thirdQuartileQueue') {
        if (a.thirdQuartileQueue < b.thirdQuartileQueue) {
          returnValue = -1
        }
        if (a.thirdQuartileQueue > b.thirdQuartileQueue) {
          returnValue = 1
        }
      } else if (this.configOptions.sortBy === 'maxQueueTime') {
        if (a.maxQueueTime < b.maxQueueTime) {
          returnValue = -1
        }
        if (a.maxQueueTime > b.maxQueueTime) {
          returnValue = 1
        }
      }
      if (this.configOptions.sortDesc === true) {
        if (returnValue === 1) {
          returnValue = -1
        } else if (returnValue === -1) {
          returnValue = 1
        }
      }
      return returnValue
    }
  }
}
</script>
