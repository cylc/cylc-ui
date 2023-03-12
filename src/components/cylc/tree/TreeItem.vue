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
      <v-icon
        aria-label="Expand/collapse"
        role="img"
        aria-hidden="false"
        class="node-expand-collapse-button"
        v-if="shouldRenderExpandCollapseBtn"
        @click="toggleExpandCollapse"
        :style="expandCollapseBtnStyle"
      >{{ icons.mdiChevronRight }}</v-icon>
      <!-- the node value -->
      <!-- TODO: revisit these values that can be replaced by constants later (and in other components too). -->
      <slot name="cyclepoint" v-if="node.type === 'cycle'">
        <div :class="getNodeDataClass()" @click="nodeClicked">
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
        <div :class="getNodeDataClass()" @click="nodeClicked">
          <Task
            v-cylc-object="node"
            :key="node.id"
            :task="node.node"
          />
          <span class="mx-1">{{ node.name }}</span>
        </div>
      </slot>
      <slot name="task-proxy" v-else-if="node.type === 'task'">
        <div :class="getNodeDataClass()" @click="nodeClicked">
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
        <div :class="getNodeDataClass()" @click="nodeClicked">
          <Job
            v-cylc-object="node"
            :key="node.id"
            :status="node.node.state"
          />
          <span class="mx-1">#{{ node.node.submitNum }}</span>
          <span class="grey--text">{{ node.node.platform }}</span>
          <span
            class="grey--text d-flex flex-nowrap flex-row align-center"
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
              bottom
            >
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  v-bind="attrs"
                  v-on="on"
                  :color="customOutput.isMessage ? 'light-grey' : 'grey'"
                  :text-color="customOutput.isMessage ? 'black' : 'white'"
                  class="ml-2 message-output"
                  small
                >{{ customOutput.label }}</v-chip>
              </template>
              <span>{{ customOutput.message }}</span>
            </v-tooltip>
            <v-chip
              v-if="jobMessageOutputs.length > 5"
              color="grey"
              text-color="grey lighten-5"
              class="ml-2"
              small
              link
              @click="toggleExpandCollapse"
            >+{{ jobMessageOutputs.length - 5 }}</v-chip>
          </span>
        </div>
      </slot>
      <slot name="job-details" v-else-if="node.type === 'job-details'">
        <div class="leaf job-details">
          <div class="arrow-up" :style="leafTriangleStyle"></div>
          <div class="leaf-data font-weight-light py-4 pl-2">
            <div
              v-for="item in leafProperties"
              :key="item.property"
              class="leaf-entry"
            >
              <span class="px-4 leaf-entry-title">{{ item.title }}</span>
              <span class="grey--text leaf-entry-value">{{ node.node[item.property] }}</span>
            </div>
            <v-divider class="ml-3 mr-5" />
            <div class="leaf-entry">
              <span class="px-4 leaf-entry-title grey--text text--darken-1">outputs</span>
            </div>
            <div
              v-if="jobMessageOutputs && jobMessageOutputs.length > 0"
              class="leaf-outputs-entry"
            >
              <div
                v-for="customOutput of jobMessageOutputs"
                :key="customOutput.label"
                class="leaf-entry output"
              >
                <span class="px-4 leaf-entry-title">{{ customOutput.label }}</span>
                <span class="grey--text leaf-entry-value">{{ customOutput.message }}</span>
              </div>
            </div>
            <div v-else class="leaf-entry">
              <span class="px-4 leaf-entry-title grey--text text--darken-1">No custom messages</span>
            </div>
          </div>
        </div>
      </slot>
      <slot
        v-bind="{node, latestDescendantTasks, lastDescendent, descendentLabel, branchingLineage, expansionStatus}"
        name="node"
        v-else
      >
        <div :class="getNodeDataClass()">
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
        v-if="node.type === 'job'"
        ref="treeitem"
        :key="`${node.id}-job-details`"
        :node="{
          id: `${node.id}-job-details`,
          type: 'job-details',
          node: node.node
        }"
        :depth="depth + 1"
        :stopOn="stopOn"
        :hoverable="hoverable"
        :auto-collapse="autoCollapse"
        :autoExpandTypes="autoExpandTypes"
        :cyclePointsOrderDesc="cyclePointsOrderDesc"
        v-on:tree-item-created="$listeners['tree-item-created']"
        v-on:tree-item-destroyed="$listeners['tree-item-destroyed']"
        v-on:tree-item-expanded="$listeners['tree-item-expanded']"
        v-on:tree-item-collapsed="$listeners['tree-item-collapsed']"
        v-on:tree-item-clicked="$listeners['tree-item-clicked']"
      />
      <TreeItem
        v-else
        v-for="child in nodeChildren"
        ref="treeitem"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :stopOn="stopOn"
        :hoverable="hoverable"
        :auto-collapse="autoCollapse"
        :autoExpandTypes="autoExpandTypes"
        :cyclePointsOrderDesc="cyclePointsOrderDesc"
        v-on:tree-item-created="$listeners['tree-item-created']"
        v-on:tree-item-destroyed="$listeners['tree-item-destroyed']"
        v-on:tree-item-expanded="$listeners['tree-item-expanded']"
        v-on:tree-item-collapsed="$listeners['tree-item-collapsed']"
        v-on:tree-item-clicked="$listeners['tree-item-clicked']"
      >
        <!-- add scoped slots

          These allow components to register their own templats, e.g. GScan
          adds a template for rendering workflow nodes here.
        -->
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
          <slot :name="slot" v-bind="scope"/>
        </template>
      </TreeItem>
    </span>
  </div>
