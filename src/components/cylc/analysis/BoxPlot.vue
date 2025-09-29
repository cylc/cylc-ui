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
  <VueApexCharts
    type="boxPlot"
    :options="chartOptions"
    :series="series"
    :height="105 + series[0].data.length * 60"
    width="95%"
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
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import {
  mdiDownload,
  mdiSortReverseVariant,
  mdiSortVariant,
} from '@mdi/js'
import { upperFirst } from 'lodash'
import {
  formatDuration,
  getTimingOption,
  formatChartLabels
} from '@/utils/tasks'
import { useReducedAnimation } from '@/composables/localStorage'
import {
  initialOptions,
  updateInitialOptionsEvent,
  useInitialOptions
} from '@/utils/initialOptions'

export default {
  name: 'BoxPlot',

  components: {
    VueApexCharts,
  },

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

    const compare = (a, b) => {
      const ret = a[sortBy.value] < b[sortBy.value] ? -1 : 1
      return sortDesc.value ? -ret : ret
    }

    const chartOptions = computed(() => {
      const currentTasks = (() => {
        if (props.timingOption === 'maxRss') {
          const sortedTasks = [...props.tasks].sort((a, b) => compare(a, b))
          const startIndex = Math.max(0, props.itemsPerPage * (page.value - 1))
          const endIndex = Math.min(sortedTasks.length, startIndex + props.itemsPerPage)
          return sortedTasks.slice(startIndex, endIndex)
        }
        return []
      })()

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
                  menu: 'Download'
                }
              }
            }
          ],
          animations: {
            enabled: reducedAnimation.value ? false : props.animate,
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
          custom ({ seriesIndex, dataPointIndex, w }) {
            const max = formatDuration(w.globals.seriesCandleC[seriesIndex][dataPointIndex], true, props.timingOption)
            const q3 = formatDuration(w.globals.seriesCandleL[seriesIndex][dataPointIndex], true, props.timingOption)
            const med = formatDuration(w.globals.seriesCandleM[seriesIndex][dataPointIndex], true, props.timingOption)
            const q1 = formatDuration(w.globals.seriesCandleH[seriesIndex][dataPointIndex], true, props.timingOption)
            const min = formatDuration(w.globals.seriesCandleO[seriesIndex][dataPointIndex], true, props.timingOption)
            if (props.timingOption === 'maxRss') {
              const memAlloc = formatDuration(w.globals.series[seriesIndex][dataPointIndex], true, props.timingOption)
              return `
              <div class="pa-2">
              <div>Maximum: ${max}</div>
              <div>Q3: ${q3} </div>
              <div>Median: ${med}</div>
              <div>Q1: ${q1}</div>
              <div>Minimum: ${min}</div>
              <div>Memory Allocated: ${memAlloc}</div>
              </div>
            `
            } else {
              return `
              <div class="pa-2">
              <div>Maximum: ${max}</div>
              <div>Q3: ${q3} </div>
              <div>Median: ${med}</div>
              <div>Q1: ${q1}</div>
              <div>Minimum: ${min}</div>
              </div>
            `
            }
          },
        },
        annotations: {
          position: 'front',
          points: currentTasks.map(point => ({
            x: point.memAlloc,
            y: point.name,
            marker: {
              size: 0 // Hides the default marker
            },
            image: {
              path: 'img/redline.jpg',
              width: 40,
              height: 60,
              offsetX: 0,
              offsetY: -3,
            }
          }))
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
          min: currentTasks.length > 0 ? 0 : undefined,
          max: currentTasks.length > 0 ? Math.ceil(Math.max(0, ...currentTasks.map(t => t.memAlloc)) * 1.05) : undefined,
          type: 'numeric',
          title: {
            text: `${formatChartLabels(props.timingOption)}`,
          },
          labels: {
            formatter: (value) => formatDuration(value, true, props.timingOption)
          },
        },
      }
    })

    return {
      sortBy,
      page,
      sortDesc,
      chartOptions,
    }
  },

  computed: {
    series () {
      const sortedTasks = [...this.tasks].sort(this.compare)
      const startIndex = Math.max(0, this.itemsPerPage * (this.page - 1))
      const endIndex = Math.min(sortedTasks.length, startIndex + this.itemsPerPage)
      const boxData = []
      for (let i = startIndex; i < endIndex; i++) {
        boxData.push({
          x: sortedTasks[i].name,
          y: [
            sortedTasks[i][`min${upperFirst(getTimingOption(this.timingOption))}`],
            sortedTasks[i][`${this.timingOption}Quartiles`][0],
            sortedTasks[i][`${this.timingOption}Quartiles`][1],
            sortedTasks[i][`${this.timingOption}Quartiles`][2],
            sortedTasks[i][`max${upperFirst(getTimingOption(this.timingOption))}`],
            sortedTasks[i].memAlloc > 0 ? sortedTasks[i].memAlloc : 1 // ApexCharts seems inconsistent if this extra data is 0
          ]
        })
      }
      return [{ name: 'boxPlot', type: 'boxPlot', data: boxData }]
    },

    numPages () {
      return Math.ceil(this.tasks.length / this.itemsPerPage) || 1
    },

    sortChoices () {
      return [
        { title: 'Task name', value: 'name' },
        { title: 'Platform', value: 'platform' },
        { title: 'Count', value: 'count' },
        { title: `Mean ${formatChartLabels(this.timingOption)}`, value: `mean${upperFirst(getTimingOption(this.timingOption))}` },
        { title: `Median ${formatChartLabels(this.timingOption)}`, value: `median${upperFirst(getTimingOption(this.timingOption))}` },
        { title: `Min ${formatChartLabels(this.timingOption)}`, value: `min${upperFirst(getTimingOption(this.timingOption))}` },
        { title: `Max ${formatChartLabels(this.timingOption)}`, value: `max${upperFirst(getTimingOption(this.timingOption))}` },
      ]
    },
  },

  watch: {
    numPages () {
      // Clamp page number
      this.page = Math.min(this.numPages, this.page)
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

  icons: {
    sortAsc: mdiSortReverseVariant,
    sortDesc: mdiSortVariant,
  },
}
</script>

<style>
.apexcharts-text {
  font-size: 0.9rem;
}
</style>
