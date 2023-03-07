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
        ></v-data-table>
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
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
    const tasks = []
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
      ],
      queueTimeHeaders: [
        {
          text: 'Mean T-queue (s)',
          value: 'meanQueueTime'
        },
        {
          text: 'Std Dev T-queue (s)',
          value: 'stdDevQueueTime'
        },
        {
          text: 'Min T-queue (s)',
          value: 'minQueueTime'
        },
        {
          text: 'Q1 T-queue (s)',
          value: 'firstQuartileQueue'
        },
        {
          text: 'Median T-queue (s)',
          value: 'secondQuartileQueue'
        },
        {
          text: 'Q3 T-queue (s)',
          value: 'thirdQuartileQueue'
        },
        {
          text: 'Max T-queue (s)',
          value: 'maxQueueTime'
        }
      ],
      runTimeHeaders: [
        {
          text: 'Mean T-run (s)',
          value: 'meanRunTime'
        },
        {
          text: 'Std Dev T-run (s)',
          value: 'stdDevRunTime'
        },
        {
          text: 'Min T-run (s)',
          value: 'minRunTime'
        },
        {
          text: 'Q1 T-run (s)',
          value: 'firstQuartileRun'
        },
        {
          text: 'Median T-run (s)',
          value: 'secondQuartileRun'
        },
        {
          text: 'Q3 T-run (s)',
          value: 'thirdQuartileRun'
        },
        {
          text: 'Max T-run (s)',
          value: 'maxRunTime'
        }
      ],
      totalTimeHeaders: [
        {
          text: 'Mean T-total (s)',
          value: 'meanTotalTime'
        },
        {
          text: 'Std Dev T-total (s)',
          value: 'stdDevTotalTime'
        },
        {
          text: 'Min T-total (s)',
          value: 'minTotalTime'
        },
        {
          text: 'Q1 T-total (s)',
          value: 'firstQuartileTotal'
        },
        {
          text: 'Median T-total (s)',
          value: 'secondQuartileTotal'
        },
        {
          text: 'Q3 T-total (s)',
          value: 'thirdQuartileTotal'
        },
        {
          text: 'Max T-total (s)',
          value: 'maxTotalTime'
        }
      ]
    }
  },

  computed: {
    shownHeaders () {
      let timingHeaders
      if (this.timingOption === 'totalTimes') {
        timingHeaders = this.totalTimeHeaders
      } else if (this.timingOption === 'runTimes') {
        timingHeaders = this.runTimeHeaders
      } else if (this.timingOption === 'queueTimes') {
        timingHeaders = this.queueTimeHeaders
      } else {
        return []
      }
      return this.headers.concat(timingHeaders)
    }
  }
}
</script>
