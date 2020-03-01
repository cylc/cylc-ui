<template>
  <graph :workflow-name="workflowName"></graph>
</template>

<script>
import Graph from '@/components/cylc/graph/Graph'
import { mixin } from '@/mixins'
import { WORKFLOW_GRAPH_QUERY } from '@/graphql/queries'

const QUERIES = {
  root: WORKFLOW_GRAPH_QUERY
}

export default {
  mixins: [mixin],

  components: {
    Graph
  },

  props: {
    workflowName: {
      type: String,
      required: true
    }
  },

  metaInfo () {
    return {
      title: this.getPageTitle('App.graph', { name: this.workflowName })
    }
  },

  data: () => ({
    viewID: '',
    subscriptions: {},
    isLoading: true
  }),

  created () {
    this.viewID = `Graph(${this.workflowName}): ${Math.random()}`
    this.$workflowService.register(
      this,
      {
        activeCallback: this.setActive
      }
    )
    this.subscribe('root')
  },

  beforeDestroy () {
    this.$workflowService.unregister(this)
  },

  methods: {
    subscribe (queryName) {
      const id = this.$workflowService.subscribe(
        this,
        QUERIES[queryName].replace('WORKFLOW_ID', this.workflowName)
      )
      if (!(queryName in this.subscriptions)) {
        this.subscriptions[queryName] = {
          id
        }
      }
    },

    unsubscribe (queryName) {
      if (queryName in this.subscriptions) {
        this.$workflowService.unsubscribe(
          this.subscriptions[queryName].id
        )
      }
    },

    setActive (isActive) {
      /** Toggle the isLoading state.
       * @param {bool} isActive - Are this views subs active.
       */
      this.isLoading = !isActive
    }
  }
}
</script>
