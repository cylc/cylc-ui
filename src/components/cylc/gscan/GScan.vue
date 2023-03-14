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
    class="c-gscan h-100"
  >
    <v-skeleton-loader
      :loading="isLoading"
      type="list-item-three-line"
      class=" d-flex flex-column h-100"
    >
      <!-- filters -->
      <div class="d-flex flex-row mx-4 mb-2 flex-grow-0">
        <v-text-field
          v-model="searchWorkflows"
          clearable
          :clear-icon="$options.icons.mdiClose"
          flat
          dense
          hide-details
          outlined
          placeholder="Search"
          class="flex-grow-1 flex-column"
          id="c-gscan-search-workflows"
        />
        <v-menu
          v-model="showFilterMenu"
          :close-on-content-click="false"
          offset-x
        >
          <!-- button to activate the filters menu -->
          <template v-slot:activator="{ on, attrs }">
            <v-badge
              :content="numFilters"
              :value="numFilters"
              overlap
            >
              <v-btn
                v-bind="attrs"
                v-on="on"
                link
                icon
                id="c-gscan-filter-menu-btn"
                @click="showFilterMenu = !showFilterMenu"
              >
                <v-icon>{{ $options.icons.mdiFilter }}</v-icon>
              </v-btn>
            </v-badge>
          </template>
          <!-- filters menu -->
          <v-card width="500px">
            <v-list dense>
              <div
                v-for="(items, title) in filters"
                :key="title"
              >
                <v-list-item>
                  <v-list-item-content ma-0>
                    <span class="mb-2">Filter by {{ title }}</span>
                    <v-autocomplete
                      v-model="filters[title]"
                      :items="$options.allStates[title]"
                      outlined
                      chips
                      deletable-chips
                      small-chips
                      clearable
                      multiple
                      dense
                      hide-details
                      :menu-props="{ closeOnClick: true }"
                      :clear-icon="$options.icons.mdiClose"
                      :data-cy="`filter ${title}`"
                    />
                  </v-list-item-content>
                </v-list-item>
              </div>
            </v-list>
          </v-card>
        </v-menu>
      </div>
      <!-- data -->
      <div
        v-if="!isLoading"
        class="c-gscan-workflows flex-grow-1 pl-2"
      >
        <tree
          :filterable="false"
          :expand-collapse-toggle="false"
          :auto-collapse="true"
          :workflows="workflows"
          :stopOn="['workflow']"
          :autoExpandTypes="['workflow-part', 'workflow']"
          class="c-gscan-workflow ma-0 pa-0"
          ref="tree"
        >
          <template v-slot:node="{node, latestDescendantTasks, lastDescendent, descendentLabel, branchingLineage, expansionStatus}">
            <workflow-icon
              class="mr-2"
              v-if="lastDescendent.type === 'workflow' && !branchingLineage"
              :status="lastDescendent.node.status"
              v-cylc-object="lastDescendent"
            />
            <v-list-item
              :to="workflowLink(node)"
            >
              <v-list-item-title>
                <v-row class="align-center align-content-center flex-nowrap">
                  <v-col
                    v-if="node.type === 'workflow-part'"
                    class="c-gscan-workflow-name"
                  >
                    <span>{{ !expansionStatus ? descendentLabel : (node.name || node.id) }}</span>
                  </v-col>
                  <v-col
                    v-else-if="node.type === 'workflow'"
                    class="c-gscan-workflow-name"
                  >
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <span v-on="on">{{ node.name }}</span>
                      </template>
                      <span>{{ node.id }}</span>
                    </v-tooltip>
                  </v-col>
                  <!-- We check the latestStateTasks below as offline workflows won't have a latestStateTasks property -->
                  <v-col
                    v-if="(!branchingLineage && (lastDescendent.type === 'workflow' && lastDescendent.node.latestStateTasks) && !expansionStatus) || (!expansionStatus && branchingLineage)"
                    class="text-right c-gscan-workflow-states"
                  >
                    <!-- task summary tooltips -->
                    <span
                      v-for="[state, tasks] in getLatestStateTasks(Object.entries(latestDescendantTasks))"
                      :key="`${node.id}-summary-${state}`"
                      :class="getTaskStateClasses(latestDescendantTasks, state)"
                    >
                    <v-tooltip color="black" top>
                      <template v-slot:activator="{ on }">
                        <!-- a v-tooltip does not work directly set on Cylc job component, so we use a dummy button to wrap it -->
                        <!-- NB: most of the classes/directives in these button are applied so that the user does not notice it is a button -->
                        <v-btn
                          v-on="on"
                          class="ma-0 pa-0"
                          min-width="0"
                          min-height="0"
                          style="font-size: 120%; width: auto"
                          :ripple="false"
                          dark
                          icon
                        >
                          <job :status="state" />
                        </v-btn>
                      </template>
                      <!-- tooltip text -->
                      <span>
                        <span class="grey--text">{{ countTasksInState(latestDescendantTasks, state) }} {{ state }}. Recent {{ state }} tasks:</span>
                        <br/>
                        <span v-for="(task, index) in tasks.slice(0, maximumTasksDisplayed)" :key="index">
                          {{ task }}<br v-if="index !== tasks.length -1" />
                        </span>
                      </span>
                    </v-tooltip>
                  </span>
                  </v-col>
                </v-row>
              </v-list-item-title>
            </v-list-item>
          </template>
        </tree>
      </div>
      <!-- when no workflows are returned in the GraphQL query -->
      <div v-else>
        <v-list-item>
          <v-list-item-title class="grey--text">No workflows found</v-list-item-title>
        </v-list-item>
      </div>
    </v-skeleton-loader>
  </div>
