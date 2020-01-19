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
  <div id="workflow-panel" class="fill-height">
    <workflow
      :workflow-name="workflowName"
      :workflow-tree="tree"
      :is-loading="isLoading"
      ref="workflow-component" />
  </div>
</template>

<script>
import { mixin } from '@/mixins'
import { datatree } from '@/mixins/treeview'
import { mapState } from 'vuex'
import Workflow from '@/components/cylc/workflow/Workflow'
import { EventBus } from '@/components/cylc/workflow'
import { WORKFLOW_GRAPH_QUERY, WORKFLOW_TREE_DELTAS_SUBSCRIPTION } from '@/graphql/queries'
import CylcTree from '@/components/cylc/tree/cylc-tree'
import { applyDeltas } from '@/components/cylc/tree/deltas'
import Alert from '@/model/Alert.model'

// query to retrieve all workflows
const QUERIES = {
  graph: WORKFLOW_GRAPH_QUERY
}

export default {
  mixins: [
    mixin,
    datatree
  ],
  name: 'Workflow',
  props: {
    workflowName: {
      type: String,
      required: true
    }
  },
  components: {
    workflow: Workflow
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },
  data: () => ({
    subscriptions: {},
    deltaSubscriptions: [],
    /**
     * The CylcTree object, which receives delta updates. We must have only one for this
     * view, and it should contain data only while the tree subscription is active (i.e.
     * there are tree widgets added to the Lumino component).
     *
     * @type {CylcTree}
     */
    tree: new CylcTree(),
    isLoading: true
  }),
  computed: {
    ...mapState('workflows', ['workflows']),
    ...mapState('user', ['user'])
  },
  created () {
    const vm = this
    EventBus.$on('add:tree', () => {
      const subscriptionId = this.subscribeDeltas()
      // add widget that uses the GraphQl query response
      this.$refs['workflow-component'].addTreeWidget(`${subscriptionId}`)
    })
    EventBus.$on('add:graph', () => {
      // subscribe GraphQL query
      const subscriptionId = this.subscribe('graph')
      // add widget that uses the GraphQl query response
      this.$refs['workflow-component'].addGraphWidget(`${subscriptionId}`)
    })
    EventBus.$on('add:mutations', () => {
      // no subscription for this view ATM as we are using the centrally
      // defined schema
      // on day it will become a one-off query (though a subscription would work
      // too as the schema doesn't change during the lifetime of a workflow run
      const subscriptionId = (new Date()).getTime()
      // add widget that uses the GraphQl query response
      this.$refs['workflow-component'].addMutationsWidget(`${subscriptionId}`)
    })
    EventBus.$on('delete:tree', (data) => {
      this.$refs['workflow-component'].removeTreeWidget(data.id)
      const subscriptionId = Number.parseFloat(data.id)
      this.$workflowService.unsubscribe(subscriptionId)
    })
    EventBus.$on('delete:graph', (data) => {
      this.$refs['workflow-component'].removeGraphWidget(data.id)
      const subscriptionId = Number.parseFloat(data.id)
      if (vm.deltaSubscriptions.includes(subscriptionId)) {
        // if this is a tree widget with a deltas subscription, then stop it if the last widget using it
        vm.deltaSubscriptions.splice(this.deltaSubscriptions.indexOf(subscriptionId), 1)
        if (this.deltaSubscriptions.length === 0) {
          this.$workflowService.stopDeltasSubscription()
        }
      } else {
        // otherwise recompute query and update normal subscription
        this.$workflowService.unsubscribe(subscriptionId)
      }
    })
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$nextTick(() => {
        EventBus.$emit('add:tree')
      })
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.isLoading = true
    // clear the tree with current workflow data
    this.tree.clear()
    // stop delta subscription if any
    this.$workflowService.stopDeltasSubscription()
    // clear all widgets
    this.$refs['workflow-component'].removeAllWidgets()
    // start over again with the new deltas query/variables/new widget as in beforeRouteEnter
    // and in the next tick as otherwise we would get stale/old variables for the graphql query
    this.$nextTick(() => {
      // Create a Tree View for the current workflow by default
      const subscriptionId = this.subscribeDeltas()
      this.$refs['workflow-component'].addTreeWidget(`${subscriptionId}`)
    })
    next()
  },
  beforeRouteLeave (to, from, next) {
    EventBus.$off('add:tree')
    EventBus.$off('add:graph')
    EventBus.$off('add:mutations')
    EventBus.$off('delete:tree')
    EventBus.$off('delete:widget')
    this.$workflowService.unregister(this)
    this.tree.clear()
    this.$workflowService.stopDeltasSubscription()
    next()
  },
  methods: {
    subscribeDeltas () {
      const id = new Date().getTime()
      // start deltas subscription if not running
      if (this.deltaSubscriptions.length === 0) {
        const vm = this
        this.$workflowService
          .startDeltasSubscription(WORKFLOW_TREE_DELTAS_SUBSCRIPTION, this.variables, {
            next: function next (response) {
              applyDeltas(response.data.deltas, vm.tree)
            },
            error: function error (err) {
              vm.setAlert(new Alert(err.message, null, 'error'))
            }
          })
      }
      this.deltaSubscriptions.push(id)
      return id
    },
    /**
     * Subscribe this view to a new GraphQL query.
     * @param {string} queryName - Must be in QUERIES.
     * @return {number} subscription ID.
     */
    subscribe (queryName) {
      // create a view object, used a key by the workflow service
      const view = {
        viewID: `Workflow-${queryName}(${this.workflowName}): ${Math.random()}`,
        subscriptionId: 0
      }
      this.$workflowService.register(
        view,
        {
          activeCallback: this.setActive
        }
      )
      const workflowId = `${this.user.username}|${this.workflowName}`
      const subscriptionId = this.$workflowService.subscribe(
        view,
        QUERIES[queryName].replace('WORKFLOW_ID', workflowId)
      )
      view.subscriptionId = subscriptionId
      if (!(queryName in this.subscriptions)) {
        this.subscriptions[queryName] = []
      }
      this.subscriptions[queryName].push(view)
      return subscriptionId
    },
    /**
     * Unsubscribe this view to a new GraphQL query.
     * @param {string} queryName - Must be in QUERIES.
     * @param {number} subscriptionId - Subscription ID.
     */
    unsubscribe (queryName, subscriptionId) {
      if (queryName in this.subscriptions) {
        this.$workflowService.unsubscribe(subscriptionId)
      }
    },
    /** Toggle the isLoading state.
     * @param {bool} isActive - Are this views subs active.
     */
    setActive (isActive) {
      this.isLoading = !isActive
    }
  }
}
</script>
