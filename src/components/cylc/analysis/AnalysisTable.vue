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
    class="flex-grow-1 position-relative"
  >
    <v-col
      cols="12"
      class="mh-100 position-relative"
    >
      <v-container
        fluid
        class="ma-0 pa-0 w-100 h-100 left-0 top-0 position-absolute"
      >
        <v-data-table
          :headers="shownHeaders"
          :items="tasks"
          :sort-by.sync="sortBy"
          dense
          :footer-props="{
            itemsPerPageOptions: [10, 20, 50, 100, 200, -1],
            showFirstLastPage: true
          }"
          :options="{ itemsPerPage: 50 }"
        >
          <template
            v-for="header in shownHeaders.filter(header => header.hasOwnProperty('formatter'))"
            v-slot:[`item.${header.value}`]="{ value }"
          >
            {{ header.formatter(value, header.allowZeros) }}
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
      sortBy: 'name',
      headers: [
        {
          text: 'Task',
          value: 'name'
        },
        {
          text: 'Platform',
          value: 'platform'
        },
        {
          text: 'Count',
          value: 'count'
        }
        // {
        //   text: 'Failure rate (%)',
        //   value: 'failureRate'
        // }
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
          text: `Mean T-${times}`,
          value: `mean${times}Time`,
          formatter: formatDuration,
          allowZeros: false
        },
        {
          text: `Std Dev T-${times}`,
          value: `stdDev${times}Time`,
          formatter: formatDuration,
          allowZeros: true
        },
        {
          text: `Min T-${times}`,
          value: `min${times}Time`,
          formatter: formatDuration,
          allowZeros: false
        },
        {
          text: `Q1 T-${times}`,
          value: `firstQuartile${times}`,
          formatter: formatDuration,
          allowZeros: false
        },
        {
          text: `Median T-${times}`,
          value: `secondQuartile${times}`,
          formatter: formatDuration,
          allowZeros: false
        },
        {
          text: `Q3 T-${times}`,
          value: `thirdQuartile${times}`,
          formatter: formatDuration,
          allowZeros: false
        },
        {
          text: `Max T-${times}`,
          value: `max${times}Time`,
          formatter: formatDuration,
          allowZeros: false
        }
      ]
      return this.headers.concat(timingHeaders)
    }
  }
}
</script>
