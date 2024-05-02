<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <div class="c-info">
    <div v-if="task.id">
      <!-- The task summary

      * The "-40" comes from the GraphNode offset, see the GraphNode compoent.
      * The height is "200" + "40".
      * The "99999" is the maximum component width (the xMinYMin value prevents
        this from taking up more horizontal space than it requires).
      * The "8em" is the height that this SVG will be scaled to fill.
      -->
      <svg
        preserveAspectRatio="xMinYMin"
        viewBox="-40 -40 99999 200"
        height="8em"
      >
        <GraphNode
          :task="taskNode"
          :jobs="jobNodes"
          :jobTheme="jobTheme"
        />
      </svg>
      <br />

      <!-- The task information -->
      <v-expansion-panels
        multiple
        variant="accordion"
        v-model="panelExpansion"
      >
        <!-- The metadata -->
        <v-expansion-panel class="metadata-panel">
          <v-expansion-panel-title color="blue-grey-lighten-1">
            Metadata
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <dl>
              <dt>Title</dt>
              <dd>{{ taskMetadata.title }}</dd>
              <v-divider />
              <dt>Description</dt>
              <dd><span class="markup">{{ taskMetadata.description }}</span></dd>
              <v-divider />
              <dt>URL</dt>
              <dd>
                <!--
                    NOTE: for security reasons, always display the full URL
                    that the link directs to
                -->
                <a
                  v-if="taskMetadata.URL"
                  :href="taskMetadata.URL"
                  target="_blank"
                >
                  {{ taskMetadata.URL }}
                </a>
              </dd>
              <v-divider />
              <template v-for="(value, key) in customMetadata" :key="key">
                <dt>{{ key }}</dt>
                <dd><span class="markup">{{ value }}</span></dd>
                <v-divider />
              </template>
            </dl>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- The prereqs -->
        <v-expansion-panel class="prerequisites-panel">
          <v-expansion-panel-title color="blue-grey-lighten-2">
            Prerequisites
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ul>
              <li v-for="prereq in prerequisites" :key="prereq.expression">
                <span
                  class="prerequisite-alias condition"
                  :class="{satisfied: prereq.satisfied}"
                >{{ prereq.expression }}</span>
                <ul>
                  <li
                    v-for="condition in prereq.conditions"
                    :key="condition.taskAlias"
                  >
                    <span
                      class="prerequisite-alias condition"
                      :class="{satisfied: condition.satisfied}"
                    >
                      {{ condition.exprAlias }}
                    </span>
                    <span style="margin-left: 0.5em">
                      {{ condition.taskId }}:{{ condition.reqState }}
                    </span>
                  </li>
                </ul>
              </li>
            </ul>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- The outputs -->
        <v-expansion-panel class="outputs-panel">
          <v-expansion-panel-title color="blue-grey-lighten-1">
            Outputs
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ul>
              <li v-for="output in outputs" :key="output.label">
                <span
                  class="condition"
                  :class="{satisfied: output.satisfied}"
                >{{ output.label }}</span>
              </li>
            </ul>
          </v-expansion-panel-text>
        </v-expansion-panel>

      </v-expansion-panels>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { getPageTitle } from '@/router/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import DeltasCallback from '@/services/callbacks'
import {
  initialOptions,
  useInitialOptions
} from '@/utils/initialOptions'
import { Tokens } from '@/utils/uid'
import { useJobTheme } from '@/composables/localStorage'
import GraphNode from '@/components/cylc/GraphNode.vue'

// NOTE: This query is run outside of the central data store
const QUERY = gql`
subscription InfoViewSubscription ($workflowId: ID, $taskID: ID) {
  deltas(workflows: [$workflowId]) {
    added {
      ...AddedDelta
    }
    updated (stripNull: true) {
      ...UpdatedDelta
    }
  }
}

fragment AddedDelta on Added {
  taskProxies(ids: [$taskID]) {
    ...TaskProxyData
  }
}

fragment UpdatedDelta on Updated {
  taskProxies(ids: [$taskID]) {
    ...TaskProxyData
  }
}

fragment TaskProxyData on TaskProxy {
  id
  state
  isHeld
  isQueued
  isRunahead

  task {
    ...TaskDefinitionData
  }

  jobs {
    ...JobData
  }

  prerequisites {
    satisfied
    expression
    conditions {
      taskId
      reqState
      exprAlias
      satisfied
    }
  }

  outputs {
    label
    satisfied
  }
}

fragment TaskDefinitionData on Task {
  meanElapsedTime

  meta {
    title
    description
    URL
    userDefined
  }
}

fragment JobData on Job {
  id
  jobId
  startedTime
  state
}
`

