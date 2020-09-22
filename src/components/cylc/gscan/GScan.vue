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
    <v-skeleton-loader
      :loading="isLoading"
      type="list-item-three-line"
    >
      <div
        class="d-flex flex-row mx-4 mb-2"
      >
        <v-text-field
          v-model="searchWorkflows"
          clearable
          flat
          dense
          hide-details
          outlined
          placeholder="Search"
          class="flex-grow-1 flex-column"
        />
        <v-menu
          v-model="showFilterTooltip"
          :close-on-content-click="false"
          offset-x
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              link
              icon
              class="flex-grow-0 flex-column"
              @click="showFilterTooltip = !showFilterTooltip"
            >
              <v-icon>mdi-filter</v-icon>
            </v-btn>
          </template>
          <v-card
            max-height="250px"
          >
            <v-list
              dense
            >
              <div
                v-for="filter in filters"
                :key="filter.title"
              >
                <v-list-item dense>
                  <v-list-item-content ma-0>
                    <v-list-item-title>{{ filter.title }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider />
                <v-list-item
                  v-for="item in filter.items"
                  :key="`${filter.title}-${item.text}`"
                  dense
                >
                  <v-list-item-action>
                    <v-checkbox
                      :label="item.text"
                      v-model="item.model"
                      dense
                      height="20"
                    ></v-checkbox>
                  </v-list-item-action>
                </v-list-item>
              </div>
            </v-list>
          </v-card>
        </v-menu>
      </div>
      <div
        v-if="!isLoading && filteredWorkflows && filteredWorkflows.length > 0"
        class="c-gscan-workflows"
      >
        <div
          v-for="workflow in filteredWorkflows"
          :key="workflow.id"
          class="c-gscan-workflow"
        >
          <v-list-item
            :to="`/workflows/${ workflow.name }`"
            :class="getWorkflowClass(workflow.status)"
          >
            <v-list-item-action>
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{ getWorkflowIcon(workflow.status) }}
                  </v-icon>
                </template>
                <span>{{ workflow.status }}</span>
              </v-tooltip>
            </v-list-item-action>
            <v-list-item-title>
              <v-layout align-center align-content-center nowrap>
                <v-flex class="c-gscan-workflow-name">{{ workflow.name }}</v-flex>
                <v-flex shrink>
                  <!-- task summary tooltips -->
                  <span
                    v-for="[state, tasks] in workflowsSummaries.get(workflow.name).entries()"
                    :key="`${workflow.name}-summary-${state}`"
                  >
                    <v-tooltip color="black" top>
                      <template v-slot:activator="{ on }">
                        <!-- a v-tooltip does not work directly set on Cylc job component, so we use a dummy button to wrap it -->
                        <!-- NB: most of the classes/directives in these button are applied so that the user does not notice it is a button -->
                        <v-btn
                          v-on="on"
                          class="mt-1 pa-0"
                          min-width="0"
                          min-height="0"
                          style="font-size: 120%"
                          :ripple="false"
                          small
                          dark
                          text
                        >
                          <job :status="state" />
                        </v-btn>
                      </template>
                      <!-- tooltip text -->
                      <span>
                        <span class="grey--text">Recent {{ state }} tasks:</span>
                        <br/>
                        <span v-for="(task, index) in tasks.slice(0, maximumTasksDisplayed)" :key="index">
                          {{ task }}<br v-if="index !== tasks.length -1" />
                        </span>
                        <span v-if="tasks.length > maximumTasksDisplayed" class="font-italic">And {{ tasks.length - maximumTasksDisplayed }} more</span>
                      </span>
                    </v-tooltip>
                  </span>
                </v-flex>
              </v-layout>
            </v-list-item-title>
          </v-list-item>
        </div>
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
import Job from '@/components/cylc/Job'
import { getWorkflowSummary } from '@/components/cylc/gscan/index'
import { GSCAN_QUERY } from '@/graphql/queries'
import WorkflowState from '@/model/WorkflowState.model'
import TaskState from '@/model/TaskState.model'

const QUERIES = {
  root: GSCAN_QUERY
}

