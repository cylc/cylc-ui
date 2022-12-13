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
  <div class="h-100">
    <v-form>
      <v-container>
        <v-row :justify="start">
          <!-- <v-col cols="12" md="2" align-self="end">
            <v-text-field
              outlined
              dense
              disabled
              flat
              value="workflow"
          ></v-text-field>
        </v-col> -->

          <v-col cols="12" md="4" >
          <v-text-field
          v-model="jobSearch"
          clearable
          flat
          dense
          hide-details
          :prefix="workflowNamePrefix"
          outlined
          placeholder="Type cycle/task/job name here"
          class="flex-grow-1 flex-column"
          id="c-log-search-workflows"
        ></v-text-field>
          </v-col>
          <v-col cols="12" md="1">
            <v-btn color="primary" @click="set_id">Search</v-btn>
            </v-col>
            </v-row>
      </v-container>
    </v-form>

    <div class="c-log pa-2 h-100" data-cy="log-view">
      <log-component
        :logs="lines"
        ref="log0"
        key="log0"
      ></log-component>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mdiFileDocumentMultipleOutline } from '@mdi/js'
import pageMixin from '@/mixins/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionViewMixin from '@/mixins/subscriptionView'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import LogComponent from '@/components/cylc/log/Log'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import { LOGS_SUBSCRIPTION } from '@/graphql/queries'

class LogsCallback {
  constructor (lines) {
    this.lines = lines
  }

  tearDown (store, errors) {
  }

  onAdded (added, store, errors) {
    this.lines.push(...added)
  }

  commit (store, errors) {
  }
}

export default {
  mixins: [
    pageMixin,
    graphqlMixin,
    subscriptionComponentMixin,
    subscriptionViewMixin
  ],
  name: 'Log',
  components: {
    LogComponent
    // V-text here
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },
  data () {
    return {
      widget: {
        title: 'logs',
        icon: mdiFileDocumentMultipleOutline
      },
      lines: []
    }
  },
  // text boxes in here
  computed: {
    ...mapState('workflows', ['logs']),
    query () {
      return new SubscriptionQuery(
        LOGS_SUBSCRIPTION,
        this.variables,
        `log-query-${this._uid}`,
        [
          new LogsCallback(this.lines)
        ]
      )
    },
    workflowNamePrefix () {
      return `~${this.user.owner}/${this.workflowName}/`
    },
    methods: {
      set_id () {
        // this.variables =
      }
    }
  }
}
</script>
