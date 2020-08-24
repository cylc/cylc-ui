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
    <v-text-field
      append-icon="mdi-magnify"
      clearable
      dense
      flat
      outlined
      placeholder="Filter by task name"
      class="mt-2 mx-4"
      v-model="tasksFilter.name"
      v-on:keyup.enter="filterByTaskName"
    ></v-text-field>
    <!-- each workflow is a tree root -->
    <tree-item
        v-for="workflow of workflows"
        :key="workflow.id"
        :node="workflow"
        :hoverable="hoverable"
        :initialExpanded="expanded"
        v-on:tree-item-created="onTreeItemCreated"
        v-on:tree-item-destroyed="onTreeItemDestroyed"
        v-on:tree-item-expanded="onTreeItemExpanded"
        v-on:tree-item-collapsed="onTreeItemCollapsed"
        v-on:tree-item-clicked="onTreeItemClicked"
    >
    </tree-item>
  </div>
</template>

<script>
import TreeItem from '@/components/cylc/tree/TreeItem'
import Vue from 'vue'

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
      treeItemCache: {},
      activeCache: new Set(),
      expandedCache: new Set(),
      expanded: true,
      expandedFilter: null,
      collapseFilter: null,
      tasksFilter: {
        name: '',
        states: []
      },
      filteredNodes: []
    }
  },
  methods: {
    filterByTaskName () {
      if (this.tasksFilter.name && this.tasksFilter.name.trim() !== '') {
        this.filterNodes(this.workflows)
      } else {
        this.removeAllFilters()
      }
    },
    filterNodes (nodes) {
      for (const node of nodes) {
        this.filterNode(node)
      }
    },
    filterNode (node) {
      let filtered = false
      if (['cyclepoint', 'family-proxy'].includes(node.type)) {
        for (const child of node.children) {
          filtered = this.filterNode(child) || filtered
        }
      } else if (node.type === 'task-proxy') {
        filtered = node.node.name.includes(this.tasksFilter.name)
      }
      this.treeItemCache[node.id].filtered = filtered
      return filtered
    },
    removeAllFilters () {
      for (const treeitem of Object.values(this.treeItemCache)) {
        treeitem.filtered = true
      }
    },
    expandAll (filter = null) {
      const collection = filter ? [...Object.values(this.treeItemCache)].filter(filter) : Object.values(this.treeItemCache)
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
      Vue.set(this.treeItemCache, treeItem.$props.node.id, treeItem)
      if (treeItem.isExpanded) {
        this.expandedCache.add(treeItem)
      }
    },
    onTreeItemDestroyed (treeItem) {
      // make sure the item is removed from all caches, otherwise we will have a memory leak
      Vue.delete(this.treeItemCache, treeItem.id)
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
