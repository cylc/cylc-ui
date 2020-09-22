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
    <div
      v-if="workflows && workflows.length > 0"
      class="c-gscan-workflows"
    >
      <div
        v-for="workflow in sortedWorkflows"
        :key="workflow.id"
        class="c-gscan-workflow"
      >
        <v-list-item
          :to="`/workflows/${ workflow.name }`"
          :class="getWorkflowClass(workflow.status)"
        >
          <v-list-item-action>
            <v-icon>{{ getWorkflowIcon(workflow.status) }}</v-icon>
          </v-list-item-action>
          <v-list-item-title>
            <v-layout align-center align-content-center wrap>
              <v-flex grow>{{ workflow.name }}</v-flex>
              <v-flex shrink ml-4>
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
  </div>
</template>

<script>
import Job from '@/components/cylc/Job'
import { getWorkflowSummary } from '@/components/cylc/gscan/index'
import { GSCAN_QUERY } from '@/graphql/queries'
import { mdiPlayCircle, mdiPauseOctagon, mdiHelpCircle } from '@mdi/js'

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
      svgPaths: {
        running: mdiPlayCircle,
        held: mdiPauseOctagon,
        unknown: mdiHelpCircle
      }
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
          if (left.status === 'stopped') {
            return 1
          }
          if (right.status === 'stopped') {
            return -1
          }
        }
        return left.name.toLowerCase()
          .localeCompare(
            right.name.toLowerCase(),
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
      switch (status) {
      case 'running':
        return this.svgPaths.running
      case 'held':
        return this.svgPaths.held
      default:
        return this.svgPaths.unknown
      }
    },

    getWorkflowClass (status) {
      return {
        // TODO: replace by constant or enum later (not TaskState as that doesn't have stopped, maybe WorkflowState?)
        'c-workflow-stopped': status === 'stopped'
      }
    }
  }
}
</script>
