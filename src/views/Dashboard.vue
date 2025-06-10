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
      <v-col md="4" lg="3">
        <p class="text-h4 mb-2">Workflows</p>
        <v-data-table
          :headers="$options.workflowsHeader"
          :items="workflowsTable"
          :loading="isLoading"
          id="dashboard-workflows"
          items-per-page="-1"
          style="font-size: 1rem;"
          density="compact"
        >
          <!-- Hide header & footer: -->
          <template v-slot:headers></template>
          <template v-slot:bottom></template>
        </v-data-table>
      </v-col>
      <v-col md="8" lg="9">
        <p class="text-h4 mb-2">Events</p>
        <v-data-table
          :headers="$options.eventsHeader"
          :items="events"
          :items-per-page="8"
          density="compact"
          data-cy="events-table"
        >
          <!-- Hide header: -->
          <template v-slot:headers></template>

          <!-- Hide footer if no events: -->
          <template v-if="!events.length" v-slot:bottom></template>

          <!-- Special template if there are no events to display -->
          <template v-slot:no-data>
            <td class="text-h6 text-disabled">No events</td>
          </template>

          <template v-slot:item.level="{ item }">
            <EventChip :level="item.level" />
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-divider />
    <v-row wrap>
      <v-col md="6" lg="6">
        <v-list lines="three" class="pa-0">
          <v-list-item to="/workflow-table" data-cy="workflow-table-link">
            <template v-slot:prepend>
              <v-icon size="1.6em">{{ $options.icons.table }}</v-icon>
            </template>
            <v-list-item-title class="text-h6 font-weight-light">
              Workflows Table
            </v-list-item-title>
            <v-list-item-subtitle>
              View name, host, version, etc. of your workflows
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item to="/user-profile" data-cy="user-settings-link">
            <template v-slot:prepend>
              <v-icon size="1.6em">{{ $options.icons.settings }}</v-icon>
            </template>
            <v-list-item-title class="text-h6 font-weight-light">
              Settings
            </v-list-item-title>
            <v-list-item-subtitle>
              View your Hub permissions, and alter user preferences
            </v-list-item-subtitle>
          </v-list-item>
          <div>
            <v-list-item id="cylc-hub-button" :disabled=!multiUserMode :href="$options.hubUrl">
              <template v-slot:prepend>
                <v-icon size="1.6em">{{ $options.icons.hub }}</v-icon>
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
          <div>
            <v-list-item
              id="jupyter-lab-button"
              :disabled="!user.extensions?.lab"
              :href="user.extensions?.lab"
              target="_blank"
            >
              <template v-slot:prepend>
                <v-icon size="1.6em">{{ $options.icons.jupyterLogo }}</v-icon>
              </template>
              <v-list-item-title class="text-h6 font-weight-light">
                Jupyter Lab
              </v-list-item-title>
              <v-list-item-subtitle>
                Open Jupyter Lab in a new browser tab.
              </v-list-item-subtitle>
            </v-list-item>
            <v-tooltip :disabled="user.extensions?.lab">
              Jupyter Lab is not installed.
            </v-tooltip>
          </div>
        </v-list>
      </v-col>
      <v-col md="6" lg="6">
        <v-list lines="three" class="pa-0">
          <v-list-item to="/guide" data-cy="quickstart-link">
            <template v-slot:prepend>
              <v-icon size="1.6em">{{ $options.icons.quickstart }}</v-icon>
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
              <v-icon size="1.6em">{{ $options.icons.workflow }}</v-icon>
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
              <v-icon size="1.6em">{{ $options.icons.documentation }}</v-icon>
            </template>
            <v-list-item-title class="text-h6 font-weight-light">
              Documentation
            </v-list-item-title>
            <v-list-item-subtitle>
              The complete Cylc documentation
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item
            to="/graphiql"
          >
            <template v-slot:prepend>
              <v-icon size="1.6em">{{ $options.icons.mdiGraphql }}</v-icon>
            </template>
            <v-list-item-title class="text-h6 font-weight-light">
             GraphiQL
            </v-list-item-title>
            <v-list-item-subtitle>
              Explore the Cylc GraphQL API
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import {
  mdiBook,
  mdiBookMultiple,
  mdiBookOpenVariant,
  mdiCog,
  mdiHubspot,
  mdiTable,
  mdiGraphql,
} from '@mdi/js'
import { jupyterLogo } from '@/utils/icons'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import { createUrl } from '@/utils/urls'
import { WorkflowState, WorkflowStateOrder } from '@/model/WorkflowState.model'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import gql from 'graphql-tag'
import EventChip from '@/components/cylc/EventChip.vue'

const QUERY = gql`
subscription App {
  deltas {
    id
    added {
      ...AddedDelta
    }
    updated (stripNull: true) {
      ...UpdatedDelta
    }
    pruned {
      workflow
    }
  }
}

fragment AddedDelta on Added {
  workflow {
    ...WorkflowData
  }
}

fragment UpdatedDelta on Updated {
  workflow {
    ...WorkflowData
  }
}

fragment WorkflowData on Workflow {
  # NOTE: do not request the "reloaded" event here
  # (it would cause a race condition with the workflow subscription)
  id
  status
}
`

export default {
  name: 'Dashboard',

  mixins: [
    subscriptionComponentMixin
  ],

  components: {
    EventChip,
  },

  data () {
    return {
      query: new SubscriptionQuery(
        QUERY,
        {},
        'root',
        [],
        /* isDelta */ true,
        /* isGlobalCallback */ true
      ),
    }
  },

  computed: {
    ...mapState('user', ['user']),
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
    },
    events () {
      const events = []
      for (const workflow of this.workflows) {
        const logRecords = workflow.node?.logRecords || []
        for (const record of logRecords) {
          events.push({ workflow: workflow.tokens.workflow, ...record })
        }
      }
      return events.reverse()
    }
  },

  workflowsHeader: [
    { value: 'count' },
    { value: 'text' }
  ],

  eventsHeader: [
    { value: 'level' },
    { value: 'workflow' },
    { value: 'message' }
  ],

  hubUrl: createUrl('/hub/home', false, true),

  icons: {
    table: mdiTable,
    settings: mdiCog,
    hub: mdiHubspot,
    quickstart: mdiBook,
    workflow: mdiBookOpenVariant,
    documentation: mdiBookMultiple,
    jupyterLogo,
    mdiGraphql,
  },
}
</script>
