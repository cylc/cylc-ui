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
  <graph :workflow-name="workflowName"></graph>
</template>

<script>
import Graph from '@/components/cylc/graph/Graph'
import { mixin } from '@/mixins'
import { WORKFLOW_GRAPH_QUERY } from '@/graphql/queries'
import { mapState } from 'vuex'

const QUERIES = {
  root: WORKFLOW_GRAPH_QUERY
}

export default {
  mixins: [mixin],

  components: {
    Graph
  },

  props: {
    workflowName: {
      type: String,
      required: true
    }
  },

  metaInfo () {
    return {
      title: this.getPageTitle('App.graph', { name: this.workflowName })
    }
  },

  data: () => ({
    viewID: '',
    subscriptions: {},
    isLoading: true
  }),

  computed: {
    ...mapState('user', ['user'])
  },

  created () {
    this.viewID = `Graph(${this.workflowName}): ${Math.random()}`
    this.$workflowService.register(
      this,
      {
        activeCallback: this.setActive
      }
    )
    this.subscribe('root')
  },

  beforeRouteLeave (to, from, next) {
    this.$workflowService.unregister(this)
    next()
  },

  methods: {
    subscribe (queryName) {
      const workflowId = `${this.user.username}|${this.workflowName}`
      const id = this.$workflowService.subscribe(
        this,
        QUERIES[queryName].replace('WORKFLOW_ID', workflowId)
      )
      if (!(queryName in this.subscriptions)) {
        this.subscriptions[queryName] = {
          id
        }
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
