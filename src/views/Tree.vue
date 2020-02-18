<template>
  <div>
    <div class="c-tree">
      <tree
        :workflows="workflowTree"
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
import { mixin } from '@/mixins/index'
import { mapGetters } from 'vuex'
import Tree from '@/components/cylc/tree/Tree'

// query to retrieve all workflows
const QUERIES = {
  root: `
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
    `
}

export default {
  mixins: [mixin],

  props: {
    workflowName: {
      type: String,
      required: true
    }
  },

  components: {
    tree: Tree
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
    ...mapGetters('workflows', ['workflowTree'])
  },

  created () {
    this.viewID = `Tree(${this.workflowName}): ${Math.random()}`
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
