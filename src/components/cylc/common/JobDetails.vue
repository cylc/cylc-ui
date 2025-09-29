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
  <v-table data-cy="job-details">
    <thead v-if="$slots.header">
      <tr>
        <th colspan="2">
          <slot name="header"></slot>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>State</td>
        <td>{{ node.state }}</td>
      </tr>
      <tr>
        <td>Platform</td>
        <td>{{ node.platform }}</td>
      </tr>
      <tr>
        <td>Job ID</td>
        <td>{{ node.jobId }}</td>
      </tr>
      <tr>
        <td>Job runner</td>
        <td>{{ node.jobRunnerName }}</td>
      </tr>
      <tr>
        <td>Submit time</td>
        <td>{{ node.submittedTime }}</td>
      </tr>
      <template v-if="node.startedTime">
        <tr>
          <td>Start time</td>
          <td>{{ node.startedTime }}</td>
        </tr>
        <tr>
          <td>Finish time</td>
          <td>
            <EstimatedTime
              :actual="node.finishedTime"
              :estimate="node.estimatedFinishTime"
            />
          </td>
        </tr>
      </template>
      <tr v-if="node.finishedTime || meanElapsedTime">
        <td>Run time</td>
        <td>
          <EstimatedTime
            :actual="getRunTime(node)"
            :estimate="meanElapsedTime"
            :formatter="(x) => formatDuration(x, { allowZeros: true })"
            tooltip="Mean for this task"
          />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup>
import { formatDuration, getRunTime } from '@/utils/tasks'
import EstimatedTime from '@/components/cylc/common/EstimatedTime.vue'

defineProps({
  node: {
    type: Object,
    required: true,
  },
  meanElapsedTime: {
    type: Number,
  },
})
</script>

<style scoped>
table td:first-of-type {
  font-weight: 500;
  cursor: default;
}
</style>
