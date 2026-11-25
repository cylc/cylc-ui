<!--
Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.

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
    data-cy="box-plot-chart"
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
  formatRSS,
  formatUnits,
  formatHeader,
  getTimingOption,
  formatChartLabels,
  compare,
  QUARTILE_INDEX,
} from '@/utils/tasks'
import { useReducedAnimation } from '@/composables/localStorage'
import {
  initialOptions,
  updateInitialOptionsEvent,
  useInitialOptions,
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
     * The sort descending/ascending state.
     * @type {import('vue').Ref<boolean>}
     */
    const sortDesc = useInitialOptions('sortDesc', { props, emit }, false)

    const reducedAnimation = useReducedAnimation()

    /**
     * The tasks on the current page, in sorted order.
     *
     * Shared by the box plot series and the memory allocated annotations so
     * that the annotations are always drawn against the right tasks.
     * @type {import('vue').ComputedRef<Object[]>}
     */
    const currentTasks = computed(() => {
      const sortedTasks = props.tasks.toSorted((a, b) => compare(a, b, sortBy.value, sortDesc.value))
      const startIndex = Math.max(0, props.itemsPerPage * (page.value - 1))
      return sortedTasks.slice(startIndex, startIndex + props.itemsPerPage)
    })

    const chartOptions = computed(() => {
      // Only show memory allocated annotations for max RSS
      const annotatedTasks = props.timingOption === 'maxRss' ? currentTasks.value : []

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
                },
              },
            },
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
            const max = formatUnits(w.globals.seriesCandleC[seriesIndex][dataPointIndex], props.timingOption, { allowZeros: true })
            const q3 = formatUnits(w.globals.seriesCandleL[seriesIndex][dataPointIndex], props.timingOption, { allowZeros: true })
            const med = formatUnits(w.globals.seriesCandleM[seriesIndex][dataPointIndex], props.timingOption, { allowZeros: true })
            const q1 = formatUnits(w.globals.seriesCandleH[seriesIndex][dataPointIndex], props.timingOption, { allowZeros: true })
            const min = formatUnits(w.globals.seriesCandleO[seriesIndex][dataPointIndex], props.timingOption, { allowZeros: true })
            const memAlloc = props.timingOption === 'maxRss'
              ? formatRSS(w.globals.series[seriesIndex][dataPointIndex])
              : null
            return `
              <div class="pa-2">
                <div>Minimum: ${min}</div>
                <div>Q1: ${q1}</div>
                <div>Median: ${med}</div>
                <div>Q3: ${q3} </div>
                <div>Maximum: ${max}</div>
                ${memAlloc ? `<div>Memory Allocated: ${memAlloc}</div>` : ''}
              </div>
            `
          },
        },
        annotations: {
          position: 'front',
          points: annotatedTasks.map(point => ({
            x: point.memAlloc,
            y: point.name,
            marker: {
              size: 0, // Hides the default marker
            },
            image: {
              path: 'img/redline.jpg',
              width: 40,
              height: 60,
              offsetX: 0,
              offsetY: -3,
            },
          })),
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
          min: annotatedTasks.length > 0 ? 0 : undefined,
          max: annotatedTasks.length > 0 ? Math.ceil(Math.max(0, ...annotatedTasks.map(t => t.memAlloc)) * 1.05) : undefined,
          type: 'numeric',
          title: {
            text: `${formatChartLabels(props.timingOption)}`,
          },
          labels: {
            formatter: (value) => formatUnits(value, props.timingOption, { allowZeros: true }),
          },
        },
      }
    })

    return {
      sortBy,
      page,
      sortDesc,
      currentTasks,
      chartOptions,
    }
  },

  computed: {
    series () {
      const quartilesKey = formatHeader('quartiles', this.timingOption)
      const boxData = this.currentTasks.map((task) => {
        const quartiles = task[quartilesKey] ?? []
        return {
          x: task.name,
          y: [
            quartiles[QUARTILE_INDEX.min],
            quartiles[QUARTILE_INDEX.q1],
            quartiles[QUARTILE_INDEX.median],
            quartiles[QUARTILE_INDEX.q3],
            quartiles[QUARTILE_INDEX.max],
            task.memAlloc > 0 ? task.memAlloc : 1, // ApexCharts seems inconsistent if this extra data is 0
          ],
        }
      })
      return [{ name: 'boxPlot', type: 'boxPlot', data: boxData }]
    },

    numPages () {
      return Math.ceil(this.tasks.length / this.itemsPerPage) || 1
    },

    sortChoices () {
      // The metric is already shown in the timing option dropdown, so
      // don't repeat it here (avoids e.g. "Min Max RSS")
      const metric = upperFirst(getTimingOption(this.timingOption))
      return [
        { title: 'Task name', value: 'name' },
        { title: 'Platform', value: 'platform' },
        { title: 'Count', value: 'count' },
        { title: 'Mean', value: `mean${metric}` },
        { title: 'Median', value: `median${metric}` },
        { title: 'Min', value: `min${metric}` },
        { title: 'Max', value: `max${metric}` },
        { title: 'Std Dev', value: `stdDev${metric}` },
      ]
    },
  },

  watch: {
    numPages () {
      // Clamp page number
      this.page = Math.min(this.numPages, this.page)
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
