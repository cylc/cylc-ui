<template>
  <div class="c-tree">
    <ul v-for="workflow in workflows" :key="workflow.id">
      <li v-if="workflow.name === workflowId">
        <!-- Workflow -->
        <span>
          {{ workflow.name }}
        </span>
        <ul>
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

  // query to retrieve all workflows
  const QUERIES = {
    'root': `
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
    components: {
      'task': Task,
      'job': Job
    },

    metaInfo () {
      return {
        'title': 'Tree View'
      }
    },

    data: () => ({
      viewId: '',
      workflowId: '',
      subscriptions: {}
    }),

    computed: {
      ...mapState('workflows', ['workflows']),
      cycles: function() {
        var cycles = new Set();
        for (let workflow of this.workflows) {
          if (workflow.name === this.workflowId) {
            for (let proxy of workflow.taskProxies) {
              cycles.add(proxy.cyclePoint);
            }
          }
        }
        return cycles;
      }
    },

    created() {
      this.workflowId = this.$route.params.name;
      this.viewId = `Tree(${this.workflowId}): ${Math.random()}`;
      workflowService.register(this);
      this.subscribe('root');
    },

    beforeDestroy() {
      workflowService.unregister(this);
    },

    methods: {
      subscribe(query_name) {
        /* Subscribe this view to a new GraphQL query.
         * Query name must be in QUERIES. */
        if (!(query_name in this.subscriptions)) {
          this.subscriptions[query_name] =
            workflowService.subscribe(
              this,
              QUERIES[query_name].replace('WORKFLOW_ID', this.workflowId)
            );
        }
      },

      unsubscribe(query_name) {
        /* Unsubscribe this view to a new GraphQL query.
         * Query name must be in QUERIES. */
        if (query_name in this.subscriptions) {
          workflowService.unsubscribe(
            this.subscriptions[query_name]
          );
        }
      }
    }
  }
</script>
