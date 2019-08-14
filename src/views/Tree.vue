<template>
  <div class="c-tree">
    <!-- TODO: add progress bar which displays with {{ isLoading }} -->
    <ul v-for="workflow in workflows" :key="workflow.id">
      <li v-if="workflow.name === workflowId">
        <!-- Workflow -->
        <span>
          {{ workflow.name }}
        </span>
        <ul v-if="workflow.taskProxies">
          <li v-for="cycle in cycles" :key="cycle">
            <!-- Cycle -->
            <span>
              {{ cycle }}
            </span>
            <ul v-for="proxy in workflow.taskProxies" :key="proxy.id">
              <li v-if="proxy.cyclePoint === cycle">
                <!-- Task -->
                <span>
                  <task :status="proxy.state" :progress=0 />
                  {{ proxy.task.name }}
                </span>
                <ul>
                  <li v-for="job in proxy.jobs" :key="job.id">
                    <!-- Job -->
                    <span>
                      # {{ job.submitNum }}
                      <job :status="job.state" />
                    </span>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { workflowService } from 'workflow-service'
import { mapState } from 'vuex'
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'
import { mixin } from '@/mixins/index'

// query to retrieve all workflows
const QUERIES = {
  root: `
      {
        workflows(ids: ["WORKFLOW_ID"]) {
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
    task: Task,
    job: Job
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
    cycles: function () {
      var cycles = new Set()
      for (const workflow of this.workflows) {
        if (workflow.name === this.workflowId) {
          for (const proxy of workflow.taskProxies) {
            cycles.add(proxy.cyclePoint)
          }
        }
      }
      return cycles
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
