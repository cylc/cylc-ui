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
    <workflow-component
      :workflow-name="workflowName"
      :workflow-tree="workflowTree"
      :is-loading="isLoading"
      ref="workflow-component" />
  </div>
</template>

<script>
import { mixin } from '@/mixins'
import { treeview } from '@/mixins/treeview'
import { mapState } from 'vuex'
import WorkflowComponent from '@/components/cylc/workflow/Workflow'
import { EventBus } from '@/components/cylc/workflow'
import {
  WORKFLOW_GRAPH_QUERY,
  WORKFLOW_TREE_DELTAS_SUBSCRIPTION
} from '@/graphql/queries'
import CylcTree from '@/components/cylc/tree/tree'
/* eslint-disable no-unused-vars */
import ZenObservable from 'zen-observable'
/* eslint-enable no-unused-vars */

export default {
  mixins: [
    mixin,
    treeview
  ],

  name: 'Workflow',

  props: {
    workflowName: {
      type: String,
      required: true
    }
  },

  components: {
    workflowComponent: WorkflowComponent
  },

  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },
  data: () => ({
    subscriptions: {},
    subscriptionIds: [],
    isLoading: true,
    /**
     * This holds the view's only active deltas subscription. It must be stopped when
     * the user navigates away to avoid memory leaks.
     * @type {null|ZenObservable.Subscription}
     */
    subscription: null,
    /**
     * This is the CylcTree, which contains the hierarchical tree data structure.
     * It is created from the GraphQL data, with the only difference that this one
     * contains hierarchy, while the GraphQL is flat-ish.
     *
     * It is passed down to the widgets-components created. This data structure
     * contains the data and methods used to add, remove, and update the tree.
     * If this data gets put into the Vuex store, Vuex might remove the methods
     * as it is intended for data, not for computation storage.
     *
     * @type {null|CylcTree}
     */
    tree: new CylcTree()
  }),
  computed: {
    ...mapState('workflows', ['workflows'])
  },
  created () {
    const vm = this
    EventBus.$on('add:tree', () => {
      vm.addTreeWidget()
    })
    EventBus.$on('add:graph', () => {
      // subscribe GraphQL query
      const subscriptionId = this.subscribe('graph')
      this.subscriptionIds.push(subscriptionId)
      // add widget that uses the GraphQl query response
      this.$refs['workflow-component'].addGraphWidget(`${subscriptionId}`)
    })
    EventBus.$on('add:mutations', () => {
      // no subscription for this view ATM as we are using the centrally
      // defined schema
      // on day it will become a one-off query (though a subscription would work
      // too as the schema doesn't change during the lifetime of a workflow run
      const subscriptionId = (new Date()).getTime()
      this.subscriptionIds.push(subscriptionId)
      // add widget that uses the GraphQl query response
      this.$refs['workflow-component'].addMutationsWidget(`${subscriptionId}`)
    })
    EventBus.$on('delete:tree', (data) => {
      vm.removeTreeWidget(Number.parseFloat(data.id))
    })
    EventBus.$on('delete:graph', (data) => {
      const subscriptionId = Number.parseFloat(data.id)
      this.$workflowService.unsubscribe(subscriptionId)
      this.subscriptionIds.splice(this.subscriptionIds.indexOf(subscriptionId), 1)
    })
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.addTreeWidget()
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.isLoading = true
    next()
  },
  beforeRouteLeave (to, from, next) {
    EventBus.$off('add:tree')
    EventBus.$off('add:graph')
    EventBus.$off('add:mutations')
    EventBus.$off('delete:tree')
    EventBus.$off('delete:graph')
    this.subscriptionIds.forEach((subscriptionId) => {
      this.$workflowService.unsubscribe(subscriptionId)
    })
    this.$workflowService.unregister(this)
    if (this.subscription !== null) {
      this.subscription.unsubscribe()
      this.subscription = null
    }
    next()
  },
  methods: {
    addTreeWidget () {
      if (this.subscription === null) {
        this
          .startDeltasSubscription(WORKFLOW_TREE_DELTAS_SUBSCRIPTION, this.variables, this.tree)
          .then(subscription => {
            this.subscription = subscription
            this.isLoading = false
          })
      }
      this.$nextTick(() => {
        this.$refs['workflow-component'].addTreeWidget(`${new Date().getTime()}`)
      })
    },
    removeTreeWidget () {
      const componentRef = this.$refs['workflow-component']
      componentRef.removeTreeWidget(`${new Date().getTime()}`)
      if (this.subscription !== null && componentRef.treeWidgetIds.length === 0) {
        this.subscription.unsubscribe()
        this.subscription = null
      }
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
        WORKFLOW_GRAPH_QUERY.replace('WORKFLOW_ID', workflowId)
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
