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
            :items="items"
          >
            <template slot="no-data">
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
            <template
              slot="items"
              slot-scope="{ item }"
            >
              <td>{{ item.name }}</td>
              <td>{{ item.group }}</td>
              <td>{{ item.host }}</td>
              <td>{{ item.owner }}</td>
              <td>{{ item.version }}</td>
              <td>{{ item.updated }}</td>
              <td>{{ item.status }}</td>
            </template>
          </v-data-table>
        </material-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  metaInfo () {
    return {
      title: 'Cylc Web | Suites'
    }
  },
  data: () => ({
    headers: [
      {
        sortable: true,
        text: 'Name',
        value: 'name'
      },
      {
        sortable: false,
        text: 'Group',
        value: 'group'
      },
      {
        sortable: false,
        text: 'Host',
        value: 'host'
      },
      {
        sortable: false,
        text: 'Owner',
        value: 'owner'
      },
      {
        sortable: false,
        text: 'Version',
        value: 'version'
      },
      {
        sortable: false,
        text: 'Updated',
        value: 'updated'
      },
      {
        sortable: true,
        text: 'Status',
        value: 'status'
      }
    ],
    items: [
      {
        name: 'Dakota Rice',
        group: null,
        host: 'localhost',
        owner: 'robert',
        version: '7.8.0-abc123',
        updated: '30/10/2018',
        status: 'Running'
      },
      {
        name: 'Minerva Hooper',
        group: null,
        host: 'localhost',
        owner: 'robert',
        version: '7.6.0-abc123',
        updated: '01/12/2018',
        status: 'Running'
      }, {
        name: 'Sage Rodriguez',
        group: null,
        host: 'localhost',
        owner: 'robert',
        version: '8.0.0-b1-123abc',
        updated: '30/10/2018',
        status: 'Running'
      }, {
        name: 'Philip Chanley',
        group: null,
        host: 'localhost',
        owner: 'robert',
        version: '7.8.0-abc123',
        updated: '07/01/2019',
        status: 'Stalled'
      }, {
        name: 'Doris Greene',
        group: null,
        host: 'localhost',
        owner: 'robert',
        version: '7.8.0-abc123',
        updated: '30/10/2018',
        status: 'Running'
      }, {
        name: 'Mason Porter',
        group: null,
        host: 'localhost',
        owner: 'robert',
        version: '7.8.0-abc123',
        updated: '30/10/2018',
        status: 'Cancelled'
      }
    ]
  })
}
</script>
