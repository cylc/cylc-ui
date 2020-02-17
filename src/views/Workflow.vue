<template>
  <div id="workflow-panel" class="fill-height">
    <workflow :workflow-tree="workflowTree" ref="workflow-component" />
  </div>
</template>

<script>
import { mixin } from '@/mixins/index'
import { mapState, mapGetters } from 'vuex'
import Workflow from '@/components/cylc/workflow/Workflow'
import { EventBus } from '@/components/cylc/workflow/index'

// query to retrieve all workflows
const QUERIES = {
  tree: `
    subscription {
      workflows(ids: ["WORKFLOW_ID"]) {
        id
        name
        status
        owner
        host
        port
        taskProxies(sort: { keys: ["cyclePoint"] }) {
          id
          name
          state
          cyclePoint
          latestMessage
          firstParent {
            id
            name
            cyclePoint
            state
          }
          task {
            meanElapsedTime
            name
          }
          jobs(sort: { keys: ["submit_num"], reverse:true }) {
            id
            batchSysName
            batchSysJobId
            host
            startedTime
            submittedTime
            finishedTime
            state
            submitNum
          }
        }
        familyProxies (sort: { keys: ["firstParent"]}) {
          id
          name
          state
          cyclePoint
          firstParent {
            id
            name
            cyclePoint
            state
          }
        }
      }
    }
  `,
  graph: `
    subscription {
      workflows(ids: ["WORKFLOW_ID"]) {
        id
        name
        status
        owner
        host
        port
        nodesEdges {
          nodes {
            id
            label: id
            parent: firstParent {
              id
              state
            }
            state
            cyclePoint
            task {
              name
            }
            jobs(sort: {keys: ["submit_num"], reverse: true}) {
              id
              batchSysName
              batchSysJobId
              host
              startedTime
              submittedTime
              finishedTime
              state
              submitNum
            }
          }
          edges {
            id
            source
            target
            label: id
          }
        }
        taskProxies(sort: { keys: ["cyclePoint"] }) {
          id
          state
          cyclePoint
          latestMessage
          firstParent {
            id
            name
            cyclePoint
            state
          }
          task {
            meanElapsedTime
            name
          }
          jobs(sort: { keys: ["submit_num"], reverse:true }) {
            id
            batchSysName
            batchSysJobId
            host
            startedTime
            submittedTime
            finishedTime
            state
            submitNum
          }
        }
        familyProxies (sort: { keys: ["firstParent"]}) {
          id
          name
          state
          cyclePoint
          firstParent {
            id
            name
            cyclePoint
            state
          }
        }
      }
    }
  `
}

export default {
  mixins: [mixin],
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
    isLoading: true
  }),
  computed: {
    ...mapState('workflows', ['workflows']),
    ...mapGetters('workflows', ['workflowTree'])
  },
  created () {
    EventBus.$on('add:tree', () => {
      // subscribe GraphQL query
      const subscriptionId = this.subscribe('tree')
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
    EventBus.$on('delete:widget', (data) => {
      const subscriptionId = Number.parseFloat(data.id)
      this.$workflowService.unsubscribe(subscriptionId)
    })
  },
  mounted () {
    // Create a Tree View for the current workflow by default
    const subscriptionId = this.subscribe('tree')
    this.$nextTick(() => {
      this.$refs['workflow-component'].addTreeWidget(`${subscriptionId}`)
    })
  },
  beforeDestroy () {
    EventBus.$off('add:tree')
    EventBus.$off('add:graph')
    EventBus.$off('add:mutations')
    EventBus.$off('delete:widget')
    this.$workflowService.unregister(this)
  },
  methods: {
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
      const subscriptionId = this.$workflowService.subscribe(
        view,
        QUERIES[queryName].replace('WORKFLOW_ID', this.workflowName)
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
