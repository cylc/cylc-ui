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
    <!-- TODO: replace v-progress-linear with v-skeleton-loader when
    the latter is added to Vuetify 3.
    https://github.com/cylc/cylc-ui/issues/1272 -->
    <!-- <v-skeleton-loader
      :loading="isLoading"
      type="list-item-three-line"
      class=" d-flex flex-column h-100"
    > -->
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
            <v-icon size="x-large">{{ $options.icons.mdiFilter }}</v-icon>
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
                <v-select
                  v-model="filters[title]"
                  :items="$options.allStates[title]"
                  :label="`Filter by ${title}`"
                  density="default"
                  chips
                  closable-chips
                  clearable
                  multiple
                  class="my-2"
                  :data-cy="`filter ${title}`"
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
          <v-icon size="x-large">{{ $options.icons.mdiFolderRefresh }}</v-icon>
          <v-tooltip text="Refresh workflows list" />
        </v-btn>
      </div>
      <!-- data -->
      <v-progress-linear
        v-if="isLoading"
        indeterminate
      />
      <div
        v-if="!isLoading"
        class="c-gscan-workflows flex-grow-1 pl-2"
      >
        <Tree
          :filterable="false"
          :expand-collapse-toggle="false"
          :auto-collapse="true"
          :workflows="workflows"
          tree-item-component="GScanTreeItem"
          class="c-gscan-workflow ma-0 pa-0"
          ref="tree"
        />
      </div>
      <!-- when no workflows are returned in the GraphQL query -->
      <div v-else>
        <v-list-item>
          <v-list-item-title class="text-grey">No workflows found</v-list-item-title>
        </v-list-item>
      </div>
    <!-- </v-skeleton-loader> -->
  </div>
</template>

<script>
import { mdiFilter, mdiFolderRefresh } from '@mdi/js'
import { TaskStateUserOrder } from '@/model/TaskState.model'
import { WorkflowState } from '@/model/WorkflowState.model'
import Tree from '@/components/cylc/tree/Tree.vue'
import { filterHierarchically } from '@/components/cylc/gscan/filters'
import { sortedWorkflowTree } from '@/components/cylc/gscan/sort.js'
import { mutate } from '@/utils/aotf'

export default {
  name: 'GScan',

  components: {
    Tree,
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

  data () {
    return {
      /**
       * The filtered workflows. This is the result of applying the filters
       * on the workflows prop.
       * @type {Array<WorkflowGraphQLData>}
       */
      filteredWorkflows: [],
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
      }
    }
  },
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
    }
  },
  watch: {
    /**
     * If the user changes the list of filters, then we apply
     * the filters to the list of workflows.
     */
    filters: {
      deep: true,
      immediate: false,
      handler: 'filterWorkflows'
    },
    /**
     * If the user changes the workflow name to search/filter,
     * then we apply the filters to the list of workflows.
     */
    searchWorkflows: {
      deep: true,
      immediate: false,
      handler: 'filterWorkflows'
    },
    workflows: {
      deep: true,
      immediate: true,
      handler: 'filterWorkflows'
    },
    filteredWorkflows: {
      immediate: true,
      handler: function () {
        // build a list of IDs to display
        // TODO: refactor the this.filterHierarchically code to make this nicer
        const ids = []
        const stack = [...this.filteredWorkflows]
        let item
        while (stack.length) {
          // item = stack.splice(-1)[0]
          item = stack.pop()
          if (['workflow', 'workflow-part'].includes(item.type)) {
            ids.push(item.id)
            stack.push(...item.children)
          }
        }
        // set the filtered attr on the treeItemCache of the tree nodes
        if (!this.$refs.tree) {
          // tree component has not been created yet
          return
        }
        const cache = this.$refs.tree.treeItemCache
        for (const id in cache) {
          cache[id].filtered = ids.includes(id)
        }
      }
    }
  },
  methods: {

    scanFilesystem () {
      mutate({ name: 'scan', args: [] }, {}, this.$workflowService.apolloClient)
    },

    filterWorkflows () {
      this.filteredWorkflows = filterHierarchically(
        this.workflows,
        this.searchWorkflows,
        this.filters['workflow state'],
        this.filters['task state']
      )
    },

    /**
     * Return `true` iff all the items have been selected. `false` otherwise.
     *
     * @param {[
     *   {
     *     model: boolean
     *   }
     * ]} items - filter items
     * @returns {boolean} - `true` iff all the items have been selected. `false` otherwise
     */
    allItemsSelected (items) {
      return items.every(item => item.model === true)
    },

    /**
     * If every element in the list is `true`, then we will set every element in the
     * list to `false`. Otherwise, we set all the elements in the list to `true`.
     * @param {[
     *   {
     *     model: boolean
     *   }
     * ]} items - filter items
     */
    toggleItemsValues (items) {
      const newValue = !this.allItemsSelected(items)
      items.forEach(item => {
        item.model = newValue
      })
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
    'workflow state': WorkflowState.enumValues.map(x => x.name),
    'task state': TaskStateUserOrder.map(x => x.name)
  },
  maxTasksDisplayed: 5,
}
</script>
