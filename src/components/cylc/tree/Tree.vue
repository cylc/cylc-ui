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
    class="ma-0 pa-0"
  >
    <!-- Toolbar -->
    <v-row
      no-gutters
      class="d-flex flex-wrap"
    >
      <!-- Filters -->
      <v-col
        v-if="filterable"
        class="grow"
      >
        <TaskFilter v-model="tasksFilter"/>
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
                data-cy="expand-all"
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
                data-cy="collapse-all"
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
import { mdiPlus, mdiMinus } from '@mdi/js'
import TreeItem from '@/components/cylc/tree/TreeItem'
import TaskFilter from '@/components/cylc/TaskFilter'
import { matchNode } from '@/components/cylc/common/filter'
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
    TaskFilter,
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
      tasksFilter: {},
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
    // https://github.com/cylc/cylc-ui/issues/1146
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
    filterByTaskName () {
      return Boolean(this.tasksFilter.name?.trim())
    },
    filterByTaskState () {
      return Boolean(this.tasksFilter.states?.length)
    }
  },
  watch: {
    tasksFilter: {
      deep: true,
      handler: 'filterTasks'
    },
    workflows: {
      deep: true,
      handler () {
        if (this.filterByTaskName || this.filterByTaskState) {
          this.$nextTick(() => {
            this.filterNodes(this.workflows)
          })
        }
      }
    }
  },
  methods: {
    filterTasks () {
      if (this.filterByTaskName || this.filterByTaskState) {
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
      if (node.type === 'cycle') {
        // follow the family tree from cycle point nodes
        for (const child of node.familyTree[0]?.children || []) {
          filtered = this.filterNode(child) || filtered
        }
      } else if (['workflow', 'family'].includes(node.type)) {
        // follow children for workflow or family nodes
        for (const child of node.children) {
          filtered = this.filterNode(child) || filtered
        }
      } else if (node.type === 'task') {
        filtered = matchNode(node.node, this.tasksFilter.name, this.tasksFilter.states)
      }
      if (this.treeItemCache[node.id]) {
        this.treeItemCache[node.id].filtered = filtered
      }
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