export default {
  name: 'GScan',
  components: {
    job: Job
  },
  props: {
    /**
     * Vanilla workflows object from GraphQL query
     * @type {{}|null}
     */
    workflows: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      viewID: '',
      subscriptions: {},
      isLoading: true,
      maximumTasksDisplayed: 5,
      /**
       * The filtered workflows. This is the result of applying the filters
       * on the workflows prop.
       * @type {[
       *   {
       *     id: string,
       *     name: string,
       *     stateTotals: object,
       *     status: string
       *   }
       * ]}
       */
      filteredWorkflows: [],
      /**
       * Value to search and filter workflows.
       * @type {string}
       */
      searchWorkflows: '',
      /**
       * Variable to control whether the filters tooltip (a menu actually)
       * is displayed or not (i.e. v-model=this).
       * @type {boolean}
       */
      showFilterTooltip: false,
      /**
       * List of filters to be displayed by the template, so that the user
       * can filter the list of workflows.
       *
       * Each entry contains a title and a list of items. Each item contains
       * the text attribute, which is used as display value in the template.
       * The value attribute, which may be used if necessary, as it contains
       * the original value (e.g. an Enum, while title would be some formatted
       * string). Finally, the model is bound via v-model, and keeps the
       * value selected in the UI (i.e. if the user checks the "running"
       * checkbox, the model here will be true, if the user unchecks it,
       * then it will be false).
       *
       * @type {[
       *   {
       *     title: string,
       *     items: [{
       *       text: string,
       *       value: object,
       *       model: boolean
       *     }]
       *   }
       * ]}
       */
      filters: [
        {
          title: 'workflow state',
          items: [
            {
              text: 'running',
              value: 'running',
              model: true
            },
            {
              text: 'held',
              value: 'held',
              model: true
            },
            {
              text: 'stopped',
              value: 'stopped',
              model: true
            }
          ]
        },
        {
          title: 'task state',
          items: TaskState.enumValues.map(state => {
            return {
              text: state.name.toLowerCase(),
              value: state,
              model: true
            }
          })
        }
        // {
        //   title: 'workflow host',
        //   items: [] // TODO: will it be in state totals?
        // },
        // {
        //   title: 'cylc version',
        //   items: [] // TODO: will it be in state totals?
        // }
      ]
    }
  },
  computed: {
    /**
     * Sort workflows by type first, showing running or held workflows first,
     * then stopped. Within each group, workflows are sorted alphabetically
     * (natural sort).
     */
    sortedWorkflows () {
      return [...this.workflows].sort((left, right) => {
        if (left.status !== right.status) {
          if (left.status === WorkflowState.STOPPED.name) {
            return 1
          }
          if (right.status === WorkflowState.STOPPED.name) {
            return -1
          }
        }
        return left.name
          .localeCompare(
            right.name,
            undefined,
            { numeric: true, sensitivity: 'base' })
      })
    },
    /**
     * Compute summary information, where the key is the name of a workflow, the value is another map with the summary.
     * @returns {Map<String, Map>}
     */
    workflowsSummaries () {
      const workflowSummaries = new Map()
      // with async scan, the workflows list may be null or undefined
      // see cylc-uiserver PR#150
      if (this.workflows) {
        for (const workflow of this.workflows) {
          workflowSummaries.set(workflow.name, getWorkflowSummary(workflow))
        }
      }
      return workflowSummaries
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
      handler: function (newVal, _) {
        this.filterWorkflows(this.workflows, this.searchWorkflows, newVal)
      }
    },
    /**
     * If the user changes the workflow name to search/filter,
     * then we apply the filters to the list of workflows.
     */
    searchWorkflows: {
      immediate: false,
      handler: function (newVal, _) {
        this.filterWorkflows(this.workflows, newVal, this.filters)
      }
    },
    /**
     * If the subscription changes the workflows object (any part of it),
     * then we apply the filters to the list of workflows.
     */
    workflows: {
      deep: true,
      immediate: true,
      handler: function (newVal, _) {
        this.filterWorkflows(newVal, this.searchWorkflows, this.filters)
      }
    }
  },
  created () {
    this.viewID = `GScan(*): ${Math.random()}`
    this.$workflowService.register(
      this,
      {
        activeCallback: this.setActive
      }
    )
    this.subscribe('root')
  },
  beforeDestroy () {
    this.$workflowService.unregister(this)
  },
  methods: {
    subscribe (queryName) {
      /**
       * Subscribe this view to a new GraphQL query.
       * @param {string} queryName - Must be in QUERIES.
       */
      if (!(queryName in this.subscriptions)) {
        this.subscriptions[queryName] =
          this.$workflowService.subscribe(
            this,
            QUERIES[queryName]
          )
      }
    },

    unsubscribe (queryName) {
      /**
       * Unsubscribe this view to a new GraphQL query.
       * @param {string} queryName - Must be in QUERIES.
       */
      if (queryName in this.subscriptions) {
        this.$workflowService.unsubscribe(
          this.subscriptions[queryName]
        )
      }
    },

    setActive (isActive) {
      /** Toggle the isLoading state.
       * @param {bool} isActive - Are this views subs active.
       */
      this.isLoading = !isActive
    },

    getWorkflowIcon (status) {
      let wstatus = WorkflowState.enumValueOf(status.toUpperCase())
      if (!wstatus) {
        wstatus = WorkflowState.ERROR
      }
      return wstatus.icon
    },

    getWorkflowClass (status) {
      return {
        'c-workflow-stopped': status === WorkflowState.STOPPED.name
      }
    },

    /**
     * Filter a list of workflows using a given name (could be a part of
     * a name) and a given list of filters.
     *
     * The list of filters may contain workflow states ("running", "stopped",
     * "held"), and/or task states ("running", "waiting", "submit_failed", etc).
     *
     * Does not return any value, but modifies the data variable
     * filteredWorkflows, used in the template.
     *
     * @param {[
     *  {
     *   id: string,
     *   name: string,
     *   stateTotals: object,
     *   status: string
     *  }
     * ]} workflows list of workflows
     * @param {string} name
     * @param {[]} filters
     */
    filterWorkflows (workflows, name, filters) {
      // filter by name
      this.filteredWorkflows = workflows
      if (name && name !== '') {
        this.filteredWorkflows = this.filteredWorkflows
          .filter(workflow => workflow.name.includes(name))
      }
      // get a list of the workflow states we are filtering
      const workflowStates = filters[0]
        .items
        .filter(item => item.model)
        .map(item => item.value)
      // get a list of the task states we are filtering
      const taskStates = new Set(filters[1]
        .items
        .filter(item => item.model)
        .map(item => item.value.name.toLowerCase()))
      // filter workflows
      this.filteredWorkflows = this.filteredWorkflows.filter((workflow) => {
        // workflow states
        if (!workflowStates.includes(workflow.status)) {
          return false
        }
        // task states (but only if non-stopped, as otherwise stateTotals will be empty)
        if (workflow.status === 'running') {
          const thisWorkflowStates = Object.entries(workflow.stateTotals)
            .filter(entry => entry[1] > 0)
            .map(entry => entry[0])
          const intersection = thisWorkflowStates.filter(item => taskStates.has(item))
          return intersection.length !== 0
        }
        return true
      })
    }
  }
}
</script>
