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
  <div class="treeitem" v-show="filtered">
    <div
      class="node d-flex align-center"
      :class="nodeClass"
      :style="nodeStyle"
    >
      <!-- the node's left icon; used for expand/collapse -->
      <v-btn
        aria-label="Expand/collapse"
        aria-hidden="false"
        class="node-expand-collapse-button flex-shrink-0"
        @click="toggleExpandCollapse"
        v-if="shouldRenderExpandCollapseBtn"
        :style="expandCollapseBtnStyle"
        icon
        variant="text"
        density="compact"
      >
        <v-icon>
          {{ icons.mdiChevronRight }}
        </v-icon>
      </v-btn>
      <!-- the node value -->
      <!-- TODO: revisit these values that can be replaced by constants later (and in other components too). -->
      <slot name="cyclepoint" v-if="node.type === 'cycle'">
        <div :class="nodeDataClass" @click="nodeClicked">
          <!-- NOTE: cycle point nodes don't have any data associated with them
            at present so we must use the root family node for the task icon.
            We don't use this for the v-cylc-object as that would set the node
            type to family. -->
          <Task
            v-cylc-object="node"
            v-if="node.familyTree"
            :key="node.id"
            :task="node.familyTree[0].node"
          />
          <span class="mx-1">{{ node.name }}</span>
        </div>
      </slot>
      <slot name="family-proxy" v-else-if="node.type === 'family'">
        <div :class="nodeDataClass" @click="nodeClicked">
          <Task
            v-cylc-object="node"
            :key="node.id"
            :task="node.node"
          />
          <span class="mx-1">{{ node.name }}</span>
        </div>
      </slot>
      <slot name="task-proxy" v-else-if="node.type === 'task'">
        <div :class="nodeDataClass" @click="nodeClicked">
          <!-- Task summary -->
          <Task
            v-cylc-object="node"
            :key="node.id"
            :task="node.node"
            :startTime="(latestJob(node) || {}).startedTime"
          />
          <div v-if="!isExpanded" class="node-summary">
            <!-- most recent job summary -->
            <Job
              v-for="(job, index) in node.children.slice(0, 1)"
              v-cylc-object="job"
              :key="`${job.id}-summary-${index}`"
              :status="job.node.state"
              :previous-state="node.children.length > 1 ? node.children[1].node.state : ''"
              style="margin-left: 0.25em;"
            />
          </div>
          <span class="mx-1">{{ node.name }}</span>
        </div>
      </slot>
      <slot name="job" v-else-if="node.type === 'job'">
        <div :class="nodeDataClass" @click="nodeClicked">
          <Job
            v-cylc-object="node"
            :key="node.id"
            :status="node.node.state"
          />
          <span class="mx-1">#{{ node.node.submitNum }}</span>
          <span class="text-grey">{{ node.node.platform }}</span>
          <span
            class="text-grey d-flex flex-nowrap flex-row align-center"
            v-if="jobMessageOutputs && jobMessageOutputs.length > 0"
          >
            <!--
              We had a tricky bug in #530 due to the :key here. In summary, the list
              that is backing this component changes. It contains zero or more entries,
              up to N (5 at the time of writing).
              Initially we used `:key=customOutput.id` here. But Vue tried to avoid
              changing the DOM elements, which caused some elements to be out of order
              in the final rendered UI (as Vue was trying to optimize and keep the
              DOM elements in-place whenever possible).
              That behaviour is not deterministic, so sometimes you would have the list
              in order. The fix was to use a key that combines a string with the list
              iteration `index` (the `:key` value must be unique, so we used output-chip
              prefix).
              @see https://github.com/cylc/cylc-ui/pull/530#issuecomment-781076619
            -->
            <v-tooltip
              v-for="(customOutput, index) of [...jobMessageOutputs].slice(0, 5)"
              :key="`output-chip-${index}`"
              location="bottom"
            >
              <template v-slot:activator="{ props }">
                <v-chip
                  v-bind="props"
                  :class="customOutput.isMessage ? 'bg-light-grey text-black' : 'bg-grey text-white'"
                  class="ml-2 message-output"
                  size="small"
                >
                  {{ customOutput.label }}
                </v-chip>
              </template>
              <span>{{ customOutput.message }}</span>
            </v-tooltip>
            <v-chip
              v-if="jobMessageOutputs.length > 5"
              class="ml-2 bg-grey text-white"
              size="small"
              link
              @click="toggleExpandCollapse"
            >
              +{{ jobMessageOutputs.length - 5 }}
            </v-chip>
          </span>
        </div>
      </slot>
      <slot name="job-details" v-else-if="node.type === 'job-details'">
        <div class="leaf job-details mb-2">
          <div class="arrow-up" :style="leafTriangleStyle"></div>
          <div class="leaf-data font-weight-light py-4">
            <div
              v-for="item in leafProperties"
              :key="item.title"
              class="leaf-entry px-5"
            >
              <span class="leaf-entry-title">{{ item.title }}</span>
              <span class="text-grey leaf-entry-value">{{ item.property }}</span>
            </div>
            <v-divider class="mx-5" />
            <div class="leaf-entry px-5">
              <span class="leaf-entry-title text-grey-darken-1">Outputs</span>
            </div>
            <div
              v-if="jobMessageOutputs?.length"
              class="leaf-outputs-entry"
            >
              <div
                v-for="customOutput of jobMessageOutputs"
                :key="customOutput.label"
                class="leaf-entry output px-5"
              >
                <span class="leaf-entry-title">{{ customOutput.label }}</span>
                <span class="text-grey leaf-entry-value">{{ customOutput.message }}</span>
              </div>
            </div>
            <div v-else class="leaf-entry px-5">
              <span class="leaf-entry-title text-grey-darken-1">No custom messages</span>
            </div>
          </div>
        </div>
      </slot>
      <slot
        v-bind="{node, descendantTaskTotals, latestDescendantTasks, lastDescendent, descendentLabel, branchingLineage, expansionStatus}"
        name="node"
        v-else
      >
        <div :class="nodeDataClass">
          <span
            v-if="node && node.node"
            @click="nodeClicked"
            :key="node.id"
            class="mx-1">{{ node.name }}</span>
        </div>
      </slot>
      <slot></slot>
    </div>
    <span
      v-show="expansionStatus"
      v-if="!stopOn.includes(node.type)"
    >
      <!-- component recursion -->
      <TreeItem
        v-for="child in nodeChildren"
        ref="treeitem"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :auto-collapse="autoCollapse"
        :mean-elapsed-time="meanElapsedTime ?? node.node.task?.meanElapsedTime"
        v-bind="{ stopOn, hoverable, autoExpandTypes, cyclePointsOrderDesc, indent }"
        v-on="passthroughHandlers"
      >
        <!-- add scoped slots

          These allow components to register their own templats, e.g. GScan
          adds a template for rendering workflow nodes here.
        -->
        <template
          v-for="(_, slotName) of $slots"
          v-slot:[slotName]="scope"
        >
          <slot :name="slotName" v-bind="scope" />
        </template>
      </TreeItem>
    </span>
  </div>
