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
  <div>
    <component
      :is="components[treeItemComponent]"
      v-for="child of rootChildren"
      :key="child.id"
      :node="child"
      v-bind="{ hoverable, cyclePointsOrderDesc, expandAll, filteredOutNodesCache, flat }"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import GScanTreeItem from '@/components/cylc/tree/GScanTreeItem.vue'
import TreeItem from '@/components/cylc/tree/TreeItem.vue'
import { getNodeChildren } from '@/components/cylc/tree/util'
import { useCyclePointsOrderDesc } from '@/composables/localStorage'

const props = defineProps({
  workflows: {
    type: Array,
    required: true
  },
  treeItemComponent: {
    type: String,
    default: TreeItem.name,
  },
  hoverable: Boolean,
  /**
   * Function used to recursively filter nodes.
   *
   * @param {Object} node
   * @param {WeakMap<Object, boolean>} filteredOutNodesCache - see the data
   * property below.
   */
  nodeFilterFunc: {
    type: Function,
    default: null,
  },
  /** An object representing filter state, used for watching filter changes. */
  filterState: {
    type: [Object, null],
    required: true,
  },
  /** List of node types to manually expand. */
  expandAll: {
    type: Array,
    default: null
  },
  autoStripTypes: {
    // If there is only one child of the root node and its type is listed in
    // this array then it will be stripped from the tree.
    // Use this to avoid displaying unnecessary nodes, e.g. if there is only
    // one workflow in the tree and this is set to ['workflow'] then the
    // workflow node will be stripped, leaving behind its cycle points as
    // root nodes.
    type: Array,
    required: false,
    default: () => []
  },
  flat: {
    type: Boolean,
    required: false,
    default: true,
  }
})

const components = {
  GScanTreeItem,
  TreeItem,
}

const cyclePointsOrderDesc = useCyclePointsOrderDesc()
/**
 * Map of nodes' filtered status.
 *
 * `true` means the node has been filtered out and should not be shown.
 * By using a WeakMap we do not have to worry about housekeeping nodes
 * that no longer exist.
 *
 * @type {WeakMap<Object, boolean>}
 */
const filteredOutNodesCache = ref(new WeakMap())

onMounted(() => {
  // Reactively run filtering
  if (props.nodeFilterFunc) {
    watch(
      () => [props.filterState, rootChildren.value],
      ([active, nodes], [wasActive, oldNodes]) => {
        if (active) {
          for (const node of rootChildren.value) {
            props.nodeFilterFunc(node, filteredOutNodesCache.value)
          }
        } else if (wasActive) {
          // Filters are no longer active - wipe the cache
          filteredOutNodesCache.value = new WeakMap()
        }
      },
      { deep: true }
    )
  }
})

/** Array of nodes at the top of the tree */
const rootChildren = computed(() => {
  if (
    props.workflows.length === 1 &&
    props.autoStripTypes.includes(props.workflows[0].type)
  ) {
    // if there is only one workflow we return its children
    // (i.e. cycle points)
    return getNodeChildren(props.workflows[0], cyclePointsOrderDesc.value)
  }
  // if there are multiple children we need to include the workflow
  // nodes to allow us to differentiate between them
  return props.workflows
})
</script>
