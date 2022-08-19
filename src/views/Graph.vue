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
  <div>
    <!--svg
      width="100%"
      height="100%"
    >
      <circle
        cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow"
        v-for=""
      />
    </svg-->

    <!--
    Lookup:
    <ul>
      <li
        v-for="item in lookup"
        v-bind:key="item.id"
      >
        {{ item.id }}
      </li>
    </ul>

    Tree:
    <pre>{{ cylcTree }}</pre>
    -->

    <br />
    <ul>
      <li>
        Workflow IDs
        <ul>
          <li
            v-for="workflowID of workflowIDs"
            v-bind:key="workflowID"
          >
            {{ workflowID }}
          </li>
        </ul>
      </li>
      <li>
        Nodes
        <ul>
          <li
            v-for="node of nodes"
            v-bind:key="node.id"
          >
            {{ node.name }}
          </li>
        </ul>
      </li>
      <li>
        Edges
        <ul>
          <li
            v-for="edge of edges"
            v-bind:key="edge.id"
          >
          {{ edge.node.source }} -- {{ edge.node.target }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { mapState } from 'vuex'
import { mdiFileTree } from '@mdi/js'
import pageMixin from '@/mixins/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionViewMixin from '@/mixins/subscriptionView'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import WorkflowCallback from '@/components/cylc/common/callbacks'
// import TreeCallback from '@/components/cylc/tree/callbacks'

// NOTE: use TaskProxies not nodesEdges{nodes} to list nodes to allow
// request overlap with other views (notably the tree view)
const QUERY = gql`
fragment GraphEdgeData on Edge {
  id
  source
  target
}

fragment GraphNodeData on TaskProxy {
  id
  state
  name
}

fragment GraphJobData on Job {
  id
  state
  name
}

fragment GraphAddedDelta on Added {
  edges {
    ...GraphEdgeData
  }
  taskProxies {
    ...GraphNodeData
  }
  jobs {
    ...GraphJobData
  }
}

fragment GraphUpdatedDelta on Updated {
  edges {
    ...GraphEdgeData
  }
  taskProxies {
    ...GraphNodeData
  }
  jobs {
    ...GraphJobData
  }
}

fragment GraphDeltas on Deltas {
  added {
    ...GraphAddedDelta
  }
  updated {
    ...GraphUpdatedDelta
  }
}

subscription OnWorkflowTreeDeltasData($workflowId: ID) {
  deltas(workflows: [$workflowId], stripNull: true) {
    ...GraphDeltas
  }
}
`

export default {
  mixins: [
    pageMixin,
    graphqlMixin,
    subscriptionComponentMixin,
    subscriptionViewMixin
  ],
  name: 'Graph',
  components: {
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },
  data () {
    return {
      widget: {
        title: 'graph',
        icon: mdiFileTree
      }
    }
  },
  computed: {
    ...mapState('workflows', ['lookup', 'cylcTree']),
    query () {
      return new SubscriptionQuery(
        QUERY,
        this.variables,
        'workflow',
        [
          new WorkflowCallback()
          // new TreeCallback()
        ]
      )
    },
    workflowIDs () {
      return [`~osanders/${this.workflowName}`]
    },
    workflows () {
      const ret = []
      for (const workflowID in this.cylcTree.$workflows || []) {
        console.log(`% ${workflowID} ${this.workflowIDs}`)
        if (this.workflowIDs.includes(workflowID)) {
          ret.push(this.cylcTree.$workflows[workflowID])
        }
      }
      return ret
    },
    nodes () {
      const ret = []
      for (const workflow of this.workflows) {
        for (const cycle of workflow.children || []) {
          for (const task of cycle.children || []) {
            ret.push(task)
          }
        }
      }
      return ret
    },
    edges () {
      const ret = []
      for (const workflow of this.workflows) {
        for (const edge of workflow.$edges || []) {
          ret.push(edge)
        }
      }
      return ret
    }
  }
}
</script>
