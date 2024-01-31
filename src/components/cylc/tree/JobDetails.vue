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
    <div class="leaf-data font-weight-light py-4">
      <div
        v-for="item in leafProperties"
        :key="item.title"
        class="leaf-entry px-5"
      >
        <span class="leaf-entry-title">{{ item.title }}</span>
        <span class="text-grey-darken-1 leaf-entry-value">{{ item.property }}</span>
      </div>
      <v-divider class="mx-5" />
      <div class="leaf-entry px-5">
        <span class="leaf-entry-title text-grey-darken-1">Outputs</span>
      </div>
      <div
        v-if="jobMessageOutputs?.length"
        class="leaf-outputs-entry"
      >
        <div
          v-for="customOutput of jobMessageOutputs"
          :key="customOutput.label"
          class="leaf-entry output px-5"
        >
          <span class="leaf-entry-title">{{ customOutput.label }}</span>
          <span class="text-grey-darken-1 leaf-entry-value">{{ customOutput.message }}</span>
        </div>
      </div>
      <div
        v-else
        class="leaf-entry px-5"
      >
        <span class="leaf-entry-title text-grey-darken-1">No custom messages</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getIndent } from '@/components/cylc/tree/util'
import {
  formatDuration,
  jobMessageOutputs
} from '@/utils/tasks'

export default {
  name: 'JobDetails',

  props: {
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

    }
  },

  computed: {
    /** Make the job details triangle point to the job icon */
    leafTriangleStyle () {
      return {
        'margin-left': getIndent(this.depth),
      }
    },

    leafProperties () {
      return [
        {
          title: 'Platform',
          property: this.node.node.platform,
        },
        {
          title: 'Job ID',
          property: this.node.node.jobId,
        },
        {
          title: 'Job runner',
          property: this.node.node.jobRunnerName,
        },
        {
          title: 'Submitted',
          property: this.node.node.submittedTime,
        },
        {
          title: 'Started',
          property: this.node.node.startedTime,
        },
        {
          title: 'Finished',
          property: this.node.node.finishedTime,
        },
        {
          title: 'Mean run time',
          property: formatDuration(this.meanElapsedTime),
        },
      ]
    },

    jobMessageOutputs () {
      return jobMessageOutputs(this.node)
    },
  },
}
</script>
