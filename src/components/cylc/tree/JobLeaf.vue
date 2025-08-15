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
  <div
    :id="`${node.id}-job-details`"
    class="node leaf job-details mb-2"
  >
    <div class="arrow-up" :style="leafTriangleStyle"></div>
    <div class="leaf-data pa-2 rounded-lg">
      <v-defaults-provider :defaults="defaults">
        <JobDetailsTable
          :node="node.node"
          :mean-elapsed-time="meanElapsedTime"
          class="bg-transparent"
        />
        <v-table
          v-if="customOutputs?.length"
          class="outputs mt-2 bg-white"
        >
          <thead>
            <tr>
              <th>Custom output</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="customOutput of customOutputs"
              :key="customOutput.label"
            >
              <td>{{ customOutput.isMessage ? '--' : customOutput.label }}</td>
              <td>{{ customOutput.message }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-defaults-provider>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getIndent } from '@/components/cylc/tree/util'
import { jobMessageOutputs } from '@/utils/tasks'
import JobDetailsTable from '@/components/cylc/common/JobDetails.vue'

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  /** Indent level */
  depth: {
    type: Number,
    required: true,
  },
  meanElapsedTime: {
    type: Number,
  },
  density: {
    type: String,
    default: 'compact'
  }
})

/** Make the job details triangle point to the job icon */
const leafTriangleStyle = computed(() => ({
  'margin-left': getIndent(props.depth),
}))

const defaults = computed(() => ({
  VTable: {
    density: props.density,
    hover: true,
  }
}))

const customOutputs = computed(() => jobMessageOutputs(props.node))
</script>
