<template>
  <v-container
    fluid
    grid-list
    class="c-dashboard"
  >
    <v-layout row wrap>
      <v-flex xs6 md6 lg3>
        <p class="display-1">Workflows</p>
        <!-- TODO: link with data from the query -->
        <v-data-table
            :items="workflows"
            hide-actions
            hide-headers>
          <template v-slot:items="props">
            <td class="headline">{{ props.item.count }}</td>
            <td class="title">{{ props.item.text }}</td>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex xs6 md6 lg9>
        <p class="display-1">Events</p>
        <v-data-table
            :items="events"
            hide-actions
            hide-headers>
          <template v-slot:items="props">
            <td class="headline">{{ props.item.id }}</td>
            <td class="title">{{ props.item.text }}</td>
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
          <v-list-tile
              avatar
              to="/user-profile"
              :active-class="color"
          >
            <v-list-tile-avatar size="60" style="font-size: 2em;">
              <v-icon medium>mdi-settings</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title class="title font-weight-thin">
                Settings
              </v-list-tile-title>
              <v-list-tile-sub-title>
                View your Hub permissions, and alter user preferences
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
              avatar
              href="/hub/home"
              :active-class="color"
          >
            <v-list-tile-avatar size="60" style="font-size: 2em;">
              <v-icon medium>mdi-hubspot</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title class="title font-weight-thin">
                Cylc Hub
              </v-list-tile-title>
              <v-list-tile-sub-title>
                Visit the Hub to manage your running UI Servers
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>
      <v-flex xs12 md6 lg6>
        <v-list three-line>
          <v-list-tile
              avatar
              href="#"
              :active-class="color"
          >
            <v-list-tile-avatar size="60" style="font-size: 2em;">
              <v-icon medium>mdi-book</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title class="title font-weight-thin">
                Cylc UI Quickstart
              </v-list-tile-title>
              <v-list-tile-sub-title>
                Learn how to use the Cylc UI
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
              avatar
              href="https://cylc.github.io/doc/built-sphinx/suite-design-guide/suite-design-guide-master.html"
              :active-class="color"
          >
            <v-list-tile-avatar size="60" style="font-size: 2em;">
              <v-icon medium>mdi-book-open-variant</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title class="title font-weight-thin">
                Suite Design Guide
              </v-list-tile-title>
              <v-list-tile-sub-title>
                How to make complex Cylc and Rose workflows simpler and easier to maintain
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile
              avatar
              href="https://cylc.github.io/documentation.html"
              :active-class="color"
          >
            <v-list-tile-avatar size="60" style="font-size: 2em;">
              <v-icon medium>mdi-file-document-box-multiple</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title class="title font-weight-thin">
                Documentation
              </v-list-tile-title>
              <v-list-tile-sub-title>
                The complete Cylc documentation
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mixin } from '@/mixins/index'
import { mapState } from 'vuex'

function connectNodes (fromNode, toNode) {
  console.log('TODO?')
}

export default {
  mixins: [mixin],
  metaInfo () {
    return {
      title: this.getPageTitle('App.dashboard')
    }
  },
  data: () => ({
    workflows: [
      { text: 'Running', count: 0 },
      { text: 'Held', count: 0 },
      { text: 'Stopped', count: 0 }
    ],
    events: []
  }),
  computed: {
    ...mapState('app', ['color'])
  },
  mounted: function () {
    const settingsNode = document.getElementById('settings-node').children[0]
    const suiteDesignGuideNode = document.getElementById('guide-node').children[0]
    connectNodes(settingsNode, suiteDesignGuideNode)
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
.v-list__tile__action, .v-list__tile__avatar {
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
