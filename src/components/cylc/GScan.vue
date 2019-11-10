<template>
  <div>
    <div v-if="workflows && workflows.length > 0">
      <div v-for="workflow in workflows" :key="workflow.id">
        <v-list-item :to="`/workflows/${ workflow.name }`">
          <v-list-item-action>
            <!-- TODO: the workflows are always running now, but later we will need https://github.com/cylc/cylc-ui/issues/90 adn update the icon displayed here -->
            <v-icon>mdi-play-circle</v-icon>
          </v-list-item-action>
          <v-list-item-title>
            <v-layout align-center align-content-center wrap>
              <v-flex grow>{{ workflow.name }}</v-flex>
              <v-flex shrink ml-4>
                <!-- task summary tooltips -->
                <span
                  v-for="[state, tasks] in workflowsSummaries.get(workflow.name).entries()"
                  :key="`${workflow.name}-summary-${state}`"
                >
                  <v-tooltip color="black" top>
                    <template v-slot:activator="{ on }">
                      <!-- a v-tooltip does not work directly set on Cylc job component, so we use a dummy button to wrap it -->
                      <!-- NB: most of the classes/directives in these button are applied so that the user does not notice it is a button -->
                      <v-btn
                          v-on="on"
                          class="mt-1 pa-0"
                          elevation="0"
                          min-width="0"
                          min-height="0"
                          style="font-size: 120%"
                          :ripple="false"
                          small
                          dark
                          text>
                        <job :status="state" />
                      </v-btn>
                    </template>
                    <!-- tooltip text -->
                    <span>
                      <span class="grey--text">Recent {{ state }} tasks:</span>
                      <br/>
                      <span v-for="(task, index) in tasks" :key="index">
                        {{ task }}<br v-if="index !== tasks.length -1" />
                      </span>
                    </span>
                  </v-tooltip>
                </span>
              </v-flex>
            </v-layout>
          </v-list-item-title>
        </v-list-item>
      </div>
    </div>
    <!-- when no workflows are returned in the GraphQL query -->
    <div v-else>
      <v-list-item>
        <v-list-item-title class="grey--text">No workflows found</v-list-item-title>
      </v-list-item>
    </div>
  </div>
</template>

<script>
import Job from '@/components/cylc/Job'
import { workflowService } from 'workflow-service'

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
  name: 'GScan',
  components: {
    job: Job
  },
  props: {
    /**
     * Vanilla workflows object from GraphQL query
     */
    workflows: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      viewID: '',
      subscriptions: {},
      isLoading: true
    }
  },
  computed: {
    /**
     * Compute summary information, where the key is the name of a workflow, the value is another map with the summary.
     * @returns {Map<String, Map>}
     */
    workflowsSummaries () {
      const workflowSummaries = new Map()
      for (const workflow of this.workflows) {
        const states = new Map()
        for (const taskProxy of workflow.taskProxies) {
          for (const job of taskProxy.jobs) {
            if (!states.has(job.state)) {
              states.set(job.state, new Set())
            }
            states.get(job.state).add(`${taskProxy.name}.${taskProxy.cyclePoint}`)
          }
        }
        workflowSummaries.set(workflow.name, states)
      }
      return workflowSummaries
    }
  },
  created () {
    this.viewID = `GScan(*): ${Math.random()}`
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
