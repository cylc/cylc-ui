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

<!--
  This is a bare-bones text-based tree view that displays live workflow data.

  It is intended to serve as a basis for future live-view development and to
  serve as functional documentation for view writing.

  NOTE:
    This view is not available in "production" mode.
-->

<template>
  <div class="c-simple-tree">
    <!-- Iterate over the root nodes. -->
    <ul
      v-for="node of workflows"
      :key="node.id"
    >
      <li>
        <b>{{ node.id }}</b>
        <!-- Then iterate over the children of those nodes.

          NOTE:
            "node.children" is always present on a node so you shouldn't have to
            do "node.children || []" here.
          NOTE:
            "node.id" is a good choice for the ":key" as every node in the store
            has a unique ID.
        -->
        <ul
          v-for="node1 of node.children"
          :key="node1.id"
        >
          <li>
            <!-- "node.name" is always provided for all nodes. Use this NOT
              node.node.name to save requesting unnecessary data -->
            <span class="name">{{ node1.name }}</span>
            <!-- Attributes requested in the QUERY will be available in
              "node.node".

              NOTE:
                The data store promises to make this information available but
                doesn't make any promises about when it will make this available.
                Just because a node exists in the store doesn't mean it will have
                all of the data you requested, yet. Code defensibly in
                anticipation of "undefined" keys.
            -->
            <span class="state">{{ node1.node.state }}</span>
            <!-- Then keep iterating down the tree.

              NOTE:
                We would normally use a recursive component to do this as we
                don't know how deep the tree is going to be, however, to keep
                this simple we will just hardcode it.
            -->
            <ul
              v-for="node2 of node1.children"
              :key="node2.id"
            >
              <li>
                <span class="name">{{ node2.name }}</span>
                <span class="state">{{ node2.node.state }}</span>
                <ul
                  v-for="node3 of node2.children"
                  :key="node3.id"
                >
                  <li>
                    <span class="name">{{ node3.name }}</span>
                    <span class="state">{{ node3.node.state }}</span>
                    <ul
                      v-for="node4 of node3.children"
                      :key="node4.id"
                    >
                      <li>
                        <span class="name">{{ node4.name }}</span>
                        <span class="state">{{ node4.node.state }}</span>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { mapState, mapGetters } from 'vuex'
import graphqlMixin from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'

// Any fields that our view will use (e.g. TaskProxy.status) must be requested
// in the query.
// Most of this is just boilerplate the important thing is the three declarations
// at the end.
const QUERY = gql`
subscription SimpleTreeSubscription ($workflowId: ID) {
  deltas(workflows: [$workflowId]) {
    added {
      ...AddedDelta
    }
    updated (stripNull: true) {
      ...UpdatedDelta
    }
    pruned {
      ...PrunedDelta
    }
  }
}

fragment AddedDelta on Added {
  workflow {
    ...WorkflowData
  }
  taskProxies {
    ...TaskProxyData
  }
  jobs {
    ...JobData
  }
}

fragment UpdatedDelta on Updated {
  workflow {
    ...WorkflowData
  }
  taskProxies {
    ...TaskProxyData
  }
  jobs {
    ...JobData
  }
}

# We must list all of the types we request data for here to enable automatic
# housekeeping.
fragment PrunedDelta on Pruned {
  workflow
  taskProxies
  jobs
}

# We must always request the reloaded field whenever we are requesting things
# within the workflow like tasks, cycles, etc as this is used to rebuild the
# store when a workflow is reloaded or restarted.
fragment WorkflowData on Workflow {
  id
  reloaded
}

# We must always request the "id" for ALL types.
# The only field this view requires beyond that is the status.
fragment TaskProxyData on TaskProxy {
  id
  state
}

# Same for jobs.
fragment JobData on Job {
  id
  state
}
`

export default {
  name: 'SimpleTree',

  // These mixins enable various functionalities.
  mixins: [
    graphqlMixin,
    subscriptionComponentMixin,
  ],

  computed: {
    // This gives us direct access to the data store if we need it:
    ...mapState('workflows', ['cylcTree']),

    // This gives us a convenient way to filter for the nodes we want from the
    // store:
    ...mapGetters('workflows', ['getNodes']),

    // List of workflow IDs we are displaying.
    // NOTE: Write all views to be multi-workflow capable.
    // NOTE: workflowId is provided by a mixin.
    workflowIDs () {
      return [this.workflowId]
    },

    // Get workflow nodes from the store.
    workflows () {
      // This returns all nodes of type "workflow" with ids which are in
      // this.workflowIDs
      return this.getNodes('workflow', this.workflowIDs)
    },

    // This registers the query with the WorkflowService, once registered, the
    // WorkflowService promises to make the data defined by the query available
    // in the store and to keep it up to date.
    query () {
      return new SubscriptionQuery(QUERY, this.variables, 'workflow', [])
    },
  },

}
</script>

<style lang="scss">
  .c-simple-tree {
    ul, ol {
      padding-left: 24px;
    }
    .state::before {
      content: ' ';
    }
    .state {
      color: grey;
    }
  }
</style>
