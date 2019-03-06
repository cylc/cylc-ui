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
            :items="suites"
            :loading="isLoading"
            :pagination.sync="pagination"
          >
            <template slot="no-data" v-if="!isLoading">
              <v-alert
                :value="true"
                color="error"
                icon="warning">
                No suites found for the current user
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
              <td>{{ item.user }}</td>
              <td>{{ item.host }}</td>
              <td>{{ item.port }}</td>
            </template>
          </v-data-table>
        </material-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { SuiteService } from '@/services/suite.service'
import { mapState } from 'vuex'


export default {
  metaInfo () {
    return {
      title: 'Cylc Web | Suites'
    }
  },
  data: () => ({
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
      }
    ]
  }),
  computed: {
    // namespace: module suites, and property suites, hence these repeated tokens...
    ...mapState('suites', ['suites']),
    ...mapState(['isLoading'])
  },
  beforeCreate() {
    SuiteService.getSuites()
  }
}
</script>
