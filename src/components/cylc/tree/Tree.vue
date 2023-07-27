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
      >
        <TaskFilter v-model="tasksFilter"/>
      </v-col>
      <!-- Expand, collapse all -->
      <v-col
        v-if="expandCollapseToggle"
        class="flex-grow-0"
      >
        <div
          class="d-flex flex-nowrap ml-2"
        >
          <v-btn
            @click="expandAll((treeitem) => !['task', 'job', 'job-details'].includes(treeitem.node.type))"
            icon
            variant="flat"
            size="small"
            data-cy="expand-all"
          >
            <v-icon size="x-large">{{ $options.icons.mdiPlus }}</v-icon>
            <v-tooltip>Expand all</v-tooltip>
          </v-btn>
          <v-btn
            @click="collapseAll()"
            icon
            variant="flat"
            size="small"
            data-cy="collapse-all"
          >
            <v-icon size="x-large">{{ $options.icons.mdiMinus }}</v-icon>
            <v-tooltip>Collapse all</v-tooltip>
          </v-btn>
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
            v-bind="{
              stopOn, hoverable, autoExpandTypes, cyclePointsOrderDesc, indent
            }"
            @tree-item-created="onTreeItemCreated"
            @tree-item-destroyed="onTreeItemDestroyed"
            @tree-item-expanded="onTreeItemExpanded"
            @tree-item-collapsed="onTreeItemCollapsed"
            @tree-item-clicked="onTreeItemClicked"
          >
            <template
              v-for="(_, slotName) of $slots"
              v-slot:[slotName]="scope"
            >
              <slot :name="slotName" v-bind="scope" />
            </template>
          </tree-item>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mdiPlus, mdiMinus } from '@mdi/js'
import TreeItem from '@/components/cylc/tree/TreeItem.vue'
import TaskFilter from '@/components/cylc/TaskFilter.vue'
import { matchID, matchState } from '@/components/cylc/common/filter'
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
    },
    /** Indent of each tree-item hierarchy in px */
    indent: {
      type: Number,
      required: false
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
      return Boolean(this.tasksFilter.id?.trim())
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
    /**
     * Update tree cache entry for this node (and its children if applicable)
     * with whether the node matches the filters.
     *
     * @param {Object} node
     * @param {boolean} parentsIDMatch - whether any parents of this node
     * match the ID filter.
     * @return {boolean} - whether this node matches the filter.
     */
    filterNode (node, parentsIDMatch = false) {
      const stateMatch = matchState(node, this.tasksFilter.states)
      // This node should be included if any parent matches the ID filter
      const idMatch = parentsIDMatch || matchID(node, this.tasksFilter.id)
      let filtered = stateMatch && idMatch

      let children
      if (node.type === 'cycle') {
        // follow the family tree from cycle point nodes
        children = node.familyTree[0]?.children
      } else if (['workflow', 'family'].includes(node.type)) {
        // follow children for workflow or family nodes
        children = node.children
      }
      if (children) {
        for (const child of children) {
          filtered = this.filterNode(child, idMatch) || filtered
          // Note: do not break early as we must run the filter over all children
        }
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
      const collection = filter ? Object.values(this.treeItemCache).filter(filter) : Object.values(this.treeItemCache)
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
      this.treeItemCache[treeItem.$props.node.id] = treeItem
      if (treeItem.isExpanded) {
        this.expandedCache.add(treeItem)
      }
    },
    onTreeItemDestroyed (treeItem) {
      // make sure the item is removed from all caches, otherwise we will have a memory leak
      delete this.treeItemCache[treeItem.$props.node.id]
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
  },

  icons: {
    mdiPlus,
    mdiMinus,
  },
}
</script>
