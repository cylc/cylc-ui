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
    fill-height
    fluid
    grid-list-xl
  >
    <v-layout
      justify-center
      wrap
    >
      <v-flex md12>
        <v-alert
          :icon="svgPath.table"
          prominent
          color="grey lighten-3"
        >
          <h3 class="headline">{{ $t('Workflows.tableHeader') }}</h3>
        </v-alert>
        <v-data-table
          :headers="headers"
          :items="workflowsTable"
          :loading="isLoading"
        >
          <template
            slot="no-data"
            v-if="!isLoading"
          >
            <v-alert
              :value="true"
              color="error"
              icon="warning"
            >
              <p class="body-1">No workflows found for the current user</p>
            </v-alert>
          </template>
          <template
            slot="headerCell"
            slot-scope="{ header }"
          >
            <span
              class="subheading font-weight-light text-success text--darken-3"
              v-text="header.text"
            />
          </template>
          <v-progress-linear
            slot="progress"
            color="green"
            indeterminate
          ></v-progress-linear>
          <template
            slot="item"
            slot-scope="{ item }"
          >
            <tr>
              <td width="1em">
                <WorkflowIcon
                  :status="item.node.status"
                  v-cylc-object="item"
                />
              </td>
              <td
                style="cursor: pointer"
                @click="viewWorkflow(item)"
              >
                {{ item.tokens.workflow }}
              </td>
              <td
                style="cursor: pointer"
                @click="viewWorkflow(item)"
              >
                {{ item.node.status }}
              </td>
              <td
                style="cursor: pointer"
                @click="viewWorkflow(item)"
              >
                {{ item.node.owner }}
              </td>
              <td
                style="cursor: pointer"
                @click="viewWorkflow(item)"
              >
                {{ item.node.host }}
              </td>
              <td
                style="cursor: pointer"
                @click="viewWorkflow(item)"
              >
                {{ item.node.port }}
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import i18n from '@/i18n'
import { mdiTable } from '@mdi/js'
import pageMixin from '@/mixins/index'
import subscriptionViewMixin from '@/mixins/subscriptionView'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import { WORKFLOWS_TABLE_DELTAS_SUBSCRIPTION } from '@/graphql/queries'
import WorkflowIcon from '@/components/cylc/gscan/WorkflowIcon'

export default {
  name: 'WorkflowsTable',
  mixins: [pageMixin, subscriptionViewMixin],
  metaInfo() {
    return {
      title: this.getPageTitle('App.workflows'),
    }
  },
  components: {
    WorkflowIcon,
  },
  data: () => ({
    query: new SubscriptionQuery(
      WORKFLOWS_TABLE_DELTAS_SUBSCRIPTION,
      {},
      'root',
      []
    ),
    headers: [
      {
        sortable: false,
        text: '',
        value: 'icon',
      },
      {
        sortable: true,
        text: i18n.t('Workflows.tableColumnName'),
        value: 'name',
      },
      {
        sortable: true,
        text: 'Status',
        value: 'node.status',
      },
      {
        sortable: true,
        text: i18n.t('Workflows.tableColumnOwner'),
        value: 'node.owner',
      },
      {
        sortable: true,
        text: i18n.t('Workflows.tableColumnHost'),
        value: 'node.host',
      },
      {
        sortable: false,
        text: i18n.t('Workflows.tableColumnPort'),
        value: 'node.port',
      },
    ],
    svgPath: {
      table: mdiTable,
    },
  }),
  computed: {
    ...mapState('workflows', ['cylcTree']),
    ...mapGetters('workflows', ['getNodes']),
    workflows() {
      return this.getNodes('workflow')
    },
    workflowsTable() {
      return Object.values(this.workflows)
    },
  },
  methods: {
    viewWorkflow(workflow) {
      this.$router.push({ path: `/workflows/${workflow.tokens.workflow}` })
    },
  },
}
</script>