</template>

<script>
import { mdiChevronRight } from '@mdi/js'
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'
import { WorkflowState } from '@/model/WorkflowState.model'
import {
  latestJob,
  jobMessageOutputs
} from '@/utils/tasks'
import { getNodeChildren } from '@/components/cylc/tree/util'
import TaskState from '../../../model/TaskState.model'

/**
 * Offset used to move nodes to the right or left, to represent the nodes hierarchy.
 * @type {number} integer
 */
const NODE_DEPTH_OFFSET = 1.5 // em

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
    autoCollapse: {
      type: Boolean,
      default: false
    },
    autoExpandTypes: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data () {
    return {
      active: false,
      selected: false,
      filtered: true,
      leafProperties: [
        {
          title: 'platform',
          property: 'platform'
        },
        {
          title: 'job id',
          property: 'jobId'
        },
        {
          title: 'job runner',
          property: 'jobRunnerName'
        },
        {
          title: 'submit time',
          property: 'submittedTime'
        },
        {
          title: 'start time',
          property: 'startedTime'
        },
        {
          title: 'finish time',
          property: 'finishedTime'
        }
      ],
      icons: {
        mdiChevronRight
      },
      isExpanded: false,
      expandedStateOverridden: false
    }
  },
  // watch: {
  //   expansionStatus () {
  //     // only called when autoExpand changes
  //     if (!this.expandedStateOverridden) {
  //       this.emitExpandCollapseEvent(this.isExpanded)
  //     }
  //   }
  // },
  computed: {
    expansionStatus () {
      return this.autoCollapse && !this.expandedStateOverridden ? this.branchingLineage && this.autoExpandTypes.includes(this.node.type) : this.isExpanded
      // return (!this.expandedStateOverridden && this.autoCollapse) ? this.branchingLineage && this.autoExpandTypes.includes(this.node.type) : this.isExpanded
      // return this.isExpanded
    },
    latestDescendantTasks () {
      const validValues = [
        TaskState.SUBMITTED.name,
        TaskState.SUBMIT_FAILED.name,
        TaskState.RUNNING.name,
        TaskState.SUCCEEDED.name,
        TaskState.FAILED.name
      ]
      const tasks = {}
      const traverseChildren = (currentNode) => {
        // if we aren't at the end of the node tree, continue
        if (currentNode.children && currentNode.children.length > 0 && ['workflow', 'workflow-part'].includes(currentNode.children[0].type)) {
          traverseChildren(currentNode.children[0])
        } else {
          // if we are at the end of the tree, and the end of the tree is of type workflow, fetch the states from the latestStateTasks property
          if (currentNode.type === 'workflow') {
            Object.keys(currentNode.node.latestStateTasks)
              // filter only valid states
              .filter(stateTaskKey => validValues.includes(stateTaskKey))
              // concat the new tasks in where they dont already exist
              .forEach((key) => {
                if (!tasks[key]) {
                  tasks[key] = []
                }
                tasks[key] = [].concat(tasks[key], currentNode.node.latestStateTasks[key].filter(newTask => !tasks[key].includes(newTask)))
              })
          }
        }
      }
      traverseChildren(this.node)
      return tasks
    },
    lastDescendent () {
      let lastDescendent = this.node
      const traverseChildren = (currentNode) => {
        if (currentNode.children && currentNode.children.length > 0 && ['workflow', 'workflow-part'].includes(currentNode.children[0].type)) {
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
        if (currentNode.children && currentNode.children.length === 1 && ['workflow', 'workflow-part'].includes(currentNode.children[0].type)) {
          traverseChildren(currentNode.children[0])
        }
      }
      traverseChildren(this.node)
      return labelArr.join('/')
    },
    branchingLineage () {
      let moreThenTwoChildren = false
      const traverseChildren = (currentNode) => {
        if (moreThenTwoChildren === false && currentNode.children && currentNode.children.length > 0 && ['workflow', 'workflow-part'].includes(currentNode.children[0].type)) {
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
    nodeChildren () {
      // returns child nodes folling the family tree and following sort order
      return getNodeChildren(this.node, this.cyclePointsOrderDesc)
    },
    /** Get the node indentation in units of em. */
    nodeIndentation () {
      return this.depth * NODE_DEPTH_OFFSET
      // Note: this should actually depend on the expand/collapse icon size, but
      // fortuitously, the vuetify default icon size is 24px which is 1.5em for
      // a font-size of 16px
    },
    nodeStyle () {
      return {
        'padding-left': `${this.node.type === 'job-details' ? 0 : this.nodeIndentation}em`
      }
    },
    nodeClass () {
      return {
        'node--hoverable': this.hoverable,
        'node--active': this.active,
        'c-workflow-stopped': this.lastDescendent?.node?.status === WorkflowState.STOPPED.name,
        expanded: this.autoCollapse ? this.expansionStatus : this.isExpanded
      }
    },
    expandCollapseBtnStyle () {
      const styles = {}
      if (!this.hasChildren) {
        styles.visibility = 'hidden'
      }
      return styles
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
        'margin-left': `${this.nodeIndentation}em`
      }
    },
    jobMessageOutputs () {
      return jobMessageOutputs(this.node)
    }
  },
  created () {
    this.$emit('tree-item-created', this)
  },
  beforeDestroy () {
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
    getNodeDataClass () {
      const classes = {}
      classes['node-data'] = true
      classes[`node-data-${this.node.type}`] = true
      return classes
    },
    latestJob
  }
}
</script>
