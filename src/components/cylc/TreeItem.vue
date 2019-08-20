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
      >{{ expanded ? '&#9661;' : '&#9655;' }}</v-flex>
      <!-- the node value -->
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
          <task :status="node.state" :progress=0 />
        </v-flex>
        <v-flex shrink>
          <span class="mx-1">{{ node.name }}</span>
        </v-flex>
        <v-flex grow ml-4 v-if="!expanded">
          <!-- Task summary -->
          <job
              v-for="(task, index) in node.children"
              :key="`${task.id}-summary-${index}`"
              :status="task.state" />
        </v-flex>
      </v-layout>
      <v-layout @click="nodeClicked" row wrap v-else-if="node.__type === 'job'">
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
      <v-layout row wrap v-else>
        <span @click="nodeClicked" class="mx-1">{{ node.name }}</span>
      </v-layout>
    </v-layout>
    <span v-show="expanded">
      <!-- component recursion -->
      <TreeItem
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :depth="depth + 1"
          :hoverable="hoverable"
          :min-depth="minDepth"
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
    hoverable: Boolean
  },
  data () {
    return {
      expanded: true,
      active: false,
      selected: false
    }
  },
  computed: {
    hasChildren () {
      return Object.prototype.hasOwnProperty.call(this.node, 'children')
    }
  },
  methods: {
    typeClicked () {
      if (this.node.__type === 'task') {
        // ok
      }
      this.expanded = !this.expanded
    },
    getTypeStyle () {
      const styles = {}
      if (this.hasChildren) {
        styles['cursor'] = 'pointer'
      }
      return styles
    },
    nodeClicked (e) {
      this.$emit('tree-item-clicked', this)
      if (e.ctrlKey) {
        console.log('Clicked with CTRL!')
      } else {
        console.log('Clicked without CTRL!')
      }
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
</style>
