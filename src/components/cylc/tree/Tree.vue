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
  <div class="my-2">
    <!-- each workflow is a tree root -->
    <tree-item
        v-for="workflow of workflows"
        :key="workflow.id"
        :node="workflow"
        :hoverable="hoverable"
        :initialExpanded="expanded"
    >
    </tree-item>
  </div>
</template>

<script>
import TreeItem from '@/components/cylc/tree/TreeItem'
import { TreeEventBus } from '@/components/cylc/tree/event-bus'

export default {
  name: 'Tree',
  props: {
    workflows: {
      type: Array,
      required: true
    },
    hoverable: Boolean,
    activable: Boolean,
    multipleActive: Boolean
  },
  components: {
    'tree-item': TreeItem
  },
  data () {
    return {
      treeItemCache: new Set(),
      activeCache: new Set(),
      expandedCache: new Set(),
      expanded: true,
      expandedFilter: null,
      collapseFilter: null
    }
  },
  created () {
    TreeEventBus.$on('tree-item-created', this.onTreeItemCreated)
    TreeEventBus.$on('tree-item-destroyed', this.onTreeItemDestroyed)
    TreeEventBus.$on('tree-item-expanded', this.onTreeItemExpanded)
    TreeEventBus.$on('tree-item-collapsed', this.onTreeItemCollapsed)
    TreeEventBus.$on('tree-item-clicked', this.onTreeItemClicked)
  },
  destroyed () {
    // we cannot simply call TreeEventBus.$off() as we may have more trees listening...
    TreeEventBus.$off('tree-item-created', this.onTreeItemCreated)
    TreeEventBus.$off('tree-item-destroyed', this.onTreeItemDestroyed)
    TreeEventBus.$off('tree-item-expanded', this.onTreeItemExpanded)
    TreeEventBus.$off('tree-item-collapsed', this.onTreeItemCollapsed)
    TreeEventBus.$off('tree-item-clicked', this.onTreeItemClicked)
  },
  methods: {
    expandAll (filter = null) {
      const collection = filter ? [...this.treeItemCache].filter(filter) : this.treeItemCache
      for (const treeItem of collection) {
        treeItem.isExpanded = true
        this.expandedCache.add(treeItem)
      }
      this.expanded = true
    },
    collapseAll (filter = null) {
      const collection = filter ? [...this.expandedCache].filter(filter) : this.expandedCache
      for (const treeItem of collection) {
        treeItem.isExpanded = false
        this.expandedCache.delete(treeItem)
      }
      if (!filter) {
        this.expanded = false
      }
    },
    onTreeItemExpanded (treeItem) {
      this.expandedCache.add(treeItem)
      this.expanded = true
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
    onTreeItemDestroyed (treeItem) {
      // make sure the item is removed from all caches, otherwise we will have a memory leak
      this.treeItemCache.delete(treeItem)
      this.expandedCache.delete(treeItem)
      this.activeCache.delete(treeItem)
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
    }
  }
}
</script>
