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
    <div class="c-log pa-2 h-100" data-cy="log-view">
      <log-component
        :logs="getlogs"
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
import LogsCallback from '@/components/cylc/log/callbacks'

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
      }
    }
  },

  computed: {
    ...mapState('workflows', ['logs']),
    getlogs () {
      if (!this.logs.scheduler_logs) {
        return Object.values(this.logs)
      }
      return Object.values(this.logs.scheduler_logs)
    },
    query () {
      return new SubscriptionQuery(
        LOGS_SUBSCRIPTION,
        this.variables,
        'log-query',
        [
          new LogsCallback()
        ]
      )
    }
  }
}
</script>
