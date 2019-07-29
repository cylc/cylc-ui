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
    <v-layout row wrap>
      <v-flex xs6 md6 lg2>
        <v-list two-line>
          <v-list-tile avatar>
            <v-list-tile-avatar size="80" style="font-size: 2em;">
              <task status="succeeded" />
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title class="title font-weight-thin">
                Settings
              </v-list-tile-title>
              <v-list-tile-sub-title>
                <job status="succeeded" />
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile avatar>
            <v-list-tile-avatar size="80" style="font-size: 2em;">
              <task status="waiting" />
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title class="title font-weight-thin">
                Cylc Hub
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>
      <v-flex xs6 md6 lg2>
        <v-list two-line>
          <v-list-tile avatar>
            <v-list-tile-avatar size="80" style="font-size: 2em;">
              <task status="succeeded" />
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title class="title font-weight-thin">
                Cylc UI Quickstart
              </v-list-tile-title>
              <v-list-tile-sub-title>
                <job status="succeeded" />
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile avatar>
            <v-list-tile-avatar size="80" style="font-size: 2em;">
              <task status="running" :progress=25 />
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title class="title font-weight-thin">
                Documentation
              </v-list-tile-title>
              <v-list-tile-sub-title>
                <job status="submitted"/>
                <job status="submitted"/>
                <job status="submitted"/>
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile avatar>
            <v-list-tile-avatar size="80" style="font-size: 2em;">
              <task status="waiting" />
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title class="title font-weight-thin">
                Suite Design Guide
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 md12 lg4>
        <v-list align-center>
          <v-list-tile>
            <v-list-tile-avatar size="80" style="font-size: 2em;">
              <task status="failed" />
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title class="title font-weight-thin">
                Stop Server
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mixin } from '@/mixins/index'
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'

export default {
  mixins: [mixin],
  components: {
    task: Task,
    job: Job
  },
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
  })
}
</script>
