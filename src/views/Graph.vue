<template>
  <graph :workflow-name="workflowName"></graph>
</template>

<script>
import Graph from '@/components/cylc/graph/Graph'
import { mixin } from '@/mixins'

const QUERIES = {
  root: `
  subscription {
    workflows(ids: ["WORKFLOW_ID"]) {
      id
      status
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
    }
  }
`
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
