<template>
  <div class="my-2">
    <!-- each workflow is a tree root -->
    <tree-item
        v-for="workflow of workflows"
        :key="workflow.id"
        :node="workflow"
        :hoverable="hoverable"
        :min-depth="minDepth"
        :initialExpanded="expanded"
        v-on:tree-item-created="onTreeItemCreated"
        v-on:tree-item-expanded="onTreeItemExpanded"
        v-on:tree-item-collapsed="onTreeItemCollapsed"
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
    hoverable: Boolean,
    activable: Boolean,
    multipleActive: Boolean,
    minDepth: {
      type: Number,
      default: 0
    },
    initialExpanded: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    workflows: {
      handler () {
        this.clearCaches()
      }
    }
  },
  components: {
    'tree-item': TreeItem
  },
  data () {
    return {
      treeItemCache: new Set(),
      activeCache: new Set(),
      expandedCache: new Set(),
      expanded: this.initialExpanded,
      expandedFilter: null,
      collapseFilter: null
    }
  },
  methods: {
    expandAll (filter = null) {
      const collection = filter ? [...this.treeItemCache].filter(filter) : this.treeItemCache
      for (const treeItem of collection) {
        if (treeItem.depth < this.minDepth) {
          // do not touch hidden tree items
          continue
        }
        treeItem.isExpanded = true
        this.expandedCache.add(treeItem)
      }
      this.expanded = true
    },
    collapseAll (filter = null) {
      const collection = filter ? [...this.expandedCache].filter(filter) : this.expandedCache
      for (const treeItem of collection) {
        if (treeItem.depth < this.minDepth) {
          // do not touch hidden tree items
          continue
        }
        treeItem.isExpanded = false
        this.expandedCache.delete(treeItem)
      }
      if (!filter) {
        this.expanded = false
      }
    },
    onTreeItemExpanded (treeItem) {
      this.expandedCache.add(treeItem)
    },
    onTreeItemCollapsed (treeItem) {
      this.expandedCache.delete(treeItem)
    },
    onTreeItemCreated (treeItem) {
      this.treeItemCache.add(treeItem)
      if (treeItem.isExpanded) {
        this.expandedCache.add(treeItem)
      }
    },
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
    },
    clearCaches () {
      this.treeItemCache.clear()
      this.activeCache.clear()
      this.expandedCache.clear()
    }
  }
}
</script>
