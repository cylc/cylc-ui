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
  <TreeItem
    v-bind="{ node, depth, filteredOutNodesCache, hoverable }"
    :auto-expand-types="$options.nodeTypes"
    :render-expand-collapse-btn="node.type !== 'workflow'"
    ref="treeItem"
  >
    <WorkflowIcon
      v-if="node.type === 'workflow'"
      :status="node.node.status"
      v-command-menu="node"
      :class="nodeClass"
      class="flex-shrink-0"
    />
    <v-list-item
      :to="workflowLink"
      :class="nodeClass"
      class="flex-grow-1 flex-shrink-1 px-2 ml-1"
    >
      <div class="d-flex align-center align-content-center flex-nowrap">
        <div class="c-gscan-workflow-name flex-grow-1">
          <span>
            {{ node.name || node.id }}
            <v-tooltip
              location="top"
              style="overflow-wrap: anywhere;"
            >
              {{ node.id }}
            </v-tooltip>
          </span>
        </div>
        <div class="d-flex text-right c-gscan-workflow-states flex-grow-0">
          <!-- task summary tooltips -->
          <!-- a v-tooltip does not work directly set on Cylc job component, so we use a div to wrap it -->
          <div
            class="ma-0 pa-0"
            min-width="0"
            min-height="0"
            style="font-size: 120%; width: auto;"
          >
            <WarningIcon v-if="workflowWarnings" :workflow="node" />
          </div>
          <div
            v-for="[state, tasks] in Object.entries(descendantTaskInfo.latestTasks)"
            :key="`${node.id}-${state}`"
            :class="getTaskStateClass(descendantTaskInfo.stateTotals, state)"
            class="ma-0 pa-0"
            min-width="0"
            min-height="0"
            style="font-size: 120%; width: auto;"
          >
            <Job :status="state" />
            <v-tooltip location="top">
              <!-- tooltip text -->
              <div class="text-grey-lighten-1">
                {{ descendantTaskInfo.stateTotals[state] ?? 0 }} {{ state }}. Recent {{ state }} tasks:
              </div>
              <div v-for="(task, index) in tasks.slice(0, $options.maxTasksDisplayed)" :key="index">
                {{ task }}<br v-if="index !== tasks.length - 1" />
              </div>
            </v-tooltip>
          </div>
        </div>
      </div>
    </v-list-item>

    <template v-slot:child>
      <!-- Component recursion -->
      <GScanTreeItem
        v-for="child in nodeChildren"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        v-bind="{ filteredOutNodesCache, hoverable }"
      />
    </template>
  </TreeItem>
</template>

<script>
import Job from '@/components/cylc/Job.vue'
import WorkflowIcon from '@/components/cylc/gscan/WorkflowIcon.vue'
import TreeItem from '@/components/cylc/tree/TreeItem.vue'
import WarningIcon from '@/components/cylc/WarningIcon.vue'
import { JobStateNames } from '@/model/JobState.model'
import { WorkflowState } from '@/model/WorkflowState.model'
import { useWorkflowWarnings } from '@/composables/localStorage'

/**
 * Get aggregated task state totals and latest task states for all descendents of a node.
 *
 * @param {Object} node
 * @param {Record<string, number>} stateTotals
 * @param {Record<string, string[]>} latestTasks
 * @param {Boolean} topLevel - true if the traversal depth is 0, else false.
 */
function traverseChildren (node, stateTotals = {}, latestTasks = {}, topLevel = true) {
  // if we aren't at the end of the node tree, continue recurse until we hit something other then a workflow part
  if (node.type === 'workflow-part' && node.children) {
    // at every branch, recurse all child nodes
    for (const child of node.children) {
      traverseChildren(child, stateTotals, latestTasks, false)
    }
  } else if (node.type === 'workflow' && node.node.stateTotals) {
    // if we are at the end of a node (or at least, hit a workflow node), stop and merge state

    // the latest state tasks from this node with all the others from the tree
    for (const [state, totals] of Object.entries(node.node.stateTotals)) {
      if (
        // filter only valid states
        JobStateNames.includes(state) &&
        // omit state totals from stopped workflows
        (topLevel || node.node.status !== 'stopped')
      ) {
        // (cast as numbers so they dont get concatenated as strings)
        stateTotals[state] = (stateTotals[state] ?? 0) + parseInt(totals)
      }
    }
    for (const [state, taskNames] of Object.entries(node.node.latestStateTasks)) {
      if (JobStateNames.includes(state)) {
        // concat the new tasks in where they don't already exist
        latestTasks[state] = [
          ...(latestTasks[state] ?? []),
          ...taskNames,
        ].sort().reverse() // cycle point descending order
      }
    }
  }
  return { stateTotals, latestTasks }
}

export default {
  name: 'GScanTreeItem',

  components: {
    Job,
    TreeItem,
    WarningIcon,
    WorkflowIcon,
  },

  data: () => ({
    workflowWarnings: useWorkflowWarnings()
  }),

  props: {
    node: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    filteredOutNodesCache: {
      type: WeakMap,
      required: true,
    },
    hoverable: {
      type: Boolean,
    },
  },

  computed: {
    workflowLink () {
      return this.node.type === 'workflow'
        ? `/workspace/${ this.node.tokens.workflow }`
        : ''
    },

    /** Task state totals and latest states for all descendents of this node. */
    descendantTaskInfo () {
      return traverseChildren(this.node)
    },

    nodeChildren () {
      return this.node.type === 'workflow'
        ? []
        : this.node.children
    },

    nodeClass () {
      return {
        'c-workflow-stopped': this.node.node?.status === WorkflowState.STOPPED.name,
      }
    }
  },

  methods: {
    getTaskStateClass (stateTotals, state) {
      return {
        'empty-state': !stateTotals[state]
      }
    },
  },

  nodeTypes: ['workflow-part', 'workflow'],
  maxTasksDisplayed: 5,
  WorkflowState,
}
</script>
