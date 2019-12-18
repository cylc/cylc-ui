<template>
    <graph></graph>
</template>

<script>
import Graph from '@/components/cylc/Graph'

export default {
  components: {
    Graph
  },

  props: {
    workflowName: {
      type: String,
      required: true
    }
  }
}
</script>
