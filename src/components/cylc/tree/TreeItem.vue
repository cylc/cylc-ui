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
    v-show="!filteredOutNodesCache.get(node)"
    class="c-treeitem"
    :data-node-type="node.type"
    :data-node-name="node.name"
  >
    <div
      class="node d-flex align-center"
      :class="nodeClass"
      :style="nodeStyle"
    >
      <!-- the node's left icon; used for expand/collapse -->
      <svg
        v-if="renderExpandCollapseBtn"
        aria-label="Expand/collapse"
        class="node-expand-collapse-button flex-shrink-0"
        @click="toggleExpandCollapse()"
        :style="expandCollapseBtnStyle"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        role="img"
      >
        <path :d="$options.icons.mdiChevronRight" />
      </svg>
      <slot v-bind="{ isExpanded }">
        <!-- the node value -->
        <!-- TODO: revisit these node.type values that can be replaced by constants later (and in other components too). -->
        <div :class="nodeDataClass">
          <template v-if="node.type === 'cycle'">
            <!-- NOTE: cycle point nodes don't have any data associated with them
              at present so we must use the root family node for the task icon.
              We don't use this for the v-command-menu as that would set the node
              type to family. -->
            <Task
              v-command-menu="node"
              v-if="node.familyTree?.length"
              :key="node.id"
              :task="node.familyTree[0].node"
            />
            <span class="mx-1">{{ node.name }}</span>
          </template>
          <template v-else-if="node.type === 'family'">
            <Task
              v-command-menu="node"
              :key="node.id"
              :task="node.node"
            />
            <span class="mx-1">{{ node.name }}</span>
          </template>
          <div
            v-else-if="node.type === 'task'"
            class="d-flex align-center"
            :class="{ 'flow-none': isFlowNone(node.node.flowNums) }"
          >
            <!-- Task summary -->
            <Task
              v-command-menu="node"
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
                v-command-menu="job"
                :key="`${job.id}-summary-${index}`"
                :status="job.node.state"
                :previous-state="node.children.length > 1 ? node.children[1].node.state : ''"
              />
            </div>
            <span class="mx-1">{{ node.name }}</span>
            <span
              v-if="!isExpanded && latestJob(node)?.platform"
              class="mx-1 text-grey"
            >
              {{ latestJob(node)?.platform }}
            </span>
            <FlowNumsChip :flowNums="node.node.flowNums"/>
          </div>
          <template v-else-if="node.type === 'job'">
            <Job
              v-command-menu="node"
              :key="node.id"
              :status="node.node.state"
            />
            <span class="mx-1">#{{ node.node.submitNum }}</span>
            <span class="text-grey">{{ node.node.platform }}</span>
            <span
              class="text-grey d-flex flex-nowrap flex-row align-center"
              v-if="jobMessageOutputs && jobMessageOutputs.length > 0"
            >
              <v-defaults-provider
                :defaults="{
                  VChip: { size: 'small', density: 'comfortable', class: 'ml-2' },
                }"
              >
                <v-chip
                  v-for="(customOutput, index) of [...jobMessageOutputs].slice(0, 5)"
                  :key="`${customOutput.label}-${index}`"
                  :class="customOutput.isMessage ? 'bg-light-grey text-black' : 'bg-grey text-white'"
                  class="message-output"
                  v-tooltip="customOutput.isMessage ? `Task message: ${customOutput.message}` : customOutput.message"
                >
                  {{ customOutput.isMessage ? customOutput.message : customOutput.label }}
                </v-chip>
                <v-chip
                  v-if="jobMessageOutputs.length > 5"
                  class="bg-grey text-white"
                  @click="toggleExpandCollapse()"
                >
                  +{{ jobMessageOutputs.length - 5 }}
                </v-chip>
              </v-defaults-provider>
            </span>
          </template>
        </div>
      </slot>
    </div>

    <!-- Delay rendering of child tree items until first expanded,
    after that hide when collapsed but maintain state of children. -->
    <div
      v-if="renderChildren"
      v-show="isExpanded"
    >
      <slot name="child">
        <!-- Need v-if to prevent render of fallback content when slot is provided but is empty -->
        <template v-if="!$slots.child">
          <JobLeaf
            v-if="node.type === 'job'"
            v-bind="{ node, meanElapsedTime }"
            :depth="depth + 1"
          />
          <!-- component recursion -->
          <TreeItem
            v-else
            v-for="child in nodeChildren"
            :key="child.id"
            :node="child"
            :depth="depth + 1"
            :mean-elapsed-time="meanElapsedTime ?? node.node.task?.meanElapsedTime"
            v-bind="{ hoverable, autoExpandTypes, cyclePointsOrderDesc, expandAll, filteredOutNodesCache }"
          />
        </template>
      </slot>
    </div>
  </div>
</template>

<script>
import {
  mdiChevronRight,
} from '@mdi/js'
import Task from '@/components/cylc/Task.vue'
import Job from '@/components/cylc/Job.vue'
import JobLeaf from '@/components/cylc/tree/JobLeaf.vue'
import {
  jobMessageOutputs,
  latestJob,
  isFlowNone,
} from '@/utils/tasks'
import { getIndent, getNodeChildren } from '@/components/cylc/tree/util'
import { once } from '@/utils/reactivity'
import { useToggle } from '@vueuse/core'
import FlowNumsChip from '@/components/cylc/common/FlowNumsChip.vue'

export default {
  name: 'TreeItem',

  components: {
    FlowNumsChip,
    Task,
    Job,
    JobLeaf,
  },

  props: {
    node: {
      type: Object,
      required: true,
    },
    depth: {
      type: Number,
      default: 0,
    },
    renderExpandCollapseBtn: {
      type: Boolean,
      default: true,
    },
    cyclePointsOrderDesc: {
      type: Boolean,
      required: false,
      default: true,
    },
    hoverable: Boolean,
    /** Render expanded initially if node is one of these types. */
    autoExpandTypes: {
      type: Array,
      required: false,
      default: () => ['workflow', 'cycle', 'family'],
    },
    /** When this changes, will expand if node is one of these types, otherwise collapse. */
    expandAll: {
      type: Array,
      required: false,
    },
    filteredOutNodesCache: {
      type: WeakMap,
      required: true,
    },
    /** Pass mean run time from task down to (grand)child job details */
    meanElapsedTime: {
      type: Number,
      required: false,
    },
    flat: {
      type: Boolean,
      requried: false,
      default: false,
    },
  },

  setup (props) {
    const [isExpanded, toggleExpandCollapse] = useToggle(
      props.autoExpandTypes.includes(props.node.type)
    )
    // Toggles to true when this.isExpanded first becomes true and doesn't get recomputed afterwards
    const renderChildren = once(isExpanded)

    return {
      isExpanded,
      isFlowNone,
      latestJob,
      renderChildren,
      toggleExpandCollapse,
    }
  },

  computed: {
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
        : getNodeChildren(this.node, this.cyclePointsOrderDesc, this.flat)
    },
    nodeStyle () {
      return {
        'padding-left': getIndent(this.depth),
      }
    },
    nodeClass () {
      return {
        'node--hoverable': this.hoverable,
        expanded: this.isExpanded,
      }
    },
    nodeDataClass () {
      return ['node-data', `node-data-${this.node.type}`]
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

  watch: {
    expandAll (nodeTypes) {
      if (nodeTypes?.includes(this.node.type)) {
        this.isExpanded = true
      } else if (nodeTypes?.length === 0) {
        this.isExpanded = false // manually collapsed
      }
    },
  },

  icons: {
    mdiChevronRight,
  },
}
</script>
