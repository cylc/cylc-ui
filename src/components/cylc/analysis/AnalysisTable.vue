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
  <v-row
    no-gutters
    class="c-table flex-grow-1 position-relative"
  >
    <v-col
      cols="12"
      class="mh-100 position-relative"
    >
      <v-container
        fluid
        class="pa-0"
      >
        <v-data-table
          :headers="shownHeaders"
          :items="tasks"
          v-model:sort-by="sortBy"
          density="compact"
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
        >
          <!-- Use custom format for values in columns that have a specified formatter: -->
          <!-- Used to make durations human readable -->
          <!-- Durations of 0 will be undefined unless allowZeros is true -->
          <template
            v-for="header in shownHeaders"
            v-slot:[`item.${header.key}`]="{ item }"
          >
            {{ formatCell(item, header) }}
          </template>
          <template v-slot:bottom>
            <v-data-table-footer :itemsPerPageOptions="$options.itemsPerPageOptions" />
          </template>
        </v-data-table>
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
import { upperFirst } from 'lodash'
import {
  formatDuration,
  formatHeader,
  formatChartLabels,
} from '@/utils/tasks'
import {
  initialOptions,
  updateInitialOptionsEvent,
  useInitialOptions
} from '@/utils/initialOptions'

export default {
  name: 'AnalysisTableComponent',

  emits: [updateInitialOptionsEvent],

  props: {
    tasks: {
      type: Array,
      required: true
    },
    timingOption: {
      type: String,
      required: true
    },
    initialOptions,
  },

  setup (props, { emit }) {
    /**
     * The number of tasks displayed per page.
     * @type {import('vue').Ref<number>}
     */
    const itemsPerPage = useInitialOptions('tasksFilter', { props, emit }, 50)

    /**
     * The 'sort by' state.
     * @type {import('vue').Ref<array>}
     */
    const sortBy = useInitialOptions('sortBy', { props, emit }, [{ key: 'name', order: 'asc' }])

    /**
     * The page number state.
     * @type {import('vue').Ref<number>}
     */
    const page = useInitialOptions('page', { props, emit }, 1)

    return {
      itemsPerPage,
      sortBy,
      page
    }
  },

  data () {
    return {
      headers: [
        {
          title: 'Task',
          key: 'name'
        },
        {
          title: 'Platform',
          key: 'platform'
        },
        {
          title: 'Count',
          key: 'count'
        }
      ]
    }
  },

  computed: {
    shownHeaders () {
      const times = upperFirst(this.timingOption)
      const timingHeaders = []
      // Check if there are any stats to show
      const stats = this.tasks.some((task) => task.count > 1)
      if (stats) {
        timingHeaders.push(
          {
            title: `Mean ${formatChartLabels(times)}`,
            key: `${formatHeader('mean', times)}`,
            formatter: formatDuration,
            allowZeros: false,
            timingOption: this.timingOption
          },
          {
            title: `Min ${formatChartLabels(times)}`,
            key: `${formatHeader('min', times)}`,
            formatter: formatDuration,
            allowZeros: false,
            timingOption: this.timingOption
          },
          {
            title: `Q1 ${formatChartLabels(times)}`,
            key: `${formatHeader('quartiles', times)}Quartiles.0`,
            formatter: formatDuration,
            allowZeros: false,
            timingOption: this.timingOption
          },
          {
            title: `Median ${formatChartLabels(times)}`,
            key: `${formatHeader('quartiles', times)}Quartiles.1`,
            formatter: formatDuration,
            allowZeros: false,
            timingOption: this.timingOption
          },
          {
            title: `Q3 ${formatChartLabels(times)}`,
            key: `${formatHeader('quartiles', times)}Quartiles.2`,
            formatter: formatDuration,
            allowZeros: false,
            timingOption: this.timingOption
          },
          {
            title: `Max ${formatChartLabels(times)}`,
            key: `${formatHeader('max', times)}`,
            formatter: formatDuration,
            allowZeros: false,
            timingOption: this.timingOption
          }
        )
      } else {
        timingHeaders.push(
          {
            title: `${formatChartLabels(times)}`,
            key: `${formatHeader('mean', times)}`,
            formatter: formatDuration,
            allowZeros: false,
            timingOption: this.timingOption
          }
        )
      }

      // Don't show std dev for cpuTime or maxRss
      if (this.timingOption !== 'cpuTime' && this.timingOption !== 'maxRss' && stats) {
        timingHeaders.push({
          title: `Std Dev ${times}`,
          key: `${formatHeader('stdDev', times)}`,
          formatter: formatDuration,
          allowZeros: true,
          timingOption: this.timingOption
        })
      }
      return this.headers.concat(timingHeaders)
    }
  },

  methods: {
    formatCell (item, header) {
      const arrayMatch = header.key.match(/^(.+)\.(\d+)$/)
      const key = arrayMatch?.[1] ?? header.key
      let value = item[key]
      if (arrayMatch) {
        const index = arrayMatch[2]
        value = value[index]
      }
      if (header.formatter) {
        return header.formatter(value, header.allowZeros, this.timingOption)
      }
      return value
    }
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
