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
  <g class="c-graph-node">
    <!-- the task icon -->
    <SVGTask
      :task="task.node"
      :modifierSize="0.5"
      :startTime="startTime"
      viewBox="-40 -40 140 140"
      v-command-menu="task"
      x="0" y="0"
    />

    <!-- the label -->
    <g :transform="labelTransform">
      <text
        x="130" y="25"
        font-size="45"
      >
        {{ task.name }}
      </text>

      <text
        x="130" y="65"
        font-size="30"
      >
        {{ task.tokens.cycle }}
      </text>
    </g>

    <!-- the job(s) -->
    <g
      transform="
        translate(130, 75)
        scale(0.3, 0.3)
      "
    >
      <g
        class="jobs"
        v-for="(job, index) in jobsForDisplay"
        :key="job.id"
        :transform="`
          translate(${index * 100 + ((index === 0) ? 0 : previousJobOffset)}, 0)
          scale(${ (index === 0) ? mostRecentJobScale : '1' })
        `"
      >
        <Job
          :svg="true"
          :status="job.node.state"
          viewBox="0 0 100 100"
          v-command-menu="job"
        />
      </g>
      <!-- overflow indicator if there are surplus jobs -->
      <g
        class="job-overflow"
        v-if="numOverflowJobs"
        :transform="`
          translate(${(maxJobs * 100) + 20}, 0)
        `"
      >
        <text
          x="25"
          y="75"
          font-size="80"
        >
          +{{ numOverflowJobs }}
        </text>
      </g>
    </g>
  </g>
</template>

<script>
import SVGTask from '@/components/cylc/SVGTask.vue'
import Job from '@/components/cylc/Job.vue'

export default {
  name: 'GraphNode',
  components: {
    SVGTask,
    Job
  },
  props: {
    task: {
      type: Object,
      required: true
    },
    jobs: {
      type: Array,
      required: true
    },
    maxJobs: {
      // maximum number of jobs to display before using an overflow indicator
      default: 6,
      required: false
    },
    mostRecentJobScale: {
      // the size of the most recent job icon relative to any previos jobs
      default: 1.2,
      required: false
    },
  },
  computed: {
    nodeID () {
      return `graph-node-${this.task.id}`
    },
    startTime () {
      return this.jobs?.[0]?.node?.startedTime
    },
    jobsForDisplay () {
      // the first `this.maxJobs` items of `this.jobs`
      return this.jobs.slice(0, this.maxJobs)
    },
    numOverflowJobs () {
      // the number of overflowing (i.e. hidden) jobs
      if (this.jobs.length > this.maxJobs) {
        return this.jobs.length - this.maxJobs
      }
      return 0
    },
    labelTransform () {
      // if there are no jobs then nudge the text (task / cycle) down a little
      // so that it is centered on the task icon
      if (this.jobs.length) {
        return ''
      }
      return 'translate(0, 20)'
    },
    previousJobOffset () {
      // the most recent job is larger so all subsequent jobs need to be bumped
      // along a bit further to account for this
      return (this.mostRecentJobScale * 100) - 100 // y offset in px
    }
  }
}
</script>
