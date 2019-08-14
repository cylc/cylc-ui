<template>
  <tree :workflows="workflowTree" :cycles="cycles" :hoverable="true"></tree>
</template>

<script>
import { workflowService } from 'workflow-service'
import { extractGroupState } from '@/utils/tasks'
import { mapState } from 'vuex'
import { mixin } from '@/mixins/index'
import Tree from '@/components/cylc/Tree'
import omit from 'lodash/omit'

// query to retrieve all workflows
const QUERIES = {
  root: `
      {
        workflows(ids: "WORKFLOW_ID") {
          id
          name
          status
          taskProxies {
            id
            state
            cyclePoint
            task {
              name
            }
            jobs {
              id
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
    ...mapState('workflows', ['workflows']),
    /**
     * Compute a map of cycles, where the key is the workflow ID, and the
     * value is the cyclepoint name.
     */
    cycles: function () {
      const cycles = new Map()
      for (const workflow of this.workflows) {
        if (!cycles.get(workflow.id)) {
          cycles.set(workflow.id, new Set())
        }
        for (const proxy of workflow.taskProxies) {
          cycles.get(workflow.id).add(proxy.cyclePoint)
        }
      }
      return cycles
    },
    /**
     * Compute a workflow tree where the root is the workflow node, followed by
     * the cycle points, and finally by task proxies.
     *
     * Every node has a .name property for display.
     */
    workflowTree: function () {
      const workflowTree = []
      for (const workflow of this.workflows) {
        // add workflow minus taskProxies, with children
        const simplifiedWorkflow = omit(workflow, 'taskProxies')
        simplifiedWorkflow.__type = 'workflow'
        simplifiedWorkflow.children = []
        for (const cyclePoint of this.cycles.get(workflow.id)) {
          const simplifiedCyclepoint = {
            name: cyclePoint,
            id: cyclePoint,
            state: '',
            children: [],
            __type: 'cyclepoint'
          }

          const childStates = []

          for (const taskProxy of workflow.taskProxies) {
            if (taskProxy.cyclePoint === cyclePoint) {
              const simplifiedTaskProxy = omit(taskProxy, ['jobs', 'task'])
              simplifiedTaskProxy.name = taskProxy.task.name
              simplifiedTaskProxy.children = []
              simplifiedTaskProxy.__type = 'task'
              for (const job of taskProxy.jobs.reverse()) {
                job.name = `#${job.submitNum}`
                job.__type = 'job'
                simplifiedTaskProxy.children.push(job)
              }
              simplifiedCyclepoint.children.push(simplifiedTaskProxy)

              childStates.push(taskProxy.state)
            }
          }

          simplifiedCyclepoint.state = extractGroupState(childStates, false)

          simplifiedWorkflow.children.push(simplifiedCyclepoint)
        }
        workflowTree.push(simplifiedWorkflow)
      }
      return workflowTree
    }
  },

  created () {
    // this.workflowId = this.$route.params.name
    this.viewID = `Tree(tree2): ${Math.random()}`
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
