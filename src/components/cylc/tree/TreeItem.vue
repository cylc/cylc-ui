<template>
  <div class="treeitem">
    <div
        :class="getNodeClass()"
        :style="getNodeStyle()"
    >
      <!-- the node's left icon; used for expand/collapse -->
      <v-flex
        class="node-expand-collapse-button"
        shrink
        v-if="hasChildren"
        @click="typeClicked"
        :style="getTypeStyle()"
      >{{ isExpanded ? '&#9661;' : '&#9655;' }}</v-flex>
      <!-- the node value -->
      <!-- TODO: revisit these values that can be replaced by constants later (and in other components too). -->
      <div :class="getNodeDataClass()" @click="nodeClicked" v-if="node.type === 'cyclepoint'">
        <task :status="node.node.state" :progress=0 />
        <span class="mx-1">{{ node.node.name }}</span>
      </div>
      <div :class="getNodeDataClass()" @click="nodeClicked" v-else-if="node.type === 'family-proxy'">
        <task :status="node.node.state" :progress="node.node.progress" />
        <span class="mx-1">{{ node.node.name }}</span>
      </div>
      <div :class="getNodeDataClass()" @click="nodeClicked" v-else-if="node.type === 'task-proxy'">
        <task :status="node.node.state" :progress="node.node.progress" />
        <span class="mx-1">{{ node.node.name }}</span>
        <div v-if="!isExpanded" class="node-summary">
          <!-- Task summary -->
          <job
              v-for="(task, index) in node.children"
              :key="`${task.id}-summary-${index}`"
              :status="task.node.state" />
        </div>
      </div>
      <div :class="getNodeDataClass()" v-else-if="node.type === 'job'">
        <div :class="getNodeDataClass()" @click="jobNodeClicked">
          <job :status="node.node.state" />
          <span class="mx-1">#{{ node.node.submitNum }}</span>
          <span class="grey--text">{{ node.node.host }}</span>
        </div>
        <!-- leaf node -->
      </div>
      <div :class="getNodeDataClass()" v-else>
        <span @click="nodeClicked" class="mx-1">{{ node.node.name }}</span>
      </div>
    </div>
    <div class="leaf" v-if="displayLeaf && node.type === 'job'">
      <div class="arrow-up" :style="getLeafTriangleStyle()"></div>
      <div class="leaf-data font-weight-light py-4 pl-2">
        <div v-for="leafProperty in leafProperties" :key="leafProperty.id" class="leaf-entry">
          <span class="px-4 leaf-entry-title">{{ leafProperty.title }}</span>
          <span class="grey--text leaf-entry-value">{{ node.node[leafProperty.property] }}</span>
        </div>
      </div>
    </div>
    <span v-show="isExpanded">
      <!-- component recursion -->
      <TreeItem
          v-for="child in node.children"
          ref="treeitem"
          :key="child.id"
          :node="child"
          :depth="depth + 1"
          :hoverable="hoverable"
          :initialExpanded="initialExpanded"
      ></TreeItem>
    </span>
  </div>
</template>

<script>
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'
import { TreeEventBus } from '@/components/cylc/tree/event-bus'

/**
 * Offset used to move nodes to the right or left, to represent the nodes hierarchy.
 * @type {number} integer
 */
const NODE_DEPTH_OFFSET = 30

