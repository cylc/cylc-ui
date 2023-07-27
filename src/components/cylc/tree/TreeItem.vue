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
          {{ $options.icons.mdiChevronRight }}
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
              :activator="null"
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
              <span class="text-grey-darken-1 leaf-entry-value">{{ item.property }}</span>
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
                <span class="text-grey-darken-1 leaf-entry-value">{{ customOutput.message }}</span>
              </div>
            </div>
            <div v-else class="leaf-entry px-5">
              <span class="leaf-entry-title text-grey-darken-1">No custom messages</span>
            </div>
          </div>
        </div>
      </slot>
      <slot
        v-else
        v-bind="{node, descendantTaskTotals, latestDescendantTasks, lastSingleDescendant, collapsedLabel, autoCollapse, isExpanded}"
        name="node"
      >
        <div :class="nodeDataClass">
          <span
            v-if="node?.node"
            @click="nodeClicked"
            :key="node.id"
            class="mx-1">{{ node.name }}</span>
        </div>
      </slot>
      <slot></slot>
    </div>
    <span
      v-show="isExpanded"
      v-if="!stopOn.includes(node.type)"
    >
      <!-- component recursion -->
      <TreeItem
        v-for="child in nodeChildren"
        ref="treeitem"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
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
import { JobStates } from '@/model/TaskState.model'

const JobStateNames = JobStates.map(({ name }) => name)

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
      manuallyExpanded: null,
    }
  },

  computed: {
    isExpanded: {
      get () {
        return this.manuallyExpanded ?? (!this.autoCollapse && this.autoExpandTypes.includes(this.node.type))
      },
      set (value) {
        this.manuallyExpanded = value
      }
    },
    /** Auto collapse if there is only 1 leaf workflow node. */
    autoCollapse () {
      return this.lastSingleDescendant.type === 'workflow'
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
    /** Last descendant node that is the only child of its parent. */
    lastSingleDescendant () {
      let currentNode = this.node
      while (currentNode.children?.length === 1 && currentNode.type === 'workflow-part') {
        currentNode = currentNode.children[0]
      }
      return currentNode
    },
    /** ID of collapsed node down to last descendant that is an only child. */
    collapsedLabel () {
      if (!this.node.parent) return undefined
      return this.lastSingleDescendant.id.substring(
        this.node.parent.length + 1 // (parent ID doesn't include slash so add 1)
      )
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
        'c-workflow-stopped': this.lastSingleDescendant?.node?.status === WorkflowState.STOPPED.name,
        expanded: this.isExpanded
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
    this.emitExpandCollapseEvent(this.isExpanded)
  },

  methods: {
    toggleExpandCollapse () {
      this.isExpanded = !this.isExpanded
      this.emitExpandCollapseEvent(this.isExpanded)
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
  },

  icons: {
    mdiChevronRight,
  },
}
</script>
