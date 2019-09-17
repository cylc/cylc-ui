<template>
  <div>
    <v-layout
        row
        v-show="depth >= minDepth"
        :class="getNodeClass()"
        :style="getNodeStyle()"
    >
      <!-- the node's left icon; used for expand/collapse -->
      <v-flex
        shrink
        v-if="hasChildren"
        class="type"
        @click="typeClicked"
        :style="getTypeStyle()"
      >{{ isExpanded ? '&#9661;' : '&#9655;' }}</v-flex>
      <!-- the node value -->
      <!-- TODO: revisit these values that can be replaced by constants later (and in other components too). -->
      <v-layout @click="nodeClicked" row wrap v-if="node.__type === 'cyclepoint'">
        <v-flex shrink>
          <task :status="node.state" :progress=0 />
        </v-flex>
        <v-flex grow>
          <span class="mx-1">{{ node.name }}</span>
        </v-flex>
      </v-layout>
      <v-layout @click="nodeClicked" row wrap v-else-if="node.__type === 'task'">
        <v-flex shrink>
          <task :status="node.state" :progress="node.progress" />
        </v-flex>
        <v-flex shrink>
          <span class="mx-1">{{ node.name }}</span>
        </v-flex>
        <v-flex grow ml-4 v-if="!isExpanded">
          <!-- Task summary -->
          <job
              v-for="(task, index) in node.children"
              :key="`${task.id}-summary-${index}`"
              :status="task.state" />
        </v-flex>
      </v-layout>
      <v-layout column wrap v-else-if="node.__type === 'job'">
        <v-layout @click="jobNodeClicked" row wrap>
          <v-flex shrink>
            <job :status="node.state" />
          </v-flex>
          <v-flex xs2 md1 lg1>
            <span class="mx-1">{{ node.name }}</span>
          </v-flex>
          <v-flex grow>
            <span class="text-gray">{{ node.host }}</span>
          </v-flex>
        </v-layout>
        <!-- leaf node -->
        <div class="leaf" v-if="displayLeaf">
          <div class="arrow-up"></div>
          <v-layout column wrap class="py-2" style="margin-left: -80px;">
            <v-layout row v-for="leafProperty in leafProperties" :key="leafProperty.id">
              <v-flex xs4 sm3 md2 lg2 xl1 no-wrap>
                <span class="px-4">{{ leafProperty.title }}</span>
              </v-flex>
              <v-flex grow>
                <span class="text-gray">{{ node[leafProperty.property] }}</span>
              </v-flex>
            </v-layout>
          </v-layout>
        </div>
      </v-layout>
      <v-layout row wrap v-else>
        <span @click="nodeClicked" class="mx-1">{{ node.name }}</span>
      </v-layout>
    </v-layout>
    <span v-show="isExpanded">
      <!-- component recursion -->
      <TreeItem
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :depth="depth + 1"
          :hoverable="hoverable"
          :min-depth="minDepth"
          :expanded="expanded"
          v-on:tree-item-created="$emit('tree-item-created', $event)"
          v-on:tree-item-expanded="$emit('tree-item-expanded', $event)"
          v-on:tree-item-collapsed="$emit('tree-item-collapsed', $event)"
          v-on:tree-item-clicked="$emit('tree-item-clicked', $event)"
      ></TreeItem>
    </span>
  </div>
</template>

<script>
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'

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
    minDepth: {
      type: Number,
      default: 0
    },
    hoverable: Boolean,
    expanded: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      active: false,
      selected: false,
      isExpanded: this.expanded,
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
          title: 'start time',
          property: 'startedTime'
        }
      ],
      displayLeaf: false
    }
  },
  computed: {
    hasChildren () {
      return Object.prototype.hasOwnProperty.call(this.node, 'children')
    }
  },
  created () {
    this.$emit('tree-item-created', this)
  },
  methods: {
    typeClicked () {
      this.isExpanded = !this.isExpanded
      if (this.isExpanded) {
        this.$emit('tree-item-expanded', this)
      } else {
        this.$emit('tree-item-collapsed', this)
      }
    },
    getTypeStyle () {
      const styles = {}
      if (this.hasChildren) {
        styles['cursor'] = 'pointer'
      }
      return styles
    },
    /**
     * Handler for when any node of the tree was clicked, except jobs.
     * @param {event} e event
     */
    nodeClicked (e) {
      this.$emit('tree-item-clicked', this)
    },
    /**
     * Handler for when a job node was clicked.
     * @param {event} e event
     */
    jobNodeClicked (e) {
      this.displayLeaf = !this.displayLeaf
    },
    getNodeStyle () {
      // we need to compensate for the minimum depth set by the user, subtracting it
      // from the node depth.
      const depthDifference = this.depth - this.minDepth
      return {
        'padding-left': `${depthDifference * 30}px`
      }
    },
    getNodeClass () {
      return {
        node: true,
        'node--hoverable': this.hoverable,
        'node--active': this.active
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../styles/material-dashboard/colors";

$active-color: #BDD5F7;

@mixin active-state() {
  background-color: $active-color;
  &:hover {
    background-color: $active-color;
  }
}

@mixin states() {
  &:hover {
    background-color: $grey-100;
  }
}

.node {
  line-height: 1.8em;

  &--hoverable {
    @include states()
  }

  &--active {
    @include active-state()
  }
}
.type {
  margin-right: 10px;
}

$arrow-size: 15px;
$leaf-background-color: $grey-100;

.leaf {
  .arrow-up {
    width: 0;
    height: 0;
    border-left: $arrow-size solid transparent;
    border-right: $arrow-size solid transparent;
    border-bottom: $arrow-size solid $leaf-background-color;
  }
  .layout {
    background-color: $leaf-background-color;
    margin-right: -20px;
  }
}
</style>
