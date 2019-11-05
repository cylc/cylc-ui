<template>
  <v-app>
    <component :is="layout">
      <router-view/>
    </component>
  </v-app>
</template>

<script>
import { workflowService } from 'workflow-service'

const defaultLayout = 'empty'

const QUERIES = {
  root: `
    {
      workflows {
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
      }
    }
  `
}

export default {
  computed: {
    layout () {
      return (this.$route.meta.layout || defaultLayout) + '-layout'
    }
  },
  data () {
    return {
      viewID: '',
      subscriptions: {},
      isLoading: true
    }
  },
  created () {
    this.viewID = `App(*): ${Math.random()}`
    workflowService.register(
      this,
      {
        activeCallback: this.setActive
      }
    )
    this.subscribe('root')
  },
  beforeDestroy () {
    workflowService.unregister(this)
  },
  methods: {
    subscribe (queryName) {
      /**
       * Subscribe this view to a new GraphQL query.
       * @param {string} queryName - Must be in QUERIES.
       */
      if (!(queryName in this.subscriptions)) {
        this.subscriptions[queryName] =
          workflowService.subscribe(
            this,
            QUERIES[queryName]
          )
      }
    },

    unsubscribe (queryName) {
      /**
       * Unsubscribe this view to a new GraphQL query.
       * @param {string} queryName - Must be in QUERIES.
       */
      if (queryName in this.subscriptions) {
        workflowService.unsubscribe(
          this.subscriptions[queryName]
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

<style lang="scss">
  @import '~@/styles/index.scss';

  /* Remove in 1.2 */
  .v-datatable thead th.column.sortable i {
    vertical-align: unset;
  }
</style>