</template>

<script>
import { mdiClose, mdiFilter } from '@mdi/js'
import TaskState, { TaskStateUserOrder } from '@/model/TaskState.model'
import { WorkflowState } from '@/model/WorkflowState.model'
import Job from '@/components/cylc/Job'
import Tree from '@/components/cylc/tree/Tree'
import WorkflowIcon from '@/components/cylc/gscan/WorkflowIcon'
import { filterHierarchically } from '@/components/cylc/gscan/filters'
import { sortedWorkflowTree } from '@/components/cylc/gscan/sort.js'

export default {
  name: 'GScan',

  components: {
    Job,
    Tree,
    WorkflowIcon
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
      maximumTasksDisplayed: 5,
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
       * Whether the filters menu is displayed (i.e. v-model=this).
       * @type {boolean}
       */
      showFilterMenu: false,
      /**
       * List of filters selected by the user.
       * @type {{string: string[]}}
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
      immediate: false,
      handler: 'filterWorkflows'
    },
    workflows: {
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

    workflowLink (node) {
      if (node.type === 'workflow') {
        return `/workspace/${ node.tokens.workflow }`
      }
      return ''
    },

    /**
     * Get number of tasks we have in a given state. The states are retrieved
     * from `latestStateTasks`, and the number of tasks in each state is from
     * the `stateTotals`. (`latestStateTasks` includes old tasks).
     *
     * @param {WorkflowGraphQLData} workflow - the workflow object retrieved from GraphQL
     * @param {string} state - a workflow state
     * @returns {number|*} - the number of tasks in the given state
     */
    countTasksInState (latestStateTasks, state) {
      if (Object.hasOwnProperty.call(latestStateTasks, state)) {
        return latestStateTasks[state].length
      }
      return 0
    },

    getTaskStateClasses (latestStateTasks, state) {
      const tasksInState = this.countTasksInState(latestStateTasks, state)
      return tasksInState === 0 ? ['empty-state'] : []
    },

    // TODO: temporary filter, remove after b0 - https://github.com/cylc/cylc-ui/pull/617#issuecomment-805343847
    getLatestStateTasks (latestStateTasks) {
      // Values found in: https://github.com/cylc/cylc-flow/blob/9c542f9f3082d3c3d9839cf4330c41cfb2738ba1/cylc/flow/data_store_mgr.py#L143-L149
      const validValues = [
        TaskState.SUBMITTED.name,
        TaskState.SUBMIT_FAILED.name,
        TaskState.RUNNING.name,
        TaskState.SUCCEEDED.name,
        TaskState.FAILED.name
      ]
      return latestStateTasks.filter(entry => {
        return validValues.includes(entry[0])
      })
    }
  },

  // Misc options
  icons: {
    mdiClose,
    mdiFilter
  },
  /**
   * Lists of all the possible workflow and task states
   * @type {{string: string[]}}
   */
  allStates: {
    'workflow state': WorkflowState.enumValues.map(x => x.name),
    'task state': TaskStateUserOrder.map(x => x.name)
  }
}
</script>
