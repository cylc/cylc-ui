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
          :sort-by="sortBy"
          density="compact"
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
import { formatDuration } from '@/utils/tasks'

export default {
  name: 'AnalysisTableComponent',

  props: {
    tasks: {
      type: Array,
      required: true
    },
    timingOption: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      itemsPerPage: 50,
      sortBy: [
        { key: 'name', order: 'asc' }
      ],
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
      let times
      if (this.timingOption === 'totalTimes') {
        times = 'Total'
      } else if (this.timingOption === 'runTimes') {
        times = 'Run'
      } else if (this.timingOption === 'queueTimes') {
        times = 'Queue'
      } else {
        return this.headers
      }
      const timingHeaders = [
        {
          title: `Mean T-${times}`,
          key: `mean${times}Time`,
          formatter: formatDuration,
          allowZeros: false
        },
        {
          title: `Std Dev T-${times}`,
          key: `stdDev${times}Time`,
          formatter: formatDuration,
          allowZeros: true
        },
        {
          title: `Min T-${times}`,
          key: `min${times}Time`,
          formatter: formatDuration,
          allowZeros: false
        },
        {
          title: `Q1 T-${times}`,
          key: `${times.toLowerCase()}Quartiles.0`,
          formatter: formatDuration,
          allowZeros: false
        },
        {
          title: `Median T-${times}`,
          key: `${times.toLowerCase()}Quartiles.1`,
          formatter: formatDuration,
          allowZeros: false
        },
        {
          title: `Q3 T-${times}`,
          key: `${times.toLowerCase()}Quartiles.2`,
          formatter: formatDuration,
          allowZeros: false
        },
        {
          title: `Max T-${times}`,
          key: `max${times}Time`,
          formatter: formatDuration,
          allowZeros: false
        }
      ]
      return this.headers.concat(timingHeaders)
    }
  },

  methods: {
    formatCell (item, header) {
      const arrayMatch = header.key.match(/^(.+)\.(\d+)$/)
      const key = arrayMatch?.[1] ?? header.key
      let value = item.value[key]
      if (arrayMatch) {
        const index = arrayMatch[2]
        value = value[index]
      }
      if (header.formatter) {
        return header.formatter(value, header.allowZeros)
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
