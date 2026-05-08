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
  <div ref="chartContainer" class="gantt-container" :style="{ height: `${Math.max(300, 60 + displayedTaskCount * 55)}px` }" />
  <v-pagination
    v-model="page"
    :length="numPages"
    :total-visible="7"
    density="comfortable"
  />
</template>

<script>
import * as echarts from 'echarts/core'
import {
  CustomChart,
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  ToolboxComponent,
} from 'echarts/components'
import {
  CanvasRenderer,
} from 'echarts/renderers'
import { useReducedAnimation } from '@/composables/localStorage'
import { Tokens } from '@/utils/uid'

echarts.use([
  CustomChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  ToolboxComponent,
  CanvasRenderer,
])

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
    return { reducedAnimation: useReducedAnimation() }
  },

  data () {
    return {
      page: 1,
      chart: null,
    }
  },

  mounted () {
    this.$nextTick(() => {
      this.initChart()
    })
    this.resizeObserver = new ResizeObserver(() => {
      this.chart?.resize()
    })
    this.resizeObserver.observe(this.$refs.chartContainer)
    window.addEventListener('resize', this.handleResize)
  },

  beforeUnmount () {
    this.resizeObserver?.disconnect()
    window.removeEventListener('resize', this.handleResize)
    this.chart?.dispose()
  },

  watch: {
    jobs: { handler: 'updateChart', deep: true },
    timingOption: 'updateChart',
    animate: 'updateChart',
    displayedJobs: { handler: 'updateChart', deep: true },
    tasksPerPage () {
      this.page = 1
    },
  },

  computed: {
    displayedTaskCount () {
      const taskNameList = Object.keys(this.jobs)
      const firstIndex = Math.max(0, this.tasksPerPage * (this.page - 1))
      return Math.min(taskNameList.length, firstIndex + this.tasksPerPage) - firstIndex
    },
    displayedJobs () {
      const taskNameList = Object.keys(this.jobs)
      const firstIndex = Math.max(0, this.tasksPerPage * (this.page - 1))
      const numTasks = Math.min(taskNameList.length, firstIndex + this.tasksPerPage)

      return Object.values(this.jobs).slice(firstIndex, numTasks).flatMap(
        (jobs) => jobs
      )
    },
    numPages () {
      if (Object.keys(this.jobs).length !== 0) {
        return Math.ceil(Object.keys(this.jobs).length / this.tasksPerPage)
      }
      return 1
    },
  },

  methods: {
    initChart () {
      this.chart = echarts.init(this.$refs.chartContainer)
      this.updateChart()
    },

    updateChart () {
      if (!this.chart || !this.displayedJobs.length) {
        this.chart?.clear()
        return
      }

      const { start, end } = timingOptions.get(this.timingOption)
      const taskNameList = Object.keys(this.jobs)
      const firstIndex = Math.max(0, this.tasksPerPage * (this.page - 1))
      const numTasks = Math.min(taskNameList.length, firstIndex + this.tasksPerPage)
      const displayedTaskNames = taskNameList.slice(firstIndex, numTasks)
      const categories = [...displayedTaskNames].reverse()

      const jobColours = new Map()
      let colourIndex = 0

      const barData = []
      for (const taskName of displayedTaskNames) {
        const categoryIdx = categories.indexOf(taskName)
        for (const job of this.jobs[taskName]) {
          const { cycle } = new Tokens(job.id)
          let color = jobColours.get(cycle)
          if (!color) {
            color = colours[colourIndex++ % colours.length]
            jobColours.set(cycle, color)
          }
          barData.push({
            name: taskName,
            value: [
              categoryIdx,
              new Date(job[start]).getTime(),
              new Date(job[end]).getTime(),
            ],
            itemStyle: { color },
            job,
          })
        }
      }

      const option = {
        animation: this.animate && !this.reducedAnimation,
        tooltip: {
          trigger: 'item',
          formatter: ({ data }) => {
            const { relativeID } = new Tokens(data.job.id)
            return `<b>Job:</b> ${relativeID}<br/>` +
                   `<b>Start:</b> ${data.job[start]}<br/>` +
                   `<b>Finish:</b> ${data.job[end]}`
          },
        },
        grid: {
          left: '5%',
          right: '3%',
          top: '5%',
          bottom: 50,
          containLabel: false,
        },
        toolbox: {
          feature: {
            saveAsImage: { title: 'Download' },
          },
        },
        dataZoom: [
          { type: 'inside', filterMode: 'weak' },
        ],
        xAxis: {
          type: 'time',
          axisLabel: {
            formatter: (value) => {
              return new Date(value).toUTCString().slice(17, -3)
            },
          },
          name: 'Time (UTC)',
          nameLocation: 'middle',
          nameGap: 30,
        },
        yAxis: {
          type: 'category',
          data: categories,
          axisLine: {
            show: true,
          },
          axisLabel: {
            interval: 0,
            overflow: 'truncate',
            width: 280,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#e0e0e0',
              type: 'solid',
            },
          },
        },
        series: [{
          type: 'custom',
          renderItem: (params, api) => {
            const categoryIndex = api.value(0)
            const startPoint = api.coord([api.value(1), categoryIndex])
            const endPoint = api.coord([api.value(2), categoryIndex])
            const height = api.size([0, 1])[1] * 0.6

            if (isNaN(startPoint[0]) || isNaN(endPoint[0])) {
              return // Don't render if times are invalid
            }

            return {
              type: 'rect',
              shape: {
                x: startPoint[0],
                y: startPoint[1] - height / 2,
                width: endPoint[0] - startPoint[0],
                height,
              },
              style: api.style(),
            }
          },
          encode: { x: [1, 2], y: 0 },
          data: barData,
        }],
      }

      this.chart.setOption(option, true)
    },

    handleResize () {
      this.chart?.resize()
    },
  },
}
</script>

<style scoped>
.gantt-container {
  width: 100%;
}
</style>
