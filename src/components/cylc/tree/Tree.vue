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
    class-name="tree"
    :tree-data="treeData"
    :tab-index="0"
    :should-load-nodes="shouldLoadNodes"
    :should-select-node="shouldSelectNode"
    :on-open-node="onOpenNode"
    :on-close-node="onCloseNode"
    :on-select-node="onSelectNode"
    >
    <!-- eslint-disable-next-line vue/no-unused-vars -->
    <template slot-scope="{ node, tree }">
      <div class="tree-node">
        <span class="tree-text">{{ node.name }}</span>
      </div>
    </template>
  </InfiniteTree>
</template>

<script>
import InfiniteTree from '@/components/cylc/tree/InfiniteTree'

export default {
  name: 'Tree',
  components: {
    InfiniteTree
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
    shouldLoadNodes (node) {
      return !node.hasChildren() && node.loadOnDemand
    },
    shouldSelectNode (node) { // Defaults to null
      return !(!node || (node === this.$refs.tree.tree.getSelectedNode()))
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
    onSelectNode (node) {
      this.onUpdate(node)
    }
  }
}
</script>
