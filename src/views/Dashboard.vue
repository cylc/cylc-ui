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
  <v-container
    fluid
    grid-list
    class="c-dashboard mt-4 py-0 px-6"
  >
    <v-row wrap>
      <v-col md="6" lg="6">
        <p class="text-h4 mb-2">Workflows</p>
        <v-data-table
          :headers="workflowsHeader"
          :items="workflowsTable"
          :loading="isLoading"
          id="dashboard-workflows"
          items-per-page="-1"
        >
          <!-- Hide header & footer: -->
          <template v-slot:headers></template>
          <template v-slot:bottom></template>
        </v-data-table>
      </v-col>
      <v-col md="6" lg="6">
        <p class="text-h4 mb-2">Events</p>
        <v-data-table
          :headers="eventsHeader"
          :items="events"
        >
          <!-- Hide header: -->
          <template v-slot:headers></template>
          <template v-slot:no-data>
            <td class="text-h6 text-disabled">No events</td>
          </template>
          <!-- Hide footer if no events: -->
          <template v-if="!events.length" v-slot:bottom></template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-divider />
    <v-row wrap>
      <v-col md="6" lg="6">
        <v-list lines="three" class="pa-0">
          <v-list-item to="/workflow-table" data-cy="workflow-table-link">
            <template v-slot:prepend>
              <v-icon size="1.6em">{{ svgPaths.table }}</v-icon>
            </template>
            <v-list-item-title class="text-h6 font-weight-light">
              Workflows Table
            </v-list-item-title>
            <v-list-item-subtitle>
              View name, host, port, etc. of your workflows
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item to="/user-profile" data-cy="user-settings-link">
            <template v-slot:prepend>
              <v-icon size="1.6em">{{ svgPaths.settings }}</v-icon>
            </template>
            <v-list-item-title class="text-h6 font-weight-light">
              Settings
            </v-list-item-title>
            <v-list-item-subtitle>
              View your Hub permissions, and alter user preferences
            </v-list-item-subtitle>
          </v-list-item>
          <div>
            <v-list-item id="cylc-hub-button" :disabled=!multiUserMode :href=hubUrl>
              <template v-slot:prepend>
                <v-icon size="1.6em">{{ svgPaths.hub }}</v-icon>
              </template>
              <v-list-item-title class="text-h6 font-weight-light">
                Cylc Hub
              </v-list-item-title>
              <v-list-item-subtitle>
                Visit the Hub to manage your running UI Servers
              </v-list-item-subtitle>
            </v-list-item>
            <v-tooltip :disabled="multiUserMode">
              You are not running Cylc UI via Cylc Hub.
            </v-tooltip>
          </div>
        </v-list>
      </v-col>
      <v-col md="6" lg="6">
        <v-list lines="three" class="pa-0">
          <v-list-item to="/guide" data-cy="quickstart-link">
            <template v-slot:prepend>
              <v-icon size="1.6em">{{ svgPaths.quickstart }}</v-icon>
            </template>
            <v-list-item-title class="text-h6 font-weight-light">
              Cylc UI Quickstart
            </v-list-item-title>
            <v-list-item-subtitle>
              Learn how to use the Cylc UI
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item href="https://cylc.github.io/cylc-doc/stable/html/workflow-design-guide/index.html" target="_blank">
            <template v-slot:prepend>
              <v-icon size="1.6em">{{ svgPaths.workflow }}</v-icon>
            </template>
            <v-list-item-title class="text-h6 font-weight-light">
              Workflow Design Guide
            </v-list-item-title>
            <v-list-item-subtitle>
              How to make complex Cylc workflows and Rose suites simpler and easier to maintain
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item href="https://cylc.github.io/cylc-doc/stable/html/index.html" target="_blank">
            <template v-slot:prepend>
              <v-icon size="1.6em">{{ svgPaths.documentation }}</v-icon>
            </template>
            <v-list-item-title class="text-h6 font-weight-light">
              Documentation
            </v-list-item-title>
            <v-list-item-subtitle>
              The complete Cylc documentation
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { mdiBook, mdiBookMultiple, mdiBookOpenVariant, mdiCog, mdiHubspot, mdiTable } from '@mdi/js'
import { getPageTitle } from '@/utils/index'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import { createUrl } from '@/utils/urls'
import { WorkflowState, WorkflowStateOrder } from '@/model/WorkflowState.model'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import { DASHBOARD_DELTAS_SUBSCRIPTION } from '@/graphql/queries'

export default {
  name: 'Dashboard',

  mixins: [
    subscriptionComponentMixin
  ],

  head () {
    return {
      title: getPageTitle('App.dashboard')
    }
  },

  data () {
    return {
      query: new SubscriptionQuery(
        DASHBOARD_DELTAS_SUBSCRIPTION,
        {},
        'root',
        [],
        /* isDelta */ true,
        /* isGlobalCallback */ true
      ),
      workflowsHeader: [
        { value: 'count' },
        { value: 'text' }
      ],
      eventsHeader: [
        { value: 'id' },
        { value: 'text' }
      ],
      events: [],
      svgPaths: {
        table: mdiTable,
        settings: mdiCog,
        hub: mdiHubspot,
        quickstart: mdiBook,
        workflow: mdiBookOpenVariant,
        documentation: mdiBookMultiple
      },
      hubUrl: createUrl('/hub/home', false, true)
    }
  },

  computed: {
    ...mapState('user', ['user']),
    ...mapState('workflows', ['cylcTree']),
    ...mapGetters('workflows', ['getNodes']),
    workflows () {
      return this.getNodes('workflow')
    },
    workflowsTable () {
      const count = Object.values(this.workflows)
        .map(workflow => workflow.node.status)
        .reduce((acc, state) => {
          acc[state] = (acc[state] || 0) + 1
          return acc
        }, {})
      return WorkflowState.enumValues
        .sort((left, right) => WorkflowStateOrder.get(left) - WorkflowStateOrder.get(right))
        .map(state => {
          return {
            text: state.name.charAt(0).toUpperCase() + state.name.slice(1),
            count: count[state.name] || 0
          }
        })
    },
    multiUserMode () {
      return this.user.mode !== 'single user'
    }
  }
}
</script>
