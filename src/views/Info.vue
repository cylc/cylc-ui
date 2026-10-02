<!--
Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.

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
  <InfoComponent
    v-if="taskNode.id"
    :task="taskNode"
    :panelExpansion="panelExpansion"
    @update:panelExpansion="updatePanelExpansion"
  />
</template>

<script>
import gql from 'graphql-tag'
import { useWorkflowVariables } from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import { SubscriptionQuery } from '@/model/SubscriptionQuery.model'
import {
  initialOptions,
  useInitialOptions,
} from '@/utils/initialOptions'
import { Tokens } from '@/utils/uid'

import InfoComponent from '@/components/cylc/Info.vue'

// NOTE: This query is run outside of the central data store
const QUERY = gql`
subscription InfoViewSubscription ($workflowID: ID, $taskID: ID) {
  deltas(workflows: [$workflowID]) {
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
  namespace
  state
  isHeld
  isQueued
  isRunahead
  isRetry
  isWallclock
  isXtriggered

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

  runtime {
    completion
    runMode
  }

  xtriggers {
    label
    id
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

function taskObjToNode (task) {
  const tokens = new Tokens(task.id)
  return {
    id: task.id,
    tokens,
    name: tokens.task,
    node: task,
    type: 'task',
    children: [],
  }
}

function jobObjToNode (job) {
  const tokens = new Tokens(job.id)
  return {
    id: job.id,
    name: tokens.job,
    tokens,
    node: job,
    type: 'job',
  }
}

function rebuildTaskChildren (taskNode, taskData) {
  taskNode.children = []
  for (const job of taskData.jobs) {
    taskNode.children.push(jobObjToNode(job))
  }
}

export default {
  name: 'InfoView',

  mixins: [
    subscriptionComponentMixin,
  ],

  components: {
    InfoComponent,
  },

  props: {
    initialOptions,
  },

  setup (props, { emit }) {
    const { variables } = useWorkflowVariables()

    const requestedTokens = useInitialOptions('requestedTokens', { props, emit })
    const panelExpansion = useInitialOptions('panelExpansion', { props, emit }, ['metadata'])

    return {
      requestedTokens,
      panelExpansion,
      variables,
    }
  },

  data () {
    return {
      // The task formatted as a data-store node
      task: {},
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
        {
          onDelta: ({ added, updated }) => {
            if (added) {
            // store the task info
              Object.assign(this.task, added.taskProxies[0])

              // construct a dummy "node" like to make it look like a node in the central data store
              Object.assign(this.taskNode, taskObjToNode(this.task))
              rebuildTaskChildren(this.taskNode, this.task)
            }
            if (updated) {
              if (updated?.taskProxies) {
                Object.assign(this.task, updated.taskProxies[0])
              }
              rebuildTaskChildren(this.taskNode, this.task)
            }
          },
        }
      )
    },
  },

  methods: {
    updatePanelExpansion (value) {
      this.panelExpansion = value
    },
  },
}
</script>
