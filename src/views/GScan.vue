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
      <v-flex
        md12
      >
        <material-card
          :text="$t('Suites.tableSubHeader')"
          :title="$t('Suites.tableHeader')"
          color="green"
        >
          <v-data-table
            :headers="headers"
            :items="workflows"
            :loading="isLoading"
            :pagination.sync="pagination"
          >
            <template slot="no-data" v-if="!isLoading">
              <v-alert
                :value="true"
                color="error"
                icon="warning">
                No workflows found for the current user
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
            <v-progress-linear slot="progress" color="green" indeterminate></v-progress-linear>
            <template
              slot="items"
              slot-scope="{ item }"
            >
              <td>{{ item.name }}</td>
              <td>{{ item.owner }}</td>
              <td>{{ item.host }}</td>
              <td>{{ item.port }}</td>
              <td class="justify-center">
                <v-icon
                    small
                    class="mr-2"
                    @click="viewWorkflow(item)"
                >
                  mdi-table-edit
                </v-icon>
              </td>
            </template>
          </v-data-table>
        </material-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>


<script>
  import { workflowService } from 'workflow-service'
  import { mapState } from 'vuex'

  // query to retrieve all workflows
  const QUERIES = {
    'root': `
      {
        workflows {
          id
          name
          owner
          host
          port
        }
      }
    `
  }

  export default {
    metaInfo () {
      return {
        'title': 'Cylc GScan'
      }
    },
    data: () => ({
      viewId: 'GScan: ' + Math.random(),
      subscriptions: {},
      pagination: {
        rowsPerPage: 10
      },
      headers: [
        {
          sortable: true,
          text: 'Name',
          value: 'name'
        },
        {
          sortable: true,
          text: 'Owner',
          value: 'owner'
        },
        {
          sortable: true,
          text: 'Host',
          value: 'host'
        },
        {
          sortable: false,
          text: 'Port',
          value: 'port'
        },
        {
          sortable: false,
          text: 'Actions',
          value: 'actions'
        }
      ],
    }),
    computed: {
      ...mapState('workflows', ['workflows']),
      ...mapState('app', ['isLoading'])
    },
    created() {
      workflowService.register(this);
      this.subscribe('root');
    },
    beforeDestroy() {
      workflowService.unregister(this);
    },
    methods: {
      viewWorkflow(workflow) {
        this.$router.push({ path: `/workflows/${workflow.name}` });
      },
      subscribe(query_name) {
        if (!(query_name in this.subscriptions)) {
          this.subscriptions[query_name] =
            workflowService.subscribe(this, QUERIES[query_name]);
        }
      },
      unsubscribe(query_name) {
        if (query_name in this.subscriptions) {
          workflowService.unsubscribe(this.subscriptions[query_name]);
        }
      }
    }
  }
</script>
