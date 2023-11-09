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
        v-if="!nodeFilterFunc"
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
            @click="expandAll = ['workflow', 'cycle', 'family']"
            icon
            variant="flat"
            size="small"
            data-cy="expand-all"
          >
            <v-icon size="x-large">{{ $options.icons.mdiPlus }}</v-icon>
            <v-tooltip>Expand all</v-tooltip>
          </v-btn>
          <v-btn
            @click="expandAll = []"
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
          <component
            :is="treeItemComponent"
            v-for="child of rootChildren"
            :key="child.id"
            v-show="child.filtered"
            :node="child"
            v-bind="{ hoverable, cyclePointsOrderDesc, expandAll, indent }"
          />
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mdiPlus, mdiMinus } from '@mdi/js'
import GScanTreeItem from '@/components/cylc/tree/GScanTreeItem.vue'
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
    treeItemComponent: {
      type: String,
      default: TreeItem.name,
    },
    hoverable: Boolean,
    /**
     * Custom function used to recursively filter nodes, to replace the default
     * implementation.
     *
     * It should accept a node as its first argument. If not specified, will
     * show the default ID filter and task state filter controls.
     */
    nodeFilterFunc: {
      type: Function,
      required: false,
    },
    expandCollapseToggle: {
      type: Boolean,
      default: true
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
    GScanTreeItem,
    TaskFilter,
    TreeItem,
  },

  data () {
    return {
      expandAll: null,
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
    /** Array of nodes at the top of the tree */
    rootChildren () {
      let nodes
      if (
        this.workflows.length === 1 &&
        this.autoStripTypes.includes(this.workflows[0].type)
      ) {
        // if there is only one workflow we return its children
        // (i.e. cycle points)
        nodes = getNodeChildren(this.workflows[0], this.cyclePointsOrderDesc)
      } else {
        // if there are multiple children we need to include the workflow
        // nodes to allow us to differentiate between them
        nodes = this.workflows
      }
      const filterFunc = this.nodeFilterFunc ?? this.filterNode
      for (const node of nodes) {
        filterFunc(node)
      }
      return nodes
    },
  },

  methods: {
    /**
     * Recursively set the `.filtered` property on this node and its children if applicable.
     * `filtered` = true means the node DOES match the filters.
     *
     * @param {Object} node
     * @param {boolean} parentsIDMatch - whether any parents of this node
     * match the ID filter.
     * @return {boolean} - whether this node matches the filter.
     */
    filterNode (node, parentsIDMatch = false) {
      if (node.type === 'job') {
        // jobs are always included and don't contribute to the filtering
        node.filtered = true
        return false
      }
      const stateMatch = matchState(node, this.tasksFilter.states)
      // This node should be included if any parent matches the ID filter
      const idMatch = parentsIDMatch || matchID(node, this.tasksFilter.id)
      let filtered = stateMatch && idMatch

      let { children } = node
      if (node.type === 'cycle') {
        // follow the family tree from cycle point nodes
        children = node.familyTree[0]?.children
      }
      if (children) {
        for (const child of children) {
          filtered = this.filterNode(child, idMatch) || filtered
          // Note: do not break early as we must run the filter over all children
        }
      }

      node.filtered = filtered
      return filtered
    },
  },

  icons: {
    mdiPlus,
    mdiMinus,
  },
}
</script>
