<template>
  <v-container fluid grid-list class="c-dashboard mt-4">
    <v-layout wrap>
      <v-flex xs6 md6 lg3>
        <p class="display-1">Workflows</p>
        <!-- TODO: link with data from the query -->
        <v-data-table
          :headers="workflowsHeader"
          :items="workflows"
          hide-default-footer
          hide-default-header
        >
          <template v-slot:item.count="{ item }">
            <span class="headline font-weight-thin">{{ item.count }}</span>
          </template>
          <template v-slot:item.text="{ item }">
            <span class="title font-weight-thin">{{ item.text }}</span>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex xs6 md6 lg9>
        <p class="display-1">Events</p>
        <v-data-table
          :headers="eventsHeader"
          :items="events"
          hide-default-footer
          hide-default-header
        >
          <template v-slot:item.id="{ item }">
            <span class="title font-weight-thin">{{ item.id }}</span>
          </template>
          <template v-slot:item.text="{ item }">
            <span class="title font-weight-thin">{{ item.text }}</span>
          </template>
          <template v-slot:no-data>
            <td class="title">No events</td>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
    <v-divider />
    <v-layout row wrap>
      <v-flex xs12 md6 lg6>
        <v-list three-line>
          <v-list-item to="/user-profile">
            <v-list-item-avatar size="60" style="font-size: 2em;">
              <v-icon medium>mdi-settings</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title font-weight-thin">Settings</v-list-item-title>
              <v-list-item-subtitle>View your Hub permissions, and alter user preferences</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item href="/hub/home">
            <v-list-item-avatar size="60" style="font-size: 2em;">
              <v-icon medium>mdi-hubspot</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title font-weight-thin">Cylc Hub</v-list-item-title>
              <v-list-item-subtitle>Visit the Hub to manage your running UI Servers</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-flex>
      <v-flex xs12 md6 lg6>
        <v-list three-line>
          <v-list-item href="#">
            <v-list-item-avatar size="60" style="font-size: 2em;">
              <v-icon medium>mdi-book</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title font-weight-thin">Cylc UI Quickstart</v-list-item-title>
              <v-list-item-subtitle>Learn how to use the Cylc UI</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            href="https://cylc.github.io/doc/built-sphinx/suite-design-guide/suite-design-guide-master.html"
          >
            <v-list-item-avatar size="60" style="font-size: 2em;">
              <v-icon medium>mdi-book-open-variant</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title font-weight-thin">Suite Design Guide</v-list-item-title>
              <v-list-item-subtitle>How to make complex Cylc and Rose workflows simpler and easier to maintain</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item href="https://cylc.github.io/documentation.html">
            <v-list-item-avatar size="60" style="font-size: 2em;">
              <v-icon medium>mdi-file-document-box-multiple</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title font-weight-thin">Documentation</v-list-item-title>
              <v-list-item-subtitle>The complete Cylc documentation</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mixin } from '@/mixins/index';

export default {
  mixins: [mixin],
  metaInfo () {
    return {
      title: this.getPageTitle('App.dashboard')
    }
  },
  data () {
    return {
      workflowsHeader: [
        {
          text: 'Count',
          sortable: false,
          value: 'count'
        },
        {
          text: 'Text',
          sortable: false,
          value: 'text'
        }
      ],
      workflows: [
        {
          text: 'Running',
          count: 0
        },
        {
          text: 'Held',
          count: 0
        },
        {
          text: 'Stopped',
          count: 0
        }
      ],
      eventsHeader: [
        {
          text: 'ID',
          sortable: false,
          value: 'id'
        },
        {
          text: 'Event',
          sortable: false,
          value: 'text'
        }
      ],
      events: []
    }
  }
}
</script>

<style>
.c-dashboard {
  padding: 0 24px;
}

/* Items in the bottom menu are left-aligned with the top Workflows&Events
   entries, so we are required to override some styles from Vuetify components
   in here.*/

/* to left align items in the dashboard */
.v-avatar .v-icon {
  width: auto;
  height: auto;
}
.v-list__tile__action,
.v-list__tile__avatar {
  min-width: auto;
  margin-left: -10px;
}

/* otherwise avatar does not left align with component above,
   !important as the attributes are set in the tag element -->
.v-avatar {
  height: auto !important;
  width: auto !important;
}

/* otherwise responsive UI ends up with extra space between vertical menu items */
.v-list {
  padding: 0 0;
}

/* to left align items in the dashboard */
.v-list__tile {
  padding: 10px 0;
}
</style>
