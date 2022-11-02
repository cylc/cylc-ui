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
  <v-container
    fluid
    class="c-table ma-0 pa-2 h-100 flex-column d-flex"
  >
    <!-- Toolbar -->
    <v-row
        class="d-flex flex-wrap table-option-bar no-gutters flex-grow-0"
    >
      <!-- Filters -->
      <v-col
        v-if="filterable"
        class="grow"
      >
        <v-row
          no-gutters
        >
          <v-col
            cols="12"
            md="6"
            class="pr-md-2 mb-2 mb-md-0"
          >
            <v-text-field
              id="c-tree-filter-task-name"
              clearable
              dense
              flat
              hide-details
              outlined
              placeholder="Filter by task name"
              v-model="tasksFilter.name"
              @keyup="filterTasks"
              @click:clear="clearInput"
              ref="filterNameInput"
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="mb-2 mb-md-0"
          >
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
              @change="filterTasks"
            >
              <template v-slot:item="slotProps">
                <Task :task="{ state: slotProps.item.value }" />
                <span class="ml-2">{{ slotProps.item.value }}</span>
              </template>
              <template v-slot:selection="slotProps">
                <div class="mr-2" v-if="slotProps.index >= 0 && slotProps.index < maximumTasks">
                  <Task :task="{ state: slotProps.item.value }" />
                </div>
                <span
                  v-if="slotProps.index === maximumTasks"
                  class="grey--text caption"
                >
            (+{{ tasksFilter.states.length - maximumTasks }})
          </span>
              </template>
            </v-select>
          </v-col>
        </v-row>
      </v-col>
      <!-- Expand, collapse all -->
      <v-col
        v-if="expandCollapseToggle"
        class="shrink"
      >
        <div
          class="d-flex flex-nowrap"
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                @click="expandAll((treeitem) => !['task', 'job', 'job-details'].includes(treeitem.node.type))"
                icon
              >
                <v-icon>{{ svgPaths.expandIcon }}</v-icon>
              </v-btn>
            </template>
            <span>Expand all</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                @click="collapseAll()"
                icon
              >
                <v-icon>{{ svgPaths.collapseIcon }}</v-icon>
              </v-btn>
            </template>
            <span>Collapse all</span>
          </v-tooltip>
        </div>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="flex-grow-1 position-relative"
      >
      <v-col
        cols="12"
        class="mh-100 position-relative"
      >
        <v-container
          fluid
          class="ma-0 pa-0 w-100 h-100 left-0 top-0 position-absolute pt-2"
        >
          <tree-item
            v-for="child of rootChildren"
            :key="child.id"
            :node="child"
            :stopOn="stopOn"
            :hoverable="hoverable"
            :autoExpandTypes="autoExpandTypes"
            :cyclePointsOrderDesc="cyclePointsOrderDesc"
            v-on:tree-item-created="onTreeItemCreated"
            v-on:tree-item-destroyed="onTreeItemDestroyed"
            v-on:tree-item-expanded="onTreeItemExpanded"
            v-on:tree-item-collapsed="onTreeItemCollapsed"
            v-on:tree-item-clicked="onTreeItemClicked"
          >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope"><slot :name="slot" v-bind="scope"/></template>
          </tree-item>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { mdiPlus, mdiMinus } from '@mdi/js'
import TaskState from '@/model/TaskState.model'
import TreeItem from '@/components/cylc/tree/TreeItem'
import Task from '@/components/cylc/Task'
import { getNodeChildren } from '@/components/cylc/tree/util'

export default {
  name: 'Tree',
  props: {
    workflows: {
      type: Array,
      required: true
    },
    stopOn: {
      // Array of node types to stop recursion on
      // i.e. don't show child nodes below the provided types
      type: Array,
      required: false,
      default: () => []
    },
    hoverable: Boolean,
    activable: Boolean,
    multipleActive: Boolean,
    filterable: {
      type: Boolean,
      default: true
    },
    expandCollapseToggle: {
      type: Boolean,
      default: true
    },
    autoExpandTypes: {
      // Array of Cylc "types" (e.g. workflow, cycle, etc) to be auto-expanded
      // on initial load
      type: Array,
      required: false,
      default: () => []
    },
    autoStripTypes: {
      // If there is only one child of the root node and its type is listed in
      // this array then it will be stripped from the tree.
      // Use this to avoid displaying unnecessary nodes, e.g. if there is only
      // one workflow in the tree and this is set to ['workflow'] then the
      // workflow node will be stripped, leaving behind its cycle points as
      // root nodes.
      type: Array,
      required: false,
      default: () => []
    }
  },
  components: {
    Task,
    TreeItem
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
      activeFilters: null,
      maximumTasks: 4,
      svgPaths: {
        expandIcon: mdiPlus,
        collapseIcon: mdiMinus
      },
      cyclePointsOrderDesc: true
    }
  },
  mounted () {
    // set cyclePointsOrderDesc
    // NOTE: this isn't reactive, however, changing the value requires
    // navigating away from this view so it doesn't have to be
    // TODO: make this a view-specific configuration
    let cyclePointsOrderDesc = true
    if (localStorage.cyclePointsOrderDesc) {
      cyclePointsOrderDesc = JSON.parse(localStorage.cyclePointsOrderDesc)
    }
    this.cyclePointsOrderDesc = cyclePointsOrderDesc
  },
  computed: {
    rootChildren () {
      // array of nodes at the top of the tree
      if (
        this.workflows.length === 1 &&
        this.autoStripTypes.includes(this.workflows[0].type)
      ) {
        // if there is only one workflow we return its children
        // (i.e. cycle points)
        return getNodeChildren(this.workflows[0], this.cyclePointsOrderDesc)
      } else {
        // if there are multiple children we need to include the workflow
        // nodes to allow us to differentiate between them
        return this.workflows
      }
    },
    taskStates: () => {
      return TaskState.enumValues.map(taskState => {
        return {
          text: taskState.name.replace(/_/g, ' '),
          value: taskState.name
        }
      }).sort((left, right) => {
        return left.text.localeCompare(right.text)
      })
    },
    tasksFilterStates: function () {
      return this.activeFilters.states.map(selectedTaskState => {
        return selectedTaskState
      })
    }
  },
  watch: {
    workflows: {
      deep: true,
      handler: function () {
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
        this.activeFilters = cloneDeep(this.tasksFilter)
        this.filterNodes(this.workflows)
      } else {
        this.removeAllFilters()
        this.activeFilters = null
      }
    },
    clearInput (event) {
      // I don't really like this, but we need to somehow force the 'change detection' to run again once the clear has taken place
      this.tasksFilter.name = null
      this.$refs.filterNameInput.$el.querySelector('input').dispatchEvent(new Event('keyup'))
    },
    filterNodes (nodes) {
      for (const node of nodes) {
        this.filterNode(node)
      }
    },
    filterNode (node) {
      let filtered = false
      if (['workflow', 'cycle', 'family'].includes(node.type)) {
        for (const child of node.children) {
          filtered = this.filterNode(child) || filtered
        }
      } else if (node.type === 'task') {
        if (this.filterByTaskName() && this.filterByTaskState()) {
          filtered = node.name.includes(this.activeFilters.name) && this.tasksFilterStates.includes(node.node.state)
        } else if (this.filterByTaskName()) {
          filtered = node.node.name.includes(this.activeFilters.name)
        } else if (this.filterByTaskState()) {
          filtered = this.tasksFilterStates.includes(node.node.state)
        }
      }
      if (!this.treeItemCache[node.id]) {
        this.treeItemCache[node.id] = {}
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
      Vue.delete(this.treeItemCache, treeItem.$props.node.id)
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
