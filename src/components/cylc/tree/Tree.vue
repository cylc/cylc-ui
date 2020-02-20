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
  <InfiniteTree
    ref="tree"
    class-name="tree my-2"
    :tree-data="treeData"
    :tab-index="0"
    >
    <template slot-scope="{ node, tree }" slot="default">
      <div class="treeitem">
        <div
            :class="getNodeClass()"
            :style="getNodeStyle(node)"
        >
          <!-- the node value -->
          <!-- TODO: revisit these values that can be replaced by constants later (and in other components too). -->
          <div class="node-data" v-if="node.type === 'cyclepoint'">
            <a @click="toggleClick($event, node, tree)" :class="togglerClass(node)"><span v-html="togglerContent(node)"></span></a>
            <task :status="node.node.state" :progress=0 />
            <span class="mx-1">{{ node.node.name }}</span>
          </div>
          <div class="node-data" v-else-if="node.type === 'family-proxy'">
            <a @click="toggleClick($event, node, tree)" :class="togglerClass(node)"><span v-html="togglerContent(node)"></span></a>
            <task :status="node.node.state" :progress="node.node.progress" />
            <span class="mx-1">{{ node.node.name }}</span>
          </div>
          <div class="node-data" v-else-if="node.type === 'task-proxy'">
            <a @click="toggleClick($event, node, tree)" :class="togglerClass(node)"><span v-html="togglerContent(node)"></span></a>
            <task :status="node.node.state" :progress="node.node.progress" />
            <span class="mx-1">{{ node.node.name }}</span>
            <div v-if="!node.state.open" class="node-summary">
              <!-- Task summary -->
              <job
                  v-for="(task, index) in node.children"
                  :key="`${task.id}-summary-${index}`"
                  :status="task.node.state" />
            </div>
          </div>
          <div class="node-data" @click="toggleClick($event, node, tree)" v-else-if="node.type === 'job'">
            <div class="node-data">
              <job :status="node.node.state" />
              <span class="mx-1">#{{ node.node.submitNum }}</span>
              <span class="grey--text">{{ node.node.host }}</span>
            </div>
          </div>
          <div class="node-data" v-else>
            <span class="mx-1">{{ node.node.name }}</span>
          </div>
        </div>
        <div class="leaf" v-if="node.type === 'job-details'">
          <div class="arrow-up" :style="getLeafTriangleStyle(node)"></div>
          <div class="leaf-data font-weight-light py-4 pl-2">
            <div v-for="leafProperty in jobDetailsNodeProperties" :key="leafProperty.id" class="leaf-entry">
              <span class="px-4 leaf-entry-title">{{ leafProperty.title }}</span>
              <span class="grey--text leaf-entry-value">{{ node.node[leafProperty.property] }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </InfiniteTree>
</template>

<script>
import InfiniteTree from '@/components/cylc/tree/InfiniteTree'
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'
import { JOB_DETAIL_NODE_PROPERTIES } from '@/components/cylc/tree/index'

/**
 * Offset used to move nodes to the right or left, to represent the nodes hierarchy.
 * @type {number} integer
 */
const NODE_DEPTH_OFFSET = 30

export default {
  name: 'Tree',
  components: {
    InfiniteTree,
    Task,
    Job
  },
  props: {
    treeData: {
      type: [Array, Object],
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      tree: null,
      jobDetailsNodeProperties: JOB_DETAIL_NODE_PROPERTIES
    }
  },
  mounted () {
    this.tree = this.$refs.tree.tree
  },
  methods: {
    togglerContent (node) {
      const open = node.state.open
      const more = Object.hasOwnProperty.call(node, 'children') && node.children.length > 0
      let togglerContent = ''
      if (more && open) {
        togglerContent = '&#9661;'
      } else if (more && !open) {
        togglerContent = '&#9655;'
      }
      return togglerContent
    },
    togglerClass (node) {
      const open = node.state.open
      const more = Object.hasOwnProperty.call(node, 'children') && node.children.length > 0
      let togglerClass = 'mr-1'
      if (more && !open) {
        togglerClass += ' infinite-tree-closed'
      }
      return togglerClass
    },
    toggleClick (e, node, tree) {
      e.stopPropagation()
      const open = node.state.open
      if (!open) {
        tree.openNode(node)
        tree.selectNode(node)
      } else {
        tree.closeNode(node)
      }
    },
    getTypeStyle (node) {
      const styles = {}
      if (this.hasChildren(node)) {
        styles.cursor = 'pointer'
      }
      return styles
    },
    getNodeStyle (node) {
      return {
        'padding-left': `${node.state.depth * NODE_DEPTH_OFFSET}px`
      }
    },
    getLeafTriangleStyle (node) {
      return {
        'margin-left': `${node.state.depth * NODE_DEPTH_OFFSET}px`
      }
    },
    getNodeClass () {
      return {
        node: true,
        'ml-3': true
      }
    },
    hasChildren (node) {
      return node.children
    }
  }
}
</script>
