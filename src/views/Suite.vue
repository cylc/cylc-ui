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
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.meanElapsedTime }}</td>
              <td>{{ item.namespace }}</td>
              <td>{{ item.depth }}</td>
            </template>
          </v-data-table>
        </material-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import {SuiteService} from '@/services/suite.service'
  import {mapState} from 'vuex'

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
          text: 'ID',
          value: 'id'
        },
        {
          sortable: true,
          text: 'Name',
          value: 'name'
        },
        {
          sortable: false,
          text: 'Elapsed Time',
          value: 'meanElapsedTime'
        },
        {
          sortable: false,
          text: 'Namespace',
          value: 'namespace'
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
      // TBD: normally here we would have an ID, then query by ID...
      SuiteService.getSuites().then(() => {
        const suites = this.$store.getters['suites/suites'];
        for (let i = 0; i < suites.length; i++) {
          if (suites[i].name === this.$route.params.name) {
            SuiteService.getSuiteTasks(suites[i]);
            break;
          }
        }
      });
    },
    mounted() {
      const title = `Suite ${this.$route.params.name}`;
      this.$store.commit('app/setTitle', title);
    }
  }
</script>
