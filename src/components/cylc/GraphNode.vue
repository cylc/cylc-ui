<template>
  <g>
    <!-- the task icon -->
    <symbol :id="nodeID" viewBox="0 0 100 100">
      <!--
        Use a "symbol" for the task node in order to apply a viewBox to it.
        This is to prevent the task icon from overflowing the 100x100 box it
        is supposed to be contained in. Due to the way the progress icon
        works the BBox of a task icon is greater than this 100x100 box for
        running tasks.
      -->
      <SVGTask :task="task.node" />
    </symbol>
    <use
      :href="`#${nodeID}`"
      x="0" y="0"
      width="100" height="100"
      v-cylc-object="task.node"
    />

    <!-- the task name -->
    <text
      x="120" y="35"
      font-size="50"
    >
      {{ task.tokens.task }}
    </text>

    <!-- the cycle point -->
    <text
      x="120" y="65"
      font-size="25"
    >
      {{ task.tokens.cycle }}
    </text>

    <!-- the job(s) -->
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
    }
  },
  computed: {
    nodeID () {
      return `graph-node-${this.task.id}`
    }
  }
}
</script>