/** Callback for assembling the log file from the subscription */
class InfoCallback extends DeltasCallback {
  /**
   * @param {Results} results
   */
  constructor (task, node) {
    super()
    this.task = task
    this.taskNode = node
  }

  onAdded (added, store, errors) {
    // store the task info
    Object.assign(this.task, added.taskProxies[0])

    // construct a dummy "node" like to make it look like a node in the
    // central data store
    this.taskNode.id = this.task.id
    this.taskNode.tokens = new Tokens(this.task.id)
    this.taskNode.name = this.taskNode.tokens.task
    this.taskNode.node = this.task
  }

  onUpdated (updated, store, errors) {
    if (updated?.taskProxies) {
      Object.assign(this.task, updated.taskProxies[0])
    }
  }

  onPruned (pruned) {
  }
}

export default {
  name: 'InfoView',

  mixins: [
    graphqlMixin,
    subscriptionComponentMixin
  ],

  components: {
    GraphNode,
  },

  head () {
    return {
      // This sets the page title.
      title: getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  props: {
    initialOptions,
  },

  setup (props, { emit }) {
    const requestedTokens = useInitialOptions('requestedTokens', { props, emit })
    const panelExpansion = useInitialOptions('panelExpansion', { props, emit }, [0])
    return {
      requestedTokens,
      jobTheme: useJobTheme(),
      panelExpansion,
    }
  },

  data () {
    return {
      // This is the task we will request metadata for.
      // when you change these values, the old query will be automatically canceled
      // and re-issued with the new values
      requestedCycle: undefined,
      requestedTask: undefined,

      // This is where the task data will be put when it arrives
      task: {},

      // The task formatted as a data-store node
      taskNode: {},
    }
  },

  computed: {
    // This registers the query with the WorkflowService, once registered, the
    // WorkflowService promises to make the data defined by the query available
    // in the store and to keep it up to date.
    query () {
      return new SubscriptionQuery(
        QUERY,
        { ...this.variables, taskID: this.requestedTokens?.relativeID },
        `info-query-${this._uid}`,
        [
          new InfoCallback(this.task, this.taskNode)
        ],
        /* isDelta */ true,
        /* isGlobalCallback */ false
      )
    },

    jobNodes () {
      // The task's jobs in the format of a data store-node
      const ret = []
      let tokens
      for (const job of this.task.jobs) {
        tokens = new Tokens(job.id)
        ret.push({
          id: job.id,
          name: tokens.job,
          tokens,
          node: { job }
        })
      }
      return ret
    },

    latestJob () {
      // NOTE: we cannot use the latestJob function here because the job is
      // not gaurenteed to be in the central data store (this data comes from a
      // custom query)
      if (!this.task.id) {
        return undefined
      }
      return this.task?.jobs?.[0]
    },

    taskMetadata () {
      // Default task metadata sections (title, description, URL)
      return this.task?.task?.meta || {}
    },

    customMetadata () {
      // Used-defined task metadata sections
      return this.task?.task?.meta.userDefined || {}
    },

    prerequisites () {
      // Task prerequsite information.
      return this.task?.prerequisites || {}
    },

    outputs () {
      // Task output information.
      return this.task?.outputs || {}
    },

  },

}
</script>

<style scoped lang="scss">
  .c-info {
    // for user-defined text where whitespace should be preserved
    .markup {
      white-space: pre;
    }

    // prefixes a tick or cross before the entry
    .condition:before {
      content: '✕';
      padding-right: 0.5em;
      color: rgb(255, 100, 100);
    }
    .condition.satisfied:before {
      content: '✓';
      color: rgb(75, 230, 75);
    }

    // for prerequsite task "aliases" (used in conditional expressions)
    .prerequisite-alias {
      font-style: italic;
      color: rgb(100, 100, 255);
    }

    .metadata-panel {
      dl {
        dt dd {
          padding-left: 1em;
          padding-right: 1em;
        }
        dt {
          font-size: 1.3em;
          padding-top: 0.4em;
        }
        dd {
          padding-bottom: 0.4em;
        }
      }
    }

    .prerequisites-panel {
      li {
        list-style: none;
      }

      ul li ul {
        margin-left: 2em;
      }
    }

    .outputs-panel {
      li {
        list-style: none;
      }
    }
  }
</style>
