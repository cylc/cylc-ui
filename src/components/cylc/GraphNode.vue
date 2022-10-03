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
  <g>
    <!-- the task icon -->
    <symbol :id="nodeID" viewBox="-40 -40 140 140">
      <!--
        Use a "symbol" for the task node in order to apply a viewBox to it.
        This is to prevent the task icon from overflowing the 100x100 box it
        is supposed to be contained in. Due to the way the progress icon
        works the BBox of a task icon is greater than this 100x100 box for
        running tasks.
      -->
      <SVGTask :task="task" :modifierSize="0.5" />
    </symbol>
    <use
      :href="`#${nodeID}`"
      x="0" y="0"
      width="150" height="150"
      v-cylc-object="task"
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
      {{ task.cyclePoint }}
    </text>

    <!-- the job(s) -->
    <g
      transform="
        translate(180, 120)
        scale(0.25, 0.25)
      "
    >
      <g
        v-for="(job, index) in jobs"
        :key="job.id"
        :transform="
          `translate(${index * 100}, 0)`
        "
      >
        <job
          :svg="true"
          :status="job.status"
        />
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
    }
  },
  computed: {
    nodeID () {
      return `graph-node-${this.task.id}`
    }
  }
}
</script>
