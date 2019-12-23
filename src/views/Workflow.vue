<template>
  <div id="workflow-panel" class="fill-height">
    <toolbar />
    <workflow :workflow-tree="workflowTree" />
  </div>
</template>

<script>
import { mixin } from '@/mixins/index'
import { mapState, mapGetters } from 'vuex'
import Toolbar from '@/components/cylc/Toolbar'
import Workflow from '@/components/cylc/workflow/Workflow'

// query to retrieve all workflows
const QUERIES = {
  root: `
    {
      workflows(ids: ["WORKFLOW_ID"]) {
        id
        name
        status
        owner
        host
        port
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
  name: 'Workflow',
  props: {
    workflowName: {
      type: String,
      required: true
    }
  },
  components: {
    toolbar: Toolbar,
    workflow: Workflow
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },
  data: () => ({
    viewID: '',
    subscriptions: {},
    isLoading: true
  }),
  computed: {
    ...mapState('workflows', ['workflows']),
    ...mapGetters('workflows', ['workflowTree'])
  },
  created () {
    this.viewID = `Workflow(${this.workflowName}): ${Math.random()}`
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
      /**
       * Subscribe this view to a new GraphQL query.
       * @param {string} queryName - Must be in QUERIES.
       */
      if (!(queryName in this.subscriptions)) {
        this.subscriptions[queryName] =
          this.$workflowService.subscribe(
            this,
            QUERIES[queryName].replace('WORKFLOW_ID', this.workflowName)
          )
      }
    },
    unsubscribe (queryName) {
      /**
       * Unsubscribe this view to a new GraphQL query.
       * @param {string} queryName - Must be in QUERIES.
       */
      if (queryName in this.subscriptions) {
        this.$workflowService.unsubscribe(
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
