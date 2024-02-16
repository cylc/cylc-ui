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
  <div class="h-100">
    {{this.workflowId}}
    <div>-----------optionsArrayfrom Component-----------</div>
    {{ this.optionsArray }}
    <div>-----------getOptions(this.workflowId)-----------</div>
    {{this.getOptions(this.workflowId)}}
    <div>-----------options-----------</div>
    {{ this.options }}
    <!-- {{optionsArray}} -->
    <v-container
      fluid
      class="c-tree pa-2"
      data-cy="tree-view"
    >
      <!-- Toolbar -->
      <v-row
        no-gutters
        class="d-flex flex-wrap"
      >
        <!-- Filters -->
        <v-col>
          <TaskFilter v-model="tasksFilter" />
        </v-col>
        <!-- Expand, collapse all -->
        <v-col class="flex-grow-0">
          <div
            class="d-flex flex-nowrap ml-2"
          >
            <v-btn
              @click="options.tree.expandAll.value = [ 'workflow', 'cycle', 'family' ] "
              icon
              variant="flat"
              size="small"
              data-cy="expand-all"
            >
              <v-icon size="x-large">{{ $options.icons.mdiPlus }}</v-icon>
              <v-tooltip>Expand all</v-tooltip>
            </v-btn>
            <v-btn
            @click="options.tree.expandAll.value = [] "
              icon
              variant="flat"
              size="small"
              data-cy="collapse-all"
            >
              <v-icon size="x-large">{{ $options.icons.mdiMinus }}</v-icon>
              <v-tooltip>Collapse all</v-tooltip>
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="mt-2"
      >
        <v-col
          cols="12"
          class="mh-100 position-relative"
        >
          <TreeComponent
            :workflows="workflows"
            :hoverable="false"
            :autoStripTypes="['workflow']"
            :node-filter-func="filterNode"
            v-bind="{ expandAll, filterState }"
            ref="treeComponent"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { mdiPlus, mdiMinus } from '@mdi/js'
import gql from 'graphql-tag'
import { getPageTitle } from '@/utils/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import TaskFilter from '@/components/cylc/TaskFilter.vue'
import TreeComponent from '@/components/cylc/tree/Tree.vue'
import { matchID, matchState } from '@/components/cylc/common/filter'
import useViewState from '@/composables/useViewState'
import { useViewStateLocalStore } from '@/composables/localStorage'

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
  task {
    meanElapsedTime
  }
  firstParent {
    id
  }
}

fragment JobData on Job {
  id
  jobRunnerName
  jobId
  platform
  startedTime
  submittedTime
  finishedTime
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
    TaskFilter,
    TreeComponent
  },

  head () {
    return {
      title: getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  setup () {
    const { optionsArray, getOptions, newOptions } = useViewState()
    return {
      optionsArray,
      getOptions,
      newOptions,
      viewStateLocalStore: useViewStateLocalStore()
    }
  },

  data: () => ({
    options: {},
  }),

  mounted () {
    // load or create new options object if changing components
    if (this.getOptions(this.workflowId)) {
      this.options = this.getOptions(this.workflowId).options
    } else {
      this.newOptions(this.workflowId)
      this.options = this.getOptions(this.workflowId).options
    }
    // load optionsArray from local sotrage if it exists
    if (localStorage.getItem('viewState')) {

      // console.log('-----MOUNTED and found viewState-----')
      // console.log(localStorage.getItem('viewState'))
      // console.log(JSON.parse(localStorage.getItem('viewState')))
      // this.optionsArray = JSON.parse(localStorage.getItem('viewState'))

      // this.optionsArray = JSON.parse(localStorage.getItem('viewState'))
      // if (this.getOptions(this.workflowId)) {
      //   this.options = this.getOptions(this.workflowId).options
      // } else {
      //   this.newOptions(this.workflowId)
      //   this.options = this.getOptions(this.workflowId).options
      // }
    } else { console.log('no viewState in local storage') }
  },

  watch: {
    // load or create new options object if changing workflows
    workflowId (newVal, oldVal) {
      if (this.getOptions(newVal)) {
        this.options = this.getOptions(newVal).options
      } else {
        this.newOptions(newVal)
        this.options = this.getOptions(newVal).options
      }
    },
    // save options to localStorage
    options: {
      handler: function (newVal, oldVal) {
        this.viewStateLocalStore = JSON.stringify(this.optionsArray)
      },
      deep: true
    }
  },

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

    filterState () {
      return (this.tasksFilter.id?.trim() || this.tasksFilter.states?.length)
        ? this.tasksFilter
        : null
    },

    expandAll () {
      return this.options.tree.expandAll.value
    },

    tasksFilter () {
      return this.options.tree.tasksFilter.value
    }
  },

  methods: {
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
      const stateMatch = matchState(node, this.tasksFilter.states)
      // This node should be included if any parent matches the ID filter
      const idMatch = parentsIDMatch || matchID(node, this.tasksFilter.id)
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
    mdiPlus,
    mdiMinus,
  },
}
</script>
