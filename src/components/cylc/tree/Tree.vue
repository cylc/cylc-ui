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
    :on-open-node="onOpenNode"
    :on-close-node="onCloseNode"
    >
    <template slot-scope="{ node, tree }" slot="default">
      <div class="node">
        <v-layout class="node-data" :style="nodeStyle(node)" wrap v-if="node.__type === 'cyclepoint'">
          <a @click="toggleClick($event, node, tree)" :class="togglerClass(node)"><span v-html="togglerContent(node)"></span></a>
          <v-flex shrink>
            <task :status="node.state.state" :progress=0 />
          </v-flex>
          <v-flex grow>
            <span class="mx-1">{{ node.name }}</span>
          </v-flex>
        </v-layout>
        <v-layout class="node-data" :style="nodeStyle(node)" wrap v-else-if="node.__type === 'family'">
          <a @click="toggleClick($event, node, tree)" :class="togglerClass(node)"><span v-html="togglerContent(node)"></span></a>
          <v-flex shrink>
            <task :status="node.state.state" :progress="node.state.progress" />
          </v-flex>
          <v-flex grow>
            <span class="mx-1">{{ node.name }}</span>
          </v-flex>
        </v-layout>
        <v-layout class="node-data" :style="nodeStyle(node)" wrap v-else-if="node.__type === 'task'">
          <a @click="toggleClick($event, node, tree)" :class="togglerClass(node)"><span v-html="togglerContent(node)"></span></a>
          <v-flex shrink>
            <task :status="node.state.state" :progress="node.progress" />
          </v-flex>
          <v-flex shrink>
            <span class="mx-1">{{ node.name }}</span>
          </v-flex>
          <v-flex grow ml-4 v-if="!node.state.open">
            <!-- Task summary -->
            <job
                v-for="(task, index) in node.children"
                :key="`${task.id}-summary-${index}`"
                :status="task.state.state" />
          </v-flex>
        </v-layout>
        <v-layout class="node-data" :style="nodeStyle(node)" @click="toggleClick($event, node, tree)" layout column v-else-if="node.__type === 'job'">
          <v-layout wrap>
            <v-flex shrink>
              <job :status="node.state.state" />
            </v-flex>
            <v-flex xs2 md1 lg1>
              <span class="mx-1">{{ node.name }}</span>
            </v-flex>
            <v-flex grow>
              <span class="grey--text">{{ node.state.host }}</span>
            </v-flex>
          </v-layout>
        </v-layout>
        <!-- Note: the class and styles for a job details panel are different than the other items in this series -->
        <v-container class="leaf" v-else-if="node.__type === 'jobdetails'">
          <div class="arrow-up" :style="getLeafTriangleStyle(node)"></div>
          <v-col class="leaf-data font-weight-light py-4">
            <v-row v-for="leafProperty in node.properties" :key="leafProperty.id" no-gutters>
              <v-col xs="4" sm="4" md="4" lg="2" xl="2" no-wrap>
                <span class="px-4">{{ leafProperty.title }}</span>
              </v-col>
              <v-col wrap>
                <span class="grey--text">{{ node[leafProperty.property] }}</span>
              </v-col>
            </v-row>
          </v-col>
        </v-container>
        <!-- fallback, not supposed to be used -->
        <div class="node-data" :style="nodeStyle(node)" v-else>
          <a @click="toggleClick($event, node, tree)" :class="togglerClass(node)"><span v-html="togglerContent(node)"></span></a>
          <span class="tree-text">{{ node.name }}</span>
        </div>
      </div>
    </template>
  </InfiniteTree>
</template>

<script>
import InfiniteTree from '@/components/cylc/tree/InfiniteTree'
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'

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
      node: null,
      tree: null
    }
  },
  mounted () {
    this.tree = this.$refs.tree.tree
  },
  methods: {
    nodeStyle (node) {
      return {
        'padding-left': `${node.state.depth * NODE_DEPTH_OFFSET}px`
      }
    },
    togglerContent (node) {
      const open = node.state.open
      const more = node.hasChildren()
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
      const more = node.hasChildren()
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
    onUpdate (node) {
      this.node = node
    },
    onOpenNode (node) {
      this.onUpdate(node)
    },
    onCloseNode (node) {
      this.onUpdate(node)
    },
    getLeafTriangleStyle (node) {
      return {
        'margin-left': `${(node.state.depth - 1) * NODE_DEPTH_OFFSET}px`
      }
    }
  }
}
</script>
