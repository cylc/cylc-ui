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
  <GScan :workflowTree="cylcTree" :isLoading="isLoading" />
</template>

<script>
import { mapState } from 'vuex'
import GScan from '@/components/cylc/gscan/GScan.vue'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import gql from 'graphql-tag'

const QUERY = gql`
subscription App {
  deltas {
    id
    added {
      ...AddedDelta
    }
    updated (stripNull: true) {
      ...UpdatedDelta
    }
    pruned {
      workflow
    }
  }
}

fragment AddedDelta on Added {
  workflow {
    ...WorkflowData
  }
}

fragment UpdatedDelta on Updated {
  workflow {
    ...WorkflowData
  }
}

fragment WorkflowData on Workflow {
  # NOTE: do not request the "reloaded" event here
  # (it would cause a race condition with the workflow subscription)
  id
  status
  statusMsg
  stateTotals
  lastUpdated
  logRecords {
    level
    message
  }
  latestStateTasks(states: [
    "failed",
    "preparing",
    "submit-failed",
    "submitted",
    "running"
  ])
}
`

export default {
  name: 'Workflows',

  mixins: [
    subscriptionComponentMixin
  ],

  components: {
    GScan,
  },

  data () {
    return {
      query: new SubscriptionQuery(
        QUERY,
        {},
        'root',
        []
      )
    }
  },

  computed: {
    ...mapState('workflows', ['cylcTree'])
  }
}
</script>
