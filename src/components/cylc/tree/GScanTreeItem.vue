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
    :auto-expand-types="nodeTypes"
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
            <v-tooltip style="overflow-wrap: anywhere;">
              {{ node.id }}
            </v-tooltip>
          </span>
        </div>
        <div class="d-flex c-gscan-workflow-states flex-grow-0 align-center">
          <v-icon
            v-for="modifier in statesInfo.modifiers"
            :key="modifier"
            :icon="modifierIcons[modifier]"
            v-tooltip="`Has ${modifier} tasks.`"
            size="1em"
            class="modifier-badge"
            :class="modifier"
          />
          <TaskStateBadge
            v-for="(value, state) in statesInfo.stateTotals"
            :key="state"
            v-bind="{ state, value }"
            :latest-tasks="statesInfo.latestTasks[state]"
          />
          <WarningIcon
            v-if="workflowWarnings"
            :workflow="node"
            class="ml-1"
            style="font-size: 120%;"
          />
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

<script setup>
import { computed } from 'vue'
import TaskStateBadge from '@/components/cylc/TaskStateBadge.vue'
import WorkflowIcon from '@/components/cylc/gscan/WorkflowIcon.vue'
import TreeItem from '@/components/cylc/tree/TreeItem.vue'
import WarningIcon from '@/components/cylc/WarningIcon.vue'
import TaskState from '@/model/TaskState.model'
import { WorkflowState } from '@/model/WorkflowState.model'
import { useWorkflowWarnings } from '@/composables/localStorage'
import { taskHeld, taskRetry } from '@/utils/icons'

const nodeTypes = ['workflow-part', 'workflow']

/** Display order in sidebar */
const taskStatesOrdered = [
  TaskState.FAILED.name,
  TaskState.SUBMIT_FAILED.name,
  TaskState.SUBMITTED.name,
  TaskState.RUNNING.name,
]

const modifierIcons = {
  held: taskHeld,
  retrying: taskRetry,
}

/**
 * Get aggregated task state totals for all descendents of a node.
 *
 * Also get latest state tasks for workflow nodes.
 *
 * @param {Object} node
 * @param {Record<string, number>} stateTotals - Accumulator for state totals.
 * @param {Set<string>} modifiers - Accumulator for modifier states.
 */
function getStatesInfo (node, stateTotals = {}, modifiers = new Set()) {
  const latestTasks = {}
  // if we aren't at the end of the node tree, continue recurse until we hit something other then a workflow part
  if (node.type === 'workflow-part' && node.children) {
    // at every branch, recurse all child nodes except stopped workflows
    for (const child of node.children) {
      if (child.node.status !== WorkflowState.STOPPED.name) {
        getStatesInfo(child, stateTotals, modifiers)
      }
    }
  } else if (node.type === 'workflow' && node.node.stateTotals) {
    // if we hit a workflow node, stop and merge state

    if (node.node.containsHeld) {
      modifiers.add('held')
    }
    if (node.node.containsRetry) {
      modifiers.add('retrying')
    }

    // the non-zero state totals from this node with all the others from the tree
    for (const state of taskStatesOrdered) {
      let nodeTotal = node.node.stateTotals[state]
      let nodeLatestTasks = node.node.latestStateTasks?.[state] ?? []
      if (state === TaskState.SUBMITTED.name) { // include preparing tasks
        nodeTotal += node.node.stateTotals.preparing
        nodeLatestTasks = [
          ...nodeLatestTasks,
          ...(node.node.latestStateTasks?.preparing ?? []),
        ].slice(0, 5) // limit to 5 latest (submitted tasks take priority)
      }
      if (nodeTotal) {
        stateTotals[state] = (stateTotals[state] ?? 0) + nodeTotal
      }
      if (nodeLatestTasks.length) {
        latestTasks[state] = nodeLatestTasks
      }
    }
  }
  return { stateTotals, latestTasks, modifiers }
}

const workflowWarnings = useWorkflowWarnings()

const props = defineProps({
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
})

const workflowLink = computed(
  () => props.node.type === 'workflow'
    ? `/workspace/${ props.node.tokens.workflow }`
    : ''
)

/** Task state totals for all descendents of this node. */
const statesInfo = computed(() => getStatesInfo(props.node))

const nodeChildren = computed(
  () => props.node.type === 'workflow' ? [] : props.node.children
)

const nodeClass = computed(() => ({
  'c-workflow-stopped': props.node.node?.status === WorkflowState.STOPPED.name,
}))
</script>
