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
  <div>
    <div class="c-tree">
      <tree
        :workflows="treeData"
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
import { mixin } from '@/mixins'
import { mapState } from 'vuex'
import Tree from '@/components/cylc/tree/Tree'
import { WORKFLOW_TREE_QUERY } from '@/graphql/queries'
import { convertGraphQLWorkflowToTree } from '@/components/cylc/tree'

// query to retrieve all workflows
const QUERIES = {
  root: WORKFLOW_TREE_QUERY
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
    isLoading: true,
    treeData: []
  }),

  computed: {
    ...mapState('user', ['user']),
    ...mapState('workflows', ['workflows'])
  },

  watch: {
    workflows: {
      deep: true,
      immediate: true,
      handler (newValue) {
        this.workflowUpdated(newValue)
      }
    }
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
    workflowUpdated (workflows) {
      for (const workflow of workflows) {
        if (workflow.name === this.workflowName) {
          this.treeData = convertGraphQLWorkflowToTree(workflow)
        }
      }
    },

    /**
     * Subscribe this view to a new GraphQL query.
     * @param {string} queryName - Must be in QUERIES.
     */
    subscribe (queryName) {
      if (!(queryName in this.subscriptions)) {
        const workflowId = `${this.user.username}|${this.workflowName}`
        this.subscriptions[queryName] =
          this.$workflowService.subscribe(
            this,
            QUERIES[queryName].replace('WORKFLOW_ID', workflowId)
          )
      }
    },

    /**
     * Unsubscribe this view to a new GraphQL query.
     * @param {string} queryName - Must be in QUERIES.
     */
    unsubscribe (queryName) {
      if (queryName in this.subscriptions) {
        this.$workflowService.unsubscribe(
          this.subscriptions[queryName]
        )
      }
    },

    /** Toggle the isLoading state.
     * @param {bool} isActive - Are this views subs active.
     */
    setActive (isActive) {
      this.isLoading = !isActive
    }
  }
}
</script>
