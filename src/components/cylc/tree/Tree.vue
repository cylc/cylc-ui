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
  <v-container>
    <v-row
      class="mb-1"
    >
      <v-col
        class="ma-0 py-0 px-3 col-md-5 col-12">
        <v-text-field
          id="c-tree-filter-task-name"
          clearable
          dense
          flat
          hide-details
          outlined
          placeholder="Filter by task name"
          v-model="tasksFilter.name"
        ></v-text-field>
      </v-col>
      <v-col
        class="ma-0 pa-md-0 col-md-5 col-12">
        <v-select
          id="c-tree-filter-task-states"
          :items="taskStates"
          clearable
          dense
          flat
          hide-details
          multiple
          outlined
          placeholder="Filter by task state"
          v-model="tasksFilter.states"
        >
          <template v-slot:item="slotProps">
            <Task :status="slotProps.item.value.toLowerCase()" :progress=0 />
            <span class="ml-2">{{ slotProps.item.value.toLowerCase() }}</span>
          </template>
          <template v-slot:selection="slotProps">
            <div class="mr-2">
              <Task :status="slotProps.item.value.toLowerCase()" :progress=0 />
            </div>
          </template>
        </v-select>
      </v-col>
      <v-col
        class="ma-0 py-0 px-3 col-md-2 col-sm-12">
        <!-- TODO: we shouldn't need to set the height (px) here, but for some reason the Vuetify
                   components don't seem to agree on the height here -->
        <v-btn
          id="c-tree-filter-btn"
          height="40"
          block
          outlined
          @click="filterTasks"
        >Filter</v-btn>
      </v-col>
    </v-row>
    <!-- each workflow is a tree root -->
    <tree-item
      v-for="workflow of sortedChildren('workflow', workflows)"
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
  </v-container>
</template>

<script>
import TreeItem from '@/components/cylc/tree/TreeItem'
import Vue from 'vue'
import TaskState from '@/model/TaskState.model'
import Task from '@/components/cylc/Task'
import clonedeep from 'lodash.clonedeep'
import { treeitem } from '@/mixins/treeitem'

export default {
  name: 'Tree',
  mixins: [
    treeitem
  ],
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
    Task,
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
      activeFilters: null
    }
  },
  computed: {
    taskStates: () => {
      return TaskState.enumValues.map(taskState => {
        return {
          text: taskState.name.toLowerCase().replace(/_/g, ' '),
          value: taskState.name
        }
      }).sort((left, right) => {
        return left.text.localeCompare(right.text)
      })
    },
    tasksFilterStates: function () {
      return this.activeFilters.states.map(selectedTaskState => {
        return selectedTaskState.toLowerCase()
      })
    }
  },
  watch: {
    workflows: {
      deep: true,
      handler: function (val, oldVal) {
        if (this.activeFilters !== null) {
          this.$nextTick(() => {
            this.filterNodes(this.workflows)
          })
        }
      }
    }
  },
  methods: {
    filterByTaskName () {
      return this.activeFilters.name !== undefined &&
          this.activeFilters.name !== null &&
          this.activeFilters.name.trim() !== ''
    },
    filterByTaskState () {
      return this.activeFilters.states !== undefined &&
          this.activeFilters.states !== null &&
          this.activeFilters.states.length > 0
    },
    filterTasks () {
      const taskNameFilterSet = this.tasksFilter.name !== undefined &&
          this.tasksFilter.name !== null &&
          this.tasksFilter.name.trim() !== ''
      const taskStatesFilterSet = this.tasksFilter.states !== undefined &&
          this.tasksFilter.states !== null &&
          this.tasksFilter.states.length > 0
      if (taskNameFilterSet || taskStatesFilterSet) {
        this.activeFilters = clonedeep(this.tasksFilter)
        this.filterNodes(this.workflows)
      } else {
        this.removeAllFilters()
        this.activeFilters = null
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
        if (this.filterByTaskName() && this.filterByTaskState()) {
          filtered = node.node.name.includes(this.activeFilters.name) && this.tasksFilterStates.includes(node.node.state)
        } else if (this.filterByTaskName()) {
          filtered = node.node.name.includes(this.activeFilters.name)
        } else if (this.filterByTaskState()) {
          filtered = this.tasksFilterStates.includes(node.node.state)
        }
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
