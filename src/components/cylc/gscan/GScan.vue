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
    class="c-gscan"
  >
    <div class="d-flex flex-row mx-4 mb-2 flex-grow-0">
      <!-- filters -->
      <v-text-field
        v-model="searchWorkflows"
        clearable
        placeholder="Search"
        class="flex-grow-1 flex-column"
        id="c-gscan-search-workflows"
      />
      <!-- button to activate the filters menu -->
      <v-badge
        :content="numFilters"
        :model-value="Boolean(numFilters)"
      >
        <v-btn
          icon
          class="flex-grow-0 flex-column ml-2"
          id="c-gscan-filter-tooltip-btn"
          variant="text"
          size="small"
          data-cy="gscan-filter-btn"
        >
          <v-icon size="x-large">
            {{ $options.icons.mdiFilter }}
          </v-icon>
        </v-btn>
      </v-badge>
      <!-- filters tooltip -->
      <v-menu
        activator="#c-gscan-filter-tooltip-btn"
        :close-on-content-click="false"
        location="right"
      >
        <v-card width="500px">
          <v-list>
            <v-list-item
              v-for="(items, title) in filters"
              :key="title"
            >
              <TaskFilterSelect
                v-model="filters[title]"
                :type="title"
                :items="$options.allStates[title]"
                class="my-2"
                density="default"
                :label="`Filter by ${title}`"
                :data-cy="`filter ${title}`"
                :placeholder="`Filter by ${title}`"
              />
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
      <!-- scan -->
      <v-btn
        icon
        id="c-gscan-scan-tooltip-btn"
        variant="text"
        size="small"
        data-cy="gscan-scan-btn"
        @click="scanFilesystem()"
      >
        <v-icon size="x-large">
          {{ $options.icons.mdiFolderRefresh }}
        </v-icon>
        <v-tooltip text="Refresh workflows list" />
      </v-btn>
    </div>
    <!-- data -->
    <v-progress-linear
      v-if="isLoading"
      indeterminate
    />
    <div
      v-else
      class="c-gscan-workflows flex-grow-1 pl-2"
    >
      <v-defaults-provider :defaults="{
        VTooltip: {
          location: 'top',
          openDelay: 400,
          eager: false,
        }
      }">
        <Tree
          :workflows="workflows"
          :node-filter-func="filterNode"
          tree-item-component="GScanTreeItem"
          class="c-gscan-workflow"
          ref="tree"
          v-bind="{ filterState }"
        />
      </v-defaults-provider>
    </div>
    <!-- when no workflows are returned in the GraphQL query -->
    <div v-if="!workflows.length">
      <v-list-item>
        <v-list-item-title class="text-grey">
          No workflows found
        </v-list-item-title>
      </v-list-item>
    </div>
  </div>
</template>

<script>
import { mdiFilter, mdiFolderRefresh } from '@mdi/js'
import { TaskStateNames } from '@/model/TaskState.model'
import { WorkflowStateNames } from '@/model/WorkflowState.model'
import Tree from '@/components/cylc/tree/Tree.vue'
import { filterByName, filterByState } from '@/components/cylc/gscan/filters'
import { sortedWorkflowTree } from '@/components/cylc/gscan/sort.js'
import { mutate } from '@/utils/aotf'
import TaskFilterSelect from '@/components/cylc/TaskFilterSelect.vue'

export default {
  name: 'GScan',

  components: {
    Tree,
    TaskFilterSelect
  },

  props: {
    workflowTree: {
      type: Object,
      required: true
    },
    isLoading: {
      type: Boolean,
      required: true
    }
  },

  data: () => ({
    /**
     * Value to search and filter workflows.
     * @type {string}
     */
    searchWorkflows: '',
    /**
     * List of filters selected by the user.
     * @type {{ [name: string]: string[] }}
     */
    filters: {
      'workflow state': [],
      'task state': []
      // 'workflow host': [], // TODO: will it be in state totals?
      // 'cylc version': [] // TODO: will it be in state totals?
    },
  }),

  computed: {
    workflows () {
      if (!this.workflowTree?.children.length) {
        // no user in the data store (i.e. data loading)
        return []
      }
      return sortedWorkflowTree(this.workflowTree)
    },

    numFilters () {
      return Object.values(this.filters).flat().length
    },

    filterState () {
      return (this.searchWorkflows?.trim() || this.numFilters)
        ? [this.searchWorkflows, this.filters]
        : null
    },
  },

  methods: {
    scanFilesystem () {
      mutate({ name: 'scan', args: [] }, {}, this.$workflowService.apolloClient)
    },

    /**
     * Recursively filter this node and its children.
     *
     * @param {Object} node
     * @param {WeakMap<Object, boolean>} filteredOutNodesCache - cache of nodes' filtered status
     * @param {boolean} parentsNameMatch - whether any parents of this node
     * match the name filter.
     * @return {boolean} - whether this node matches the filter.
     */
    filterNode (node, filteredOutNodesCache, parentsNameMatch = false) {
      const nameMatch = parentsNameMatch || filterByName(node, this.searchWorkflows)
      let isMatch = false
      if (node.type === 'workflow') {
        isMatch = nameMatch && filterByState(
          node,
          this.filters['workflow state'],
          this.filters['task state']
        )
      } else if (node.type === 'workflow-part' && node.children.length) {
        for (const child of node.children) {
          isMatch = this.filterNode(child, filteredOutNodesCache, nameMatch) || isMatch
          // Note: do not break early as we must run the filter over all children
        }
      }

      filteredOutNodesCache.set(node, !isMatch)
      return isMatch
    },
  },

  // Misc options
  icons: {
    mdiFilter,
    mdiFolderRefresh
  },
  /**
   * Lists of all the possible workflow and task states
   * @type {{ [name: string]: string[] }}
   */
  allStates: {
    'workflow state': WorkflowStateNames,
    'task state': TaskStateNames,
  },
}
</script>
