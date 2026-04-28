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
      <v-select
        data-cy="box-plot-sort-select"
        :items="sortChoices"
        v-model="sortBy"
        label="Sort by"
        style="max-width: 250px;"
      />
      <v-btn
        @click="sortDesc = !sortDesc"
        icon
        variant="text"
        size="small"
        data-cy="box-plot-sort"
      >
        <v-icon :icon="sortDesc ? $options.icons.sortDesc : $options.icons.sortAsc" />
        <v-tooltip>Sort ascending/descending</v-tooltip>
      </v-btn>
    </div>
  </Teleport>
  <div ref="chart" :style="{ height: `${105 + series[0].data.length * 60}px`, width: '95%' }" class="d-flex justify-center" />
  <v-pagination
    v-model="page"
    :length="numPages"
    :total-visible="7"
    density="comfortable"
  />
</template>

<script>
import { computed } from 'vue'
import * as echarts from 'echarts/core'
import { BoxplotChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  ToolboxComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  mdiDownload,
  mdiSortReverseVariant,
  mdiSortVariant,
} from '@mdi/js'
import { upperFirst } from 'lodash'
import { formatDuration } from '@/utils/tasks'
import { useReducedAnimation } from '@/composables/localStorage'
import {
  initialOptions,
  updateInitialOptionsEvent,
  useInitialOptions
} from '@/utils/initialOptions'

echarts.use([
  BoxplotChart,
  GridComponent,
  TooltipComponent,
  ToolboxComponent,
  CanvasRenderer
])

export default {
  name: 'BoxPlot',

  components: {},

  emits: [updateInitialOptionsEvent],

  props: {
    tasks: {
      type: Array,
      required: true,
    },
    timingOption: {
      type: String,
      required: true,
    },
    initialOptions,
    itemsPerPage: {
      type: Number,
      default: 20,
    },
    animate: {
      type: Boolean,
      default: true,
    },
    /** ID of element to teleport the sorting input (or don't render if null) */
    sortInputTeleportTarget: {
      type: HTMLElement,
      default: null,
    },
  },

  setup (props, { emit }) {
    /**
     * The 'sort by' state.
     * @type {import('vue').Ref<string>}
     */
    const sortBy = useInitialOptions('sortBy', { props, emit }, 'name')

    /**
     * The page number state.
     * @type {import('vue').Ref<number>}
     */
    const page = useInitialOptions('page', { props, emit }, 1)

    /**
     * The sort descending/sscending state.
     * @type {import('vue').Ref<boolean>}
     */
    const sortDesc = useInitialOptions('sortDesc', { props, emit }, false)

    const reducedAnimation = useReducedAnimation()

    const chartOptions = computed(() => ({
      animation: !reducedAnimation.value && props.animate,
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const [min, q1, med, q3, max] = params.value.slice(1)
          return `
            <div class="pa-2">
              <div>Maximum: ${formatDuration(max, { allowZeros: true })}</div>
              <div>Q3: ${formatDuration(q3, { allowZeros: true })}</div>
              <div>Median: ${formatDuration(med, { allowZeros: true })}</div>
              <div>Q1: ${formatDuration(q1, { allowZeros: true })}</div>
              <div>Minimum: ${formatDuration(min, { allowZeros: true })}</div>
            </div>
          `
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '5%',
        bottom: '10%'
      },
      toolbox: {
        feature: {
          saveAsImage: { title: 'Download' }
        }
      },
      xAxis: {
        type: 'category',
        data: this.series[0].data.map(d => d.x),
        axisLabel: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        name: `${upperFirst(props.timingOption)} time`,
        nameLocation: 'middle',
        nameGap: 50,
        axisLabel: {
          formatter: (value) => formatDuration(value, { allowZeros: true })
        }
      },
      series: [
        {
          type: 'boxplot',
          data: this.series[0].data.map(d => d.y),
          itemStyle: {
            color: '#6AA4F1',
            borderColor: '#6DD5C2'
          }
        }
      ]
    }))

    return {
      sortBy,
      page,
      sortDesc,
      chartOptions
    }
  },

  data () {
    return {
      chart: null
    }
  },

  mounted () {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },

  beforeUnmount () {
    window.removeEventListener('resize', this.handleResize)
    this.chart?.dispose()
  },

  watch: {
    series: {
      handler: 'updateChart',
      deep: true
    },
    chartOptions: 'updateChart',
    numPages () {
      // Clamp page number
      this.page = Math.min(this.numPages, this.page)
    }
  },

  computed: {
    series () {
      const sortedTasks = [...this.tasks].sort(this.compare)
      const startIndex = Math.max(0, this.itemsPerPage * (this.page - 1))
      const endIndex = Math.min(sortedTasks.length, startIndex + this.itemsPerPage)

      const data = []
      for (let i = startIndex; i < endIndex; i++) {
        data.push({
          x: sortedTasks[i].name,
          y: [
            sortedTasks[i][`min${upperFirst(this.timingOption)}Time`],
            sortedTasks[i][`${this.timingOption}Quartiles`][0],
            sortedTasks[i][`${this.timingOption}Quartiles`][1],
            sortedTasks[i][`${this.timingOption}Quartiles`][2],
            sortedTasks[i][`max${upperFirst(this.timingOption)}Time`],
          ],
        })
      }
      return [{ data }]
    },

    numPages () {
      return Math.ceil(this.tasks.length / this.itemsPerPage) || 1
    },

    sortChoices () {
      return [
        { title: 'Task name', value: 'name' },
        { title: 'Platform', value: 'platform' },
        { title: 'Count', value: 'count' },
        { title: `Mean ${this.timingOption} time`, value: `mean${upperFirst(this.timingOption)}Time` },
        { title: `Median ${this.timingOption} time`, value: `median${upperFirst(this.timingOption)}Time` },
        { title: `Min ${this.timingOption} time`, value: `min${upperFirst(this.timingOption)}Time` },
        { title: `Max ${this.timingOption} time`, value: `max${upperFirst(this.timingOption)}Time` },
      ]
    },
  },

  methods: {
    initChart () {
      this.chart = echarts.init(this.$refs.chart)
      this.updateChart()
    },
    updateChart () {
      if (!this.chart) return
      this.chart.setOption(this.chartOptions, true)
    },
    handleResize () {
      this.chart?.resize()
    },
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

  icons: {
    sortAsc: mdiSortReverseVariant,
    sortDesc: mdiSortVariant,
  },
}
</script>

<style>
.echarts-text {
  font-size: 0.9rem;
}
</style>
