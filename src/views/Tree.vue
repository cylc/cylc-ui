<template>
  <div>
    <toolbar />
    <div class="c-tree">
      <tree
        :workflows="currentWorkflow"
        :hoverable="false"
        :activable="false"
        :multiple-active="false"
        :min-depth="1"
        ref="tree0"
        key="tree0"
      ></tree>
    </div>
  </div>
</template>

<script>
import { workflowService } from 'workflow-service'
import { mixin } from '@/mixins/index'
import { mapState } from 'vuex'
import Tree from '@/components/cylc/Tree'
import Toolbar from '@/components/cylc/Toolbar'

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
  mixins: [mixin],
  components: {
    toolbar: Toolbar,
    tree: Tree
  },

  metaInfo () {
    const workflowName = this.$route.params.name
    return {
      title: this.getPageTitle('App.workflow', { name: workflowName })
    }
  },

  data: () => ({
    viewID: '',
    workflowId: '',
    subscriptions: {},
    isLoading: true
  }),

  computed: {
    ...mapState('workflows', ['workflowTree']),
    currentWorkflow: function () {
      for (const workflow of this.workflowTree) {
        if (workflow.name === this.$route.params.name) {
          return [workflow]
        }
      }
      return []
    }
  },

  created () {
    this.workflowId = this.$route.params.name
    this.viewID = `Tree(${this.workflowId}): ${Math.random()}`
    workflowService.register(
      this,
      {
        activeCallback: this.setActive
      }
    )
    this.subscribe('root')
  },

  beforeDestroy () {
    this.$refs.tree0.clearCaches()
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
              QUERIES[queryName].replace('WORKFLOW_ID', this.workflowId)
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
