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
    type="boxPlot"
    :options="chartOptions"
    :series="series"
    :height="105 + series[0].data.length * 60"
    width="95%"
    class="d-flex justify-center"
  />
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'
import { mdiDownload } from '@mdi/js'
import { upperFirst } from 'lodash'

export default {
  name: 'BoxPlot',

  components: {
    VueApexCharts,
  },

  props: {
    tasks: {
      type: Array,
      required: true,
    },
    timingOption: {
      type: String,
      required: true,
    },
    workflowName: {
      type: String,
      required: true,
    },
    configOptions: {
      type: Object,
      required: true,
    },
  },

  computed: {
    series () {
      const sortedTasks = [...this.tasks].sort(this.compare)
      const startIndex = this.configOptions.itemsPerPage * (this.configOptions.page - 1)
      const endIndex = Math.min(
        sortedTasks.length,
        startIndex + this.configOptions.itemsPerPage
      )

      const data = []
      const field = this.timingOption.replace(/Times/, '')
      for (let i = startIndex; i < endIndex; i++) {
        data.push({
          x: sortedTasks[i].name,
          y: [
            sortedTasks[i][`min${upperFirst(field)}Time`],
            sortedTasks[i][`${field}Quartiles`][0],
            sortedTasks[i][`${field}Quartiles`][1],
            sortedTasks[i][`${field}Quartiles`][2],
            sortedTasks[i][`max${upperFirst(field)}Time`],
          ],
        })
      }
      return [{ data }]
    },

    chartOptions () {
      return {
        chart: {
          animations: {
            enabled: true,
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
        plotOptions: {
          bar: {
            horizontal: true,
          },
          boxPlot: {
            colors: {
              upper: '#6DD5C2',
              lower: '#6AA4F1',
            },
          },
        },
        xaxis: {
          title: {
            text: 'Time (s)',
          },
        },
      }
    },
  },

  methods: {
    compare (a, b) {
      let ret = 0
      const { sortBy, sortDesc } = this.configOptions
      if (sortBy) {
        ret = a[sortBy] < b[sortBy] ? -1 : 1
      }
      return sortDesc ? -ret : ret
    },
  },
}
</script>

<style>
.apexcharts-text {
  font-size: 0.9rem;
}
</style>
