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
    <symbol :id="nodeID" viewBox="-40 -40 140 140">
      <!--
        Use a "symbol" for the task node in order to apply a viewBox to it.
        This both contains it and makes it clickable.

        NOTE: Due to the viewBox we use here the coordinate system ends up
        offset by -20px. This doesn't impact most things, however, rotations
        can be sensitive to this change causing the rotated elements to end up
        in the wrong places. To counteract this we provide the coordinate offset
        to the task component.
      -->
      <SVGTask
        :task="task.node"
        :modifierSize="0.5"
        :startTime="startTime"
        :coordinateOffset="-20"
      />
    </symbol>
    <use
      :href="`#${nodeID}`"
      x="0" y="0"
      width="150" height="150"
      v-cylc-object="task.node"
    />

    <!-- the task name -->
    <text
      x="180" y="80"
      font-size="50"
    >
      {{ task.name }}
    </text>

    <!-- the cycle point -->
    <text
      x="180" y="110"
      font-size="25"
    >
      {{ task.node.cyclePoint }}
    </text>

    <!-- the job(s) -->
    <g
      transform="
        translate(180, 120)
        scale(0.25, 0.25)
      "
    >
      <g
        class="jobs"
        v-for="(job, index) in jobsForDisplay"
        :key="job.id"
        :transform="
          `translate(${index * 100}, 0)`
        "
      >
        <job
          :svg="true"
          :status="job.node.state"
        />
      </g>
      <!-- overflow indicator if there are surplus jobs -->
      <g
        class="job-overflow"
        v-if="numOverflowJobs"
        :transform="
          `translate(${maxJobs * 100}, 0)`
        "
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
import SVGTask from '@/components/cylc/SVGTask'
import Job from '@/components/cylc/Job'

export default {
  name: 'GraphNode',
  components: {
    SVGTask,
    Job
  },
  props: {
    task: {
      required: true
    },
    jobs: {
      require: true
    },
    maxJobs: {
      // maximum number of jobs to display before using an overflow indicator
      default: 6,
      require: false
    }
  },
  computed: {
    nodeID () {
      return `graph-node-${this.task.id}`
    },
    startTime () {
      if (this.jobs.length) {
        return this.jobs[0].node.startedTime
      }
      return undefined
    },
    jobsForDisplay () {
      // the first `this.maxJobs` items of `this.jobs`
      const ret = []
      let ind = 0
      for (const job of this.jobs) {
        if (ind >= this.maxJobs) {
          break
        }
        ret.push(job)
        ind++
      }
      return ret
    },
    numOverflowJobs () {
      // the number of overflowing (i.e. hidden) jobs
      if (this.jobs.length > this.maxJobs) {
        return this.jobs.length - this.maxJobs
      }
      return 0
    }
  }
}
</script>
