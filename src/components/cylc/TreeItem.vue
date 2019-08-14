<template>
  <div>
    <div
        :class="getNodeClass()"
        :style="{'padding-left': `${depth *30}px`}"
    >
      <!-- the node's left icon; used for expand/collapse -->
      <span
        v-if="hasChildren"
        class="type"
        @click="typeClicked"
        :style="getTypeStyle()"
      >{{ expanded ? '&#9661;' : '&#9655;' }}</span>
      <!-- the node value -->
      <span v-if="node.__type === 'cyclepoint'">
        <task :status="node.state" :progress=0 />
        <span @click="nodeClicked" class="mx-1">{{ node.name }}</span>
      </span>
      <span v-else-if="node.__type === 'task'">
        <task :status="node.state" :progress=0 />
        <span @click="nodeClicked" class="mx-1">{{ node.name }}</span>
      </span>
      <span v-else-if="node.__type === 'job'">
        <job :status="node.state" />
        <span @click="nodeClicked" class="mx-1">{{ node.name }}</span>
      </span>
      <span v-else>
        <span @click="nodeClicked" class="mx-1">{{ node.name }}</span>
      </span>
    </div>
    <span v-show="expanded">
      <!-- component recursion -->
      <TreeItem
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :depth="depth + 1"
          :hoverable="hoverable"
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
    hoverable: Boolean
  },
  data () {
    return {
      expanded: true,
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
      if (e.ctrlKey) {
        alert('Clicked with CTRL!')
      } else {
        alert('Clicked without CTRL!')
      }
    },
    getNodeClass () {
      return {
        node: true,
        active: this.selected,
        hoverable: this.hoverable
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../styles/material-dashboard/colors";

@mixin states() {
  &:hover {
    background-color: $grey-100;
  }

}

.node {
  line-height: 1.8em;

  &.hoverable {
    @include states()
  }
}
.type {
  margin-right: 10px;
}
</style>
