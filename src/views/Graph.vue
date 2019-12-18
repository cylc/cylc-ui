<template>
    <graph></graph>
</template>

<script>
import Graph from '@/components/cylc/Graph'
import store from '@/store'

export default {
  components: {
    Graph
  },

  props: {
    workflowName: {
      type: String,
      required: true
    }
  },

  beforeMount () {
    store.dispatch('workflows/setWorkflow', { workflowName: this.workflowName })
  }
}
</script>
