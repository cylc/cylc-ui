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
  <div
    v-show="filtered"
    class="treeitem"
  >
    <div
      class="node d-flex align-center"
      :class="nodeClass"
      :style="nodeStyle"
    >
      <!-- the node's left icon; used for expand/collapse -->
      <v-btn
        v-if="renderExpandCollapseBtn"
        aria-label="Expand/collapse"
        aria-hidden="false"
        class="node-expand-collapse-button flex-shrink-0"
        @click="toggleExpandCollapse"
        :style="expandCollapseBtnStyle"
        icon
        variant="text"
        density="compact"
      >
        <v-icon>
          {{ $options.icons.mdiChevronRight }}
        </v-icon>
      </v-btn>
      <slot v-bind="{ isExpanded }">
        <!-- the node value -->
        <!-- TODO: revisit these node.type values that can be replaced by constants later (and in other components too). -->
        <div
          :class="nodeDataClass"
          :style="nodeDataStyle"
          @click="nodeClicked"
        >
          <template v-if="node.type === 'cycle'">
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
          </template>
          <template v-else-if="node.type === 'family'">
            <Task
              v-cylc-object="node"
              :key="node.id"
              :task="node.node"
            />
            <span class="mx-1">{{ node.name }}</span>
          </template>
          <template v-else-if="node.type === 'task'">
            <!-- Task summary -->
            <Task
              v-cylc-object="node"
              :key="node.id"
              :task="node.node"
              :startTime="latestJob(node)?.startedTime"
            />
            <div
              v-if="!isExpanded"
              class="node-summary"
            >
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
          </template>
          <template v-else-if="node.type === 'job'">
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
          </template>
        </div>
      </slot>
    </div>
    <div v-show="isExpanded">
      <slot name="child">
        <!-- Need v-if to prevent render of fallback content when slot is provided but is empty -->
        <template v-if="!$slots.child">
          <JobDetails
            v-if="node.type === 'job'"
            v-bind="{ node, meanElapsedTime }"
            :indent="(depth + 1) * indent"
          />
          <!-- component recursion -->
          <TreeItem
            v-else
            v-for="child in nodeChildren"
            :key="child.id"
            :node="child"
            :depth="depth + 1"
            :mean-elapsed-time="meanElapsedTime ?? node.node.task?.meanElapsedTime"
            v-bind="{ hoverable, autoExpandTypes, cyclePointsOrderDesc, indent }"
            v-on="passthroughHandlers"
          />
        </template>
      </slot>
    </div>
  </div>
</template>

<script>
import { mdiChevronRight } from '@mdi/js'
import Task from '@/components/cylc/Task.vue'
import Job from '@/components/cylc/Job.vue'
import JobDetails from '@/components/cylc/tree/JobDetails.vue'
import {
  latestJob,
  jobMessageOutputs
} from '@/utils/tasks'
import { getNodeChildren } from '@/components/cylc/tree/util'

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
    Job,
    JobDetails,
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
    autoCollapse: {
      type: Boolean,
      default: false,
    },
    renderExpandCollapseBtn: {
      type: Boolean,
      default: true,
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
      default: () => ['workflow', 'cycle', 'family']
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
    },
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

    hasChildren () {
      return (
        // "job" nodes have auto-generated "job-detail" nodes
        this.node.type === 'job' ||
        // otherwise look to see whether there are any children
        Boolean(this.node.children?.length)
      )
    },
    /** returns child nodes following the family tree and following sort order */
    nodeChildren () {
      return this.node.type === 'job'
        ? null
        : getNodeChildren(this.node, this.cyclePointsOrderDesc)
    },
    /** Get the node indentation in units of px. */
    nodeIndentation () {
      return this.depth * this.indent
    },
    nodeStyle () {
      return {
        'padding-left': `${this.nodeIndentation}px`
      }
    },
    nodeClass () {
      return {
        'node--hoverable': this.hoverable,
        'node--active': this.active,
        expanded: this.isExpanded
      }
    },
    nodeDataClass () {
      return ['node-data', `node-data-${this.node.type}`]
    },
    nodeDataStyle () {
      return {
        marginLeft: `${nodeContentPad}px`,
      }
    },
    expandCollapseBtnStyle () {
      return {
        // set visibility 'hidden' to ensure element takes up space
        visibility: this.hasChildren ? null : 'hidden',
      }
    },
    jobMessageOutputs () {
      return jobMessageOutputs(this.node)
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
