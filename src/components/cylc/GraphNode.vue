<template>
  <g>

    <!--
      :isHeld="task.node.isHeld"
      :isRunahead="task.node.isRunahead"
      :isQueued
    -->
    <task
      :svg="true"
      :status="task.node.state"
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
          v-cylc-object="job.node"
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
  }
}
</script>