</template>

<script>
import { mdiChevronRight } from '@mdi/js'
import Task from '@/components/cylc/Task.vue'
import Job from '@/components/cylc/Job.vue'
import { WorkflowState } from '@/model/WorkflowState.model'
import {
  formatDuration,
  latestJob,
  jobMessageOutputs
} from '@/utils/tasks'
import { getNodeChildren } from '@/components/cylc/tree/util'
import TaskState from '../../../model/TaskState.model'

/**
 * Events that are passed through up the chain from child TreeItems.
 *
 * i.e. they are re-emitted by this TreeItem when they occur on a
 * child TreeItem, all the way up to the parent Tree component.
 */
const passthroughEvents = [
  'tree-item-created',
  'tree-item-destroyed',
  'tree-item-expanded',
  'tree-item-collapsed',
  'tree-item-clicked'
]

export const defaultNodeIndent = 28 // px

/** Margin between expand/collapse btn & node content */
export const nodeContentPad = 6 // px

export default {
  name: 'TreeItem',

  components: {
    Task,
    Job
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
    stopOn: {
      // Array of node types to stop recursion on
      // i.e. don't show child nodes below the provided types
      type: Array,
      required: false,
      default: () => []
    },
    cyclePointsOrderDesc: {
      type: Boolean,
      required: false,
      default: true
    },
    autoCollapse: {
      type: Boolean,
      default: false
    },
    hoverable: Boolean,
    autoExpandTypes: {
      type: Array,
      required: false,
      default: () => []
    },
    /** Indent in px; default is expand/collapse btn width */
    indent: {
      type: Number,
      required: false,
      default: defaultNodeIndent
    },
    /** Pass mean run time from task down to (grand)child job details */
    meanElapsedTime: {
      type: Number,
      required: false,
    }
  },

  emits: [
    ...passthroughEvents
  ],

  data () {
    return {
      active: false,
      selected: false,
      filtered: true,
      icons: {
        mdiChevronRight
      },
      isExpanded: false,
      expandedStateOverridden: false
    }
  },

  computed: {
    expansionStatus () {
      return this.autoCollapse && !this.expandedStateOverridden ? this.branchingLineage && this.autoExpandTypes.includes(this.node.type) : this.isExpanded
    },
    descendantTaskTotals () {
      const tasks = {}
      const validValues = [
        TaskState.SUBMITTED.name,
        TaskState.SUBMIT_FAILED.name,
        TaskState.RUNNING.name,
        TaskState.SUCCEEDED.name,
        TaskState.FAILED.name
      ]
      const traverseChildren = (currentNode) => {
        // if we aren't at the end of the node tree, continue recurse until we hit something other then a workflow part
        if (currentNode.type === 'workflow-part' && currentNode.children) {
          // at every branch, recurse all child nodes
          currentNode.children.forEach(child => traverseChildren(child))
        } else {
          // if we are at the end of a node (or at least, hit a workflow node), stop and merge the latest state tasks from this node with all the others from the tree
          if (currentNode.type === 'workflow') {
            // in some test data we dont include the latestStateTasks, so include a fallback
            Object.keys(currentNode.node.stateTotals || {})
            // filter only valid states
              .filter(stateTaskKey => validValues.includes(stateTaskKey))
            // concat the new tasks in where they dont already exist
              .forEach((key) => {
                if (!tasks[key]) {
                  tasks[key] = []
                }
                // cast as numbers so they dont get concatenated as strings
                tasks[key] = Math.abs(tasks[key]) + Math.abs(currentNode.node.stateTotals[key])
              })
          }
        }
      }
      traverseChildren(this.node)
      return tasks
    },
    latestDescendantTasks () {
      const tasks = {}
      const validValues = [
        TaskState.SUBMITTED.name,
        TaskState.SUBMIT_FAILED.name,
        TaskState.RUNNING.name,
        TaskState.SUCCEEDED.name,
        TaskState.FAILED.name
      ]
      const traverseChildren = (currentNode) => {
        // if we aren't at the end of the node tree, continue recurse until we hit something other then a workflow part
        if (currentNode.type === 'workflow-part' && currentNode.children) {
          // at every branch, recurse all child nodes
          currentNode.children.forEach(child => traverseChildren(child))
        } else {
          // if we are at the end of a node (or at least, hit a workflow node), stop and merge the latest state tasks from this node with all the others from the tree
          if (currentNode.type === 'workflow') {
            // in some test data we dont include the latestStateTasks, so include a fallback
            Object.keys(currentNode.node.latestStateTasks || {})
            // filter only valid states
              .filter(stateTaskKey => validValues.includes(stateTaskKey))
            // concat the new tasks in where they dont already exist
              .forEach((key) => {
                if (!tasks[key]) {
                  tasks[key] = []
                }
                // sort the tasks in decending order
                tasks[key] = [].concat(tasks[key], currentNode.node.latestStateTasks[key]).sort((item1, item2) => (new Date(item2.split('/')[0]).getTime() - (new Date(item1.split('/')[0]).getTime())))
              })
          }
        }
      }
      traverseChildren(this.node)
      return tasks
    },
    // this has be used in conjunction with branchingLineage since it will always return the first child otherwise
    lastDescendent () {
      let lastDescendent = this.node
      const traverseChildren = (currentNode) => {
        // continue recursing until we run out of workflow parts
        if (currentNode.children && currentNode.children.length > 0 && currentNode.type === 'workflow-part') {
          traverseChildren(currentNode.children[0])
        } else {
          lastDescendent = currentNode
        }
      }
      traverseChildren(lastDescendent)
      return lastDescendent
    },
    descendentLabel () {
      const labelArr = []
      const traverseChildren = (currentNode) => {
        labelArr.push(currentNode.name || currentNode.id)
        if (currentNode.children && currentNode.children.length === 1 && currentNode.type === 'workflow-part') {
          traverseChildren(currentNode.children[0])
        }
      }
      traverseChildren(this.node)
      return labelArr.join('/')
    },
    branchingLineage () {
      let moreThenTwoChildren = false
      const traverseChildren = (currentNode) => {
        if (currentNode.children && currentNode.children.length > 0 && currentNode.type === 'workflow-part') {
          if (currentNode.children.length === 1) {
            traverseChildren(currentNode.children[0])
          } else {
            moreThenTwoChildren = true
          }
        }
      }
      traverseChildren(this.node)
      return moreThenTwoChildren
    },
    hasChildren () {
      if (this.stopOn.includes(this.node.type)) {
        // don't show children if the tree has been configured to stop at
        // this level
        return false
      }
      return (
        // "job" nodes have auto-generated "job-detail" nodes
        this.node.type === 'job' ||
        // otherwise look to see whether there are any children
        Boolean(this.node.children?.length)
      )
    },
    /** returns child nodes following the family tree and following sort order */
    nodeChildren () {
      if (this.node.type === 'job') {
        return [{
          id: `${this.node.id}-job-details`,
          type: 'job-details',
          node: this.node.node,
        }]
      }
      return getNodeChildren(this.node, this.cyclePointsOrderDesc)
    },
    /** Get the node indentation in units of px. */
    nodeIndentation () {
      return this.depth * this.indent
    },
    nodeStyle () {
      return {
        'padding-left': `${this.node.type === 'job-details' ? 0 : this.nodeIndentation}px`
      }
    },
    nodeClass () {
      return {
        'node--hoverable': this.hoverable,
        'node--active': this.active,
        'c-workflow-stopped': !this.branchingLineage && this.lastDescendent?.node?.status === WorkflowState.STOPPED.name,
        expanded: this.autoCollapse ? this.expansionStatus : this.isExpanded
      }
    },
    nodeDataClass () {
      return ['node-data', `node-data-${this.node.type}`]
    },
    expandCollapseBtnStyle () {
      return {
        // set visibility 'hidden' to ensure element takes up space
        visibility: this.hasChildren ? null : 'hidden',
        marginRight: `${nodeContentPad}px`,
      }
    },
    /**
     * Whether the expand collapse button for this TreeItem should be rendered.
     *
     * Note for workflow leafs it will still be rendered but be hidden. This is
     * to maintain the correct indentation.
     */
    shouldRenderExpandCollapseBtn () {
      return this.hasChildren || !['workflow', 'job-details'].includes(this.node.type)
      // Do not render for GSscan leafs or job details
    },
    /** Make the job details triangle point to the job icon */
    leafTriangleStyle () {
      return {
        'margin-left': `${this.nodeIndentation + nodeContentPad}px`
      }
    },
    jobMessageOutputs () {
      return jobMessageOutputs(this.node)
    },
    leafProperties () {
      if (this.node.type !== 'job-details') {
        return null
      }
      return [
        {
          title: 'Platform',
          property: this.node.node.platform
        },
        {
          title: 'Job ID',
          property: this.node.node.jobId
        },
        {
          title: 'Job runner',
          property: this.node.node.jobRunnerName
        },
        {
          title: 'Submitted',
          property: this.node.node.submittedTime
        },
        {
          title: 'Started',
          property: this.node.node.startedTime
        },
        {
          title: 'Finished',
          property: this.node.node.finishedTime
        },
        {
          title: 'Mean run time',
          property: formatDuration(this.meanElapsedTime)
        },
      ]
    },
  },

  created () {
    this.$emit('tree-item-created', this)
    this.passthroughHandlers = Object.fromEntries(
      passthroughEvents.map((eventName) => (
        [eventName, (treeItem) => this.$emit(eventName, treeItem)]
      ))
    )
  },

  beforeUnmount () {
    this.$emit('tree-item-destroyed', this)
  },

  beforeMount () {
    // apply auto-expand rules when a treeitem is created
    this.isExpanded = !this.autoCollapse ? this.autoExpandTypes.includes(this.node.type) : this.isExpanded
    this.emitExpandCollapseEvent(this.isExpanded)
  },

  methods: {
    toggleExpandCollapse () {
      this.isExpanded = !this.isExpanded
      this.emitExpandCollapseEvent(this.isExpanded)
      if (!this.expandedStateOverridden) {
        this.expandedStateOverridden = true
      }
    },
    /**
     * Emits an event `tree-item-expanded` if `expanded` is true, or emits
     * `tree-item-collapsed` if `expanded` is false.
     * @param {boolean} expanded whether the node is expanded or not
     */
    emitExpandCollapseEvent (expanded) {
      if (expanded) {
        this.$emit('tree-item-expanded', this)
      } else {
        this.$emit('tree-item-collapsed', this)
      }
    },
    /**
     * Handler for when any node of the tree was clicked, except jobs.
     * @param {event} e event
     */
    nodeClicked (e) {
      this.$emit('tree-item-clicked', this)
    },
    latestJob
  }
}
</script>
