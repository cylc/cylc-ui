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
            text="This is the list of tasks for the suite"
            title="Tasks"
            color="green"
        >
          <v-data-table
              :headers="headers"
              :items="tasks"
              :loading="isLoading"
              :pagination.sync="pagination"
          >
            <template slot="no-data" v-if="!isLoading">
              <v-alert
                  :value="true"
                  color="error"
                  icon="warning">
                No tasks found for the current user
              </v-alert>
            </template>
            <template
                slot="headerCell"
                slot-scope="{ header }"
            >
              <span
                  class="subheading font-weight-light text-success text--darken-3"
                  v-text="header.text"
              ></span>
            </template>
            <v-progress-linear slot="progress" color="green" indeterminate></v-progress-linear>
            <template
                slot="items"
                slot-scope="{ item }"
            >
              <td>{{ item.name }}</td>
              <td>{{ item.state }}</td>
              <td>{{ item.host }}</td>
              <td>{{ item.jobId }}</td>
              <td>{{ item.latestMessage }}</td>
              <td>{{ item.depth }}</td>
            </template>
          </v-data-table>
        </material-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { SuiteService } from 'suite-service'
  import {mapState} from 'vuex'

  const suiteService = new SuiteService();

  export default {
    metaInfo() {
      return {
        title: 'Cylc UI | Suite ' + this.$route.params.name
      }
    },
    data: () => ({
      pagination: {
        rowsPerPage: 10
      },
      headers: [
        {
          sortable: true,
          text: 'Task',
          value: 'name'
        },
        {
          sortable: true,
          text: 'State',
          value: 'state'
        },
        {
          sortable: true,
          text: 'Host',
          value: 'host'
        },
        {
          sortable: false,
          text: 'Job ID',
          value: 'jobId'
        },
        {
          sortable: false,
          text: 'Latest Message',
          value: 'latestMessage'
        },
        {
          sortable: false,
          text: 'Depth',
          value: 'depth'
        }
      ]
    }),
    computed: {
      // namespace: module suites, and property suites, hence these repeated tokens...
      ...mapState('suites', ['tasks']),
      ...mapState(['isLoading'])
    },
    beforeCreate() {
      const suiteId = this.$route.params.name
      suiteService.getSuiteTasks(suiteId)
    }
  }
</script>
