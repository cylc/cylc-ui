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
  <div class="c-tree h-100 overflow-auto">
    <ViewToolbar
      class="toolbar"
      :groups="controlGroups"
      @setOption="setOption"
    />
    <TreeComponent
      class="tree"
      :workflows="workflows"
      :hoverable="false"
      :autoStripTypes="['workflow']"
      :node-filter-func="filterNode"
      :flat="flat"
      v-bind="{ expandAll, filterState }"
      ref="treeComponent"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import {
  mdiFormatAlignJustify,
  mdiFormatAlignRight,
  mdiMinus,
  mdiPlus,
} from '@mdi/js'
import gql from 'graphql-tag'
import graphqlMixin from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import {
  initialOptions,
  useInitialOptions
} from '@/utils/initialOptions'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import TreeComponent from '@/components/cylc/tree/Tree.vue'
import ViewToolbar from '@/components/cylc/ViewToolbar.vue'
import { matchID, matchState, groupStateFilters, globToRegex, useTasksFilterState } from '@/components/cylc/common/filter'

const QUERY = gql`
subscription Workflow ($workflowId: ID) {
  deltas (workflows: [$workflowId]) {
    id
    added {
      ...AddedDelta
    }
    updated (stripNull: true) {
      ...UpdatedDelta
    }
    pruned {
      ...PrunedDelta
    }
  }
}

fragment AddedDelta on Added {
  workflow {
    ...WorkflowData
  }
  familyProxies {
    ...FamilyProxyData
  }
  taskProxies {
    ...TaskProxyData
  }
  jobs {
    ...JobData
  }
}

fragment UpdatedDelta on Updated {
  workflow {
    ...WorkflowData
  }
  familyProxies {
    ...FamilyProxyData
  }
  taskProxies {
    ...TaskProxyData
  }
  jobs {
    ...JobData
  }
}

fragment PrunedDelta on Pruned {
  workflow
  familyProxies
  taskProxies
  jobs
}

fragment WorkflowData on Workflow {
  id
  reloaded
}

fragment FamilyProxyData on FamilyProxy {
  __typename
  id
  state
  ancestors {
    name
  }
  childTasks {
    id
  }
}

fragment TaskProxyData on TaskProxy {
  id
  state
  isHeld
  isQueued
  isRunahead
  isRetry
  isWallclock
  isXtriggered
  task {
    meanElapsedTime
  }
  firstParent {
    id
  }
  runtime {
    runMode
  }
  flowNums
}

fragment JobData on Job {
  id
  jobRunnerName
  jobId
  platform
  startedTime
  submittedTime
  finishedTime
  estimatedFinishTime
  state
  submitNum
  messages
  taskProxy {
    outputs (satisfied: true) {
      label
      message
    }
  }
}
`

export default {
  name: 'Tree',

  mixins: [
    graphqlMixin,
    subscriptionComponentMixin
  ],

  components: {
    TreeComponent,
    ViewToolbar,
  },

  props: { initialOptions },

  setup (props, { emit }) {
    /**
     * The job id input and selected task filter state.
     * @type {import('vue').Ref<Object>}
     */
    const tasksFilter = useInitialOptions('tasksFilter', { props, emit }, { id: null, states: null })
    const filterState = useTasksFilterState(tasksFilter)

    const flat = useInitialOptions('flat', { props, emit }, false)

    return {
      tasksFilter,
      filterState,
      flat,
    }
  },

  data: () => ({
    expandAll: null,
  }),

  computed: {
    ...mapState('workflows', ['cylcTree']),
    ...mapGetters('workflows', ['getNodes']),

    workflowIDs () {
      return [this.workflowId]
    },

    workflows () {
      return this.getNodes('workflow', this.workflowIDs)
    },

    query () {
      return new SubscriptionQuery(
        QUERY,
        this.variables,
        'workflow',
        [],
        /* isDelta */ true,
        /* isGlobalCallback */ true
      )
    },

    controlGroups () {
      return [
        {
          title: 'Filter',
          controls: [
            {
              title: 'Filter By ID',
              action: 'taskIDFilter',
              key: 'taskIDFilter',
              value: this.tasksFilter.id
            },
            {
              title: 'Filter By State',
              action: 'taskStateFilter',
              key: 'taskStateFilter',
              value: this.tasksFilter.states,
            },
          ],
        },
        {
          title: 'Tree',
          controls: [
            {
              title: 'Toggle Families',
              icon: {
                true: mdiFormatAlignJustify,
                false: mdiFormatAlignRight
              },
              action: 'toggle',
              value: this.flat,
              key: 'flat'
            },
            {
              title: 'Expand All',
              key: 'ExpandAll',
              icon: mdiPlus,
              action: 'callback',
              callback: this.treeExpandAll,
            },
            {
              title: 'Collapse All',
              key: 'CollapseAll',
              icon: mdiMinus,
              action: 'callback',
              callback: this.treeCollapseAll,
            },
          ]
        }
      ]
    },
  },

  methods: {
    setOption (option, value) {
      if (option === 'taskStateFilter') {
        this.tasksFilter.states = value
      } else if (option === 'taskIDFilter') {
        this.tasksFilter.id = value
      } else {
        this[option] = value
      }
    },

    treeExpandAll () {
      this.expandAll = ['workflow', 'cycle', 'family']
    },

    treeCollapseAll () {
      this.expandAll = []
    },

    /**
     * Recursively set the filtered out cache for this node and its children if applicable.
     *
     * @param {Object} node
     * @param {WeakMap<Object, boolean>} filteredOutNodesCache - cache of nodes' filtered status
     * @param {boolean} parentsIDMatch - whether any parents of this node
     * match the ID filter.
     * @return {boolean} - whether this node matches the filter.
     */
    filterNode (node, filteredOutNodesCache, parentsIDMatch = false) {
      if (node.type === 'job') {
        // jobs are always included and don't contribute to the filtering
        return false
      }

      const [states, waitingStateModifiers, genericModifiers] = groupStateFilters(
        this.tasksFilter.states?.length ? this.tasksFilter.states : []
      )

      const stateMatch = matchState(node, states, waitingStateModifiers, genericModifiers)
      // This node should be included if any parent matches the ID filter
      const idMatch = parentsIDMatch || matchID(node, globToRegex(this.tasksFilter.id))
      let isMatch = stateMatch && idMatch

      let { children } = node
      if (node.type === 'cycle') {
        // follow the family tree from cycle point nodes
        children = node.familyTree[0]?.children
      }
      if (children) {
        for (const child of children) {
          isMatch = this.filterNode(child, filteredOutNodesCache, idMatch) || isMatch
          // Note: do not break early as we must run the filter over all children
        }
      }

      filteredOutNodesCache.set(node, !isMatch)
      return isMatch
    },
  },

  icons: {
    mdiFormatAlignJustify,
    mdiFormatAlignRight,
    mdiMinus,
    mdiPlus,
  },
}
</script>

<style scoped lang="scss">
.c-tree {
  .toolbar {
    position: sticky;
    top: 0;
    padding: 0.5em;
    background: white;
    z-index: 1;
  }
  .tree {
    width: 100%;
    padding: 0 0.5em;
  }
}
</style>
