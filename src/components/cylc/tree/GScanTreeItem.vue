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
    v-bind="{ node, depth, hoverable }"
    :auto-expand-types="$options.nodeTypes"
    :render-expand-collapse-btn="node.type !== 'workflow'"
    :indent="18"
    ref="treeItem"
  >
    <template v-slot="{ isExpanded }">
      <WorkflowIcon
        v-if="node.type === 'workflow'"
        :status="node.node.status"
        v-cylc-object="node"
        :class="nodeClass"
        class="flex-shrink-0"
        style="margin: 0 2px;"
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
          <!-- We check the latestStateTasks below as offline workflows won't have a latestStateTasks property -->
          <div
            v-if="!isExpanded || node.type === 'workflow'"
            class="d-flex text-right c-gscan-workflow-states flex-grow-0"
          >
            <!-- task summary tooltips -->
            <!-- a v-tooltip does not work directly set on Cylc job component, so we use a div to wrap it -->
            <div
              v-for="[state, tasks] in Object.entries(latestDescendantTasks)"
              :key="`${node.id}-${state}`"
              :class="getTaskStateClass(descendantTaskTotals, state)"
              class="ma-0 pa-0"
              min-width="0"
              min-height="0"
              style="font-size: 120%; width: auto;"
            >
              <Job :status="state" />
              <v-tooltip location="top">
                <!-- tooltip text -->
                <div class="text-grey-lighten-1">
                  {{ countTasksInState(descendantTaskTotals, state) }} {{ state }}. Recent {{ state }} tasks:
                </div>
                <div v-for="(task, index) in tasks.slice(0, $options.maxTasksDisplayed)" :key="index">
                  {{ task }}<br v-if="index !== tasks.length -1" />
                </div>
              </v-tooltip>
            </div>
          </div>
        </div>
      </v-list-item>
    </template>

    <template v-slot:child>
      <!-- Component recursion -->
      <GScanTreeItem
        v-for="child in nodeChildren"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        v-bind="{ hoverable }"
      />
    </template>
  </TreeItem>
</template>

<script>
import Job from '@/components/cylc/Job.vue'
import WorkflowIcon from '@/components/cylc/gscan/WorkflowIcon.vue'
import TreeItem from '@/components/cylc/tree/TreeItem.vue'
import { JobStates } from '@/model/TaskState.model'
import { WorkflowState } from '@/model/WorkflowState.model'

const JobStateNames = JobStates.map(({ name }) => name)

export default {
  name: 'GScanTreeItem',

  components: {
    Job,
    TreeItem,
    WorkflowIcon
  },

  props: {
    node: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
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

    /** Get task state totals for all descendents of this node. */
    descendantTaskTotals () {
      const tasks = {}

      const traverseChildren = (currentNode) => {
        // if we aren't at the end of the node tree, continue recurse until we hit something other then a workflow part
        if (currentNode.type === 'workflow-part' && currentNode.children) {
          // at every branch, recurse all child nodes
          for (const child of currentNode.children) {
            traverseChildren(child)
          }
        } else if (currentNode.type === 'workflow' && currentNode.node.stateTotals) {
          // if we are at the end of a node (or at least, hit a workflow node), stop and merge the latest state tasks from this node with all the others from the tree
          for (const [state, totals] of Object.entries(currentNode.node.stateTotals)) {
            if (JobStateNames.includes(state)) { // filter only valid states
              // (cast as numbers so they dont get concatenated as strings)
              tasks[state] = (tasks[state] ?? 0) + parseInt(totals)
            }
          }
        }
      }
      traverseChildren(this.node)
      return tasks
    },

    latestDescendantTasks () {
      const tasks = {}

      const traverseChildren = (currentNode) => {
        // if we aren't at the end of the node tree, continue recurse until we hit something other then a workflow part
        if (currentNode.type === 'workflow-part' && currentNode.children) {
          // at every branch, recurse all child nodes
          for (const child of currentNode.children) {
            traverseChildren(child)
          }
        } else if (currentNode.type === 'workflow' && currentNode.node.latestStateTasks) {
          // if we are at the end of a node (or at least, hit a workflow node), stop and merge the latest state tasks from this node with all the others from the tree
          // in some test data we dont include the latestStateTasks, so include a fallback
          for (const [state, taskNames] of Object.entries(currentNode.node.latestStateTasks)) {
            if (JobStateNames.includes(state)) {
              // concat the new tasks in where they don't already exist
              tasks[state] = [
                ...(tasks[state] ?? []),
                ...taskNames,
              ].sort().reverse() // cycle point descending order
            }
          }
        }
      }
      traverseChildren(this.node)
      return tasks
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
    /**
     * Get number of tasks we have in a given state. The states are retrieved
     * from `latestStateTasks`, and the number of tasks in each state is from
     * the `stateTotals`. (`latestStateTasks` includes old tasks).
     *
     * @param taskTotals
     * @param {string} state - a workflow state
     * @returns {number|*} - the number of tasks in the given state
     */
    countTasksInState (taskTotals, state) {
      if (Object.hasOwnProperty.call(taskTotals, state)) {
        return taskTotals[state]
      }
      return 0
    },

    getTaskStateClass (latestStateTasks, state) {
      return {
        'empty-state': !this.countTasksInState(latestStateTasks, state)
      }
    },
  },

  nodeTypes: ['workflow-part', 'workflow'],
}
</script>
