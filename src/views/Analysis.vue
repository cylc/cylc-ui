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
  <div class="c-analysis" style="width: 100%; height: 100%">
    <h3>Analysis View</h3>
    <ViewToolbar :groups="groups" />
    <ul
      v-for="job of jobs"
      :key="job.id"
    >
      <li>
        {{ job.id }}
        <br />
        <span style="padding-left: 1em">started: {{ job.startedTime }}</span>
        <br />
        <span style="padding-left: 1em">finished: {{ job.finishedTime }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import pick from 'lodash/pick'
import Vue from 'vue'
import gql from 'graphql-tag'
import pageMixin from '@/mixins/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionViewMixin from '@/mixins/subscriptionView'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import ViewToolbar from '@/components/cylc/ViewToolbar'
import {
  mdiChartLine
} from '@mdi/js'

// list of fields to request for jobs
const jobFields = [
  'id',
  'state',
  'startedTime',
  'finishedTime'
]

// the one-off query which retrieves historical objects not
// normally visible in the GUI
const QUERY = gql`
query ($workflows: [ID]) {
  jobs(live: false, workflows: $workflows) {
    ${jobFields.join('\n')}
  }
}
`

// the subscription which keeps up to date with the live
// state of the workflow
const SUBSCRIPTION = gql`
subscription WorkflowGraphSubscription ($workflowId: ID) {
  deltas(workflows: [$workflowId]) {
    ...Deltas
  }
}

fragment JobData on Job {
  ${jobFields.join('\n')}
}

fragment AddedDelta on Added {
  jobs {
    ...JobData
  }
}

fragment UpdatedDelta on Updated {
  jobs {
    ...JobData
  }
}

fragment Deltas on Deltas {
  added {
    ...AddedDelta
  }
  updated (stripNull: true) {
    ...UpdatedDelta
  }
}
`

// the callback which gets automatically called when data comes in on
// the subscription
class AnalysisCallback {
  constructor (jobs) {
    this.jobs = jobs
  }

  add (data) {
    // add jobs contained in data to this.jobs
    for (const job of data.jobs) {
      if (job.id in this.jobs) {
        // merge new data into existing entry
        const storedJob = this.jobs[job.id]
        for (const field of jobFields) {
          if (job[field]) {
            Vue.set(storedJob, field, job[field])
          }
        }
      } else {
        // add new entry
        Vue.set(
          this.jobs,
          job.id,
          pick(job, jobFields)
        )
      }
    }
  }

  // called when new objects are added
  // NOTE: we manually call this to add items which come through on the query
  onAdded (added, store, errors) {
    this.add(added)
  }

  // called when existing objects are updated
  onUpdated (updated, store, errors) {
    this.add(updated)
  }

  // other hooks we don't need but must declare (for now)
  before () {}
  after () {}
  onPruned () {}
  commit () {}
  tearDown () {}
}

export default {
  mixins: [
    pageMixin,
    graphqlMixin,
    subscriptionComponentMixin,
    subscriptionViewMixin
  ],

  name: 'Analysis',

  components: {
    ViewToolbar
  },

  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  data () {
    const jobs = {}
    return {
      // defines how the view view appears in the "add view" dropdown
      widget: {
        title: 'analysis',
        icon: mdiChartLine
      },
      // defines controls which get added to the toolbar
      // (see Graph.vue for example usage)
      groups: [
        {
          title: 'Analysis',
          controls: [
          ]
        }
      ],
      // instance of the callback class
      callback: new AnalysisCallback(jobs),
      // object containing all of the jobs added by the callback
      jobs
    }
  },

  computed: {
    // registers the subscription (unhelpfully named query)
    // (this is called automatically)
    query () {
      this.historicalQuery() // TODO order
      return new SubscriptionQuery(
        SUBSCRIPTION,
        this.variables,
        'workflow',
        [this.callback]
      )
    },

    // a list of the workflow IDs this view is "viewing"
    // NOTE: we plan multi-workflow functionality so we are writing views
    // to be mult-workflow compatible in advance of this feature arriving
    workflowIDs () {
      return [this.workflowId]
    }
  },

  methods: {
    // run the one-off query for historical job data and pass its results
    // through the callback
    async historicalQuery () {
      const ret = await this.$workflowService.query2(
        QUERY,
        { workflows: this.workflowIDs }
      )
      this.callback.onAdded(ret.data)
    }
  }
}
</script>
