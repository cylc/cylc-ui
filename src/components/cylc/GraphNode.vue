<template>
  <g>

    <!--
      :isHeld="task.node.isHeld"
      :isRunahead="task.node.isRunahead"
      :isQueued
    -->
    <symbol :id="nodeID" viewBox="0 0 100 100">
      <!--
        Use a "symbol" for the task node in order to apply a viewBox to it.
        This is to prevent the task icon from overflowing the 100x100 box it
        is supposed to be contained in. Due to the way the progress icon
        works the BBox of a task icon is greater than this 100x100 box for
        running tasks.
      -->
      <task
        :svg="true"
        :status="task.node.state"
      />
    </symbol>
    <use
      :href="`#${nodeID}`"
      x="0" y="0"
      width="100" height="100"
      v-cylc-object="task.node"
    />

    <text
      x="120" y="35"
      font-size="50"
    >
      {{ task.tokens.task }}
    </text>
    <text
      x="120" y="65"
      font-size="25"
    >
      {{ task.tokens.cycle }}
    </text>
    <g
      transform="
        translate(120, 75)
        scale(0.25, 0.25)
      "
    >
      <g
        v-for="(job, index) in task.children"
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
    </g>
  </g>
</template>

<script>
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'

export default {
  name: 'GraphNode',
  components: {
    Task,
    Job
  },
  props: {
    task: {
      required: true
    }
  },
  computed: {
    nodeID () {
      return `graph-node-${this.task.id}`
    }
  }
}
</script>
