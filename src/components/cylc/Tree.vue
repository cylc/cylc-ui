<template>
  <!-- mx is margin on the x axis, and mb is margin-bottom, 3 is 3 out of 5 -->
  <div class="mx-3 mb-3">
    <!-- each workflow is a tree root -->
    <tree-item
        v-for="workflow of workflows"
        :key="workflow.id"
        :node="workflow"
        :hoverable="hoverable"
        :min-depth="minDepth"
        v-on:tree-item-clicked="onTreeItemClicked"
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
    },
    hoverable: Boolean,
    activable: Boolean,
    multipleActive: Boolean,
    minDepth: {
      type: Number,
      default: 0
    }
  },
  components: {
    'tree-item': TreeItem
  },
  data () {
    return {
      activeCache: new Set()
    }
  },
  methods: {
    onTreeItemClicked (treeItem) {
      if (this.activable) {
        if (!this.multipleActive) {
          // only one item can be active, so make sure everything else that was active is now !active
          for (const cached of this.activeCache) {
            if (cached !== treeItem) {
              cached.active = false
            }
          }
          // empty cache
          this.activeCache.clear()
        }

        treeItem.active = !treeItem.active
        if (treeItem.active) {
          this.activeCache.add(treeItem)
        }
      }
    }
  }
}
</script>
