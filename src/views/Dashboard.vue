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
  </v-container>
</template>

<script>
import { mixin } from '@/mixins/index'

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
  })
}
</script>

<style>
.c-dashboard {
  font-size: 120%;
}
</style>
