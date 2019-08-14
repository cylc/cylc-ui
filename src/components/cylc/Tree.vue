<template>
  <!-- mx is margin on the x axis, and mb is margin-bottom, 3 is 3 out of 5 -->
  <div class="mx-3 mb-3">
    <!-- each workflow is a tree root -->
    <tree-item
        v-for="workflow of workflows"
        :key="workflow.id"
        :node="workflow"
    >
    </tree-item>
  </div>
</template>

<script>
import TreeItem from '@/components/cylc/TreeItem'

export default {
  name: 'Tree',
  props: {
    workflows: {
      type: Array,
      required: true
    },
    cycles: {
      type: Map,
      required: true
    }
  },
  components: {
    'tree-item': TreeItem
  }
}
</script>