export default {
  name: 'TreeItem',
  components: {
    task: Task,
    job: Job
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
    hoverable: Boolean,
    initialExpanded: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      active: false,
      selected: false,
      isExpanded: this.initialExpanded,
      leafProperties: [
        {
          title: 'host id',
          property: 'host'
        },
        {
          title: 'job id',
          property: 'batchSysJobId'
        },
        {
          title: 'batch sys',
          property: 'batchSysName'
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
        },
        {
          title: 'latest message',
          property: 'latestMessage'
        }
      ],
      displayLeaf: false
    }
  },
  computed: {
    hasChildren () {
      return this.node.children
    }
  },
  created () {
    TreeEventBus.$emit('tree-item-created', this)
  },
  beforeDestroy () {
    TreeEventBus.$emit('tree-item-destroyed', this)
  },
  beforeMount () {
    if (this.node.expanded !== undefined && this.node.expanded !== null) {
      this.isExpanded = this.node.expanded
      this.emitExpandCollapseEvent(this.isExpanded)
    }
  },
  methods: {
    typeClicked () {
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
        TreeEventBus.$emit('tree-item-expanded', this)
      } else {
        TreeEventBus.$emit('tree-item-collapsed', this)
      }
    },
    getTypeStyle () {
      const styles = {}
      if (this.hasChildren) {
        styles.cursor = 'pointer'
      }
      return styles
    },
    /**
     * Handler for when any node of the tree was clicked, except jobs.
     * @param {event} e event
     */
    nodeClicked (e) {
      TreeEventBus.$emit('tree-item-clicked', this)
    },
    /**
     * Handler for when a job node was clicked.
     * @param {event} e event
     */
    jobNodeClicked (e) {
      this.displayLeaf = !this.displayLeaf
    },
    getNodeStyle () {
      return {
        'padding-left': `${this.depth * NODE_DEPTH_OFFSET}px`
      }
    },
    /**
     * All nodes have the same padding-left. However, the job leaf node needs special care, as it will occupy the
     * whole content area.
     *
     * For this, we calculate it similarly to `getNodeStyle` but doing the reverse, to move the element to the
     * left, instead of moving it to the right. Using `depth` to calculate the exact location for the element.
     */
    getLeafTriangleStyle () {
      return {
        // we add half the depth offset to compensate and move the arrow under the job icon, the another 2px
        // just to center-align it
        'margin-left': `${(NODE_DEPTH_OFFSET / 2) + 2 + (this.depth * NODE_DEPTH_OFFSET)}px`
      }
    },
    getNodeClass () {
      return {
        node: true,
        'node--hoverable': this.hoverable,
        'node--active': this.active,
        'ml-3': true
      }
    },
    getNodeDataClass () {
      const classes = {}
      classes['node-data'] = true
      classes[this.node.type] = true
      return classes
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../../node_modules/vuetify/src/styles/styles';

$active-color: #BDD5F7;

@mixin active-state() {
  background-color: $active-color;
  &:hover {
    background-color: $active-color;
  }
}

@mixin states() {
  &:hover {
    background-color: map-get($grey, 'lighten-3');
  }
}

.treeitem {
  display: table;
  width: 100%;
  .node {
    line-height: 1.8em;
    display: flex;
    flex-wrap: nowrap;

    &--hoverable {
      @include states()
    }

    &--active {
      @include active-state()
    }

    .node-data {
      margin-left: 6px;
      display: flex;
      flex-wrap: nowrap;
      .node-summary {
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
      }
    }
  }
  .type {
    margin-right: 10px;
  }

  $arrow-size: 15px;
  $leaf-background-color: map-get($grey, 'lighten-3');

  .leaf {
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: nowrap;
    flex-direction: column;
    .arrow-up {
      width: 0;
      height: 0;
      border-left: $arrow-size solid transparent;
      border-right: $arrow-size solid transparent;
      border-bottom: $arrow-size solid $leaf-background-color;
      display: flex;
      flex-wrap: nowrap;
    }
    .leaf-data {
      display: flex;
      flex-wrap: nowrap;
      flex-direction: column;
      background-color: $leaf-background-color;
      .leaf-entry {
        display: flex;
        flex-wrap: nowrap;
        .leaf-entry-title {
          // This is the minimum width of the left part in a leaf entry, with the title
          // ATW the longest text is "latest message". This may need some tweaking. It
          // would be much simpler if we could rely on flex+row, but we have to create
          // two elements, and use a v-for with Vue. The v-for element creates an extra
          // wrapper that stops us of being able to use a single parent with display: flex
          min-width: 150px;
        }
        .leaf-entry-value {
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
