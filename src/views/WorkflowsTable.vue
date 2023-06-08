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
    <v-row class="align-self-start">
      <v-col>
        <!-- TODO: this is not really an alert, it's a heading -->
        <v-alert
          :icon="$options.icons.mdiTable"
          prominent
          color="grey-lighten-3"
        >
          <h3 class="text-h5">{{ $t('Workflows.tableHeader') }}</h3>
        </v-alert>
        <v-data-table
          :headers="$options.headers"
          :items="workflowsTable"
          data-cy="workflows-table"
        >
          <template v-slot:item="{ item }">
            <tr
              @click="viewWorkflow(item.raw)"
              style="cursor: pointer"
            >
              <td width="1em">
                <WorkflowIcon
                  :status="item.raw.node.status"
                  v-cylc-object="item.raw"
                />
              </td>
              <td>
                {{ item.raw.tokens.workflow }}
              </td>
              <td>
                {{ item.raw.node.status }}
              </td>
              <td>
                {{ item.raw.node.owner }}
              </td>
              <td>
                {{ item.raw.node.host }}
              </td>
              <td>
                {{ item.raw.node.port }}
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { i18n } from '@/i18n'
import { mdiTable } from '@mdi/js'
import { getPageTitle } from '@/utils/index'
import subscriptionMixin from '@/mixins/subscription'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import { WORKFLOWS_TABLE_DELTAS_SUBSCRIPTION } from '@/graphql/queries'
import WorkflowIcon from '@/components/cylc/gscan/WorkflowIcon.vue'

export default {
  name: 'WorkflowsTable',

  mixins: [
    subscriptionMixin
  ],

  head () {
    return {
      title: getPageTitle('App.workflows')
    }
  },

  components: {
    WorkflowIcon
  },

  data: () => ({
    query: new SubscriptionQuery(
      WORKFLOWS_TABLE_DELTAS_SUBSCRIPTION,
      {},
      'root',
      [],
      true,
      true
    ),
  }),

  computed: {
    ...mapState('workflows', ['cylcTree']),
    ...mapGetters('workflows', ['getNodes']),
    workflows () {
      return this.getNodes('workflow')
    },
    workflowsTable () {
      return Object.values(this.workflows)
    }
  },

  methods: {
    viewWorkflow (workflow) {
      this.$router.push({ path: `/workspace/${workflow.tokens.workflow}` })
    }
  },

  headers: [
    {
      sortable: false,
      title: '',
      key: 'icon'
    },
    {
      sortable: true,
      title: i18n.global.t('Workflows.tableColumnName'),
      key: 'tokens.workflow'
    },
    {
      sortable: true,
      title: 'Status',
      key: 'node.status'
    },
    {
      sortable: true,
      title: i18n.global.t('Workflows.tableColumnOwner'),
      key: 'node.owner'
    },
    {
      sortable: true,
      title: i18n.global.t('Workflows.tableColumnHost'),
      key: 'node.host'
    },
    {
      sortable: false,
      title: i18n.global.t('Workflows.tableColumnPort'),
      key: 'node.port'
    },
  ],

  icons: {
    mdiTable,
  },
}
</script>
