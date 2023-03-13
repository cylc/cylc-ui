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
    <div class="c-tree pa-2 h-100" data-cy="tree-view">
      <tree-component
        :workflows="workflows"
        :hoverable="false"
        :activable="false"
        :multiple-active="false"
        :min-depth="1"
        :autoExpandTypes="['workflow', 'cycle', 'family']"
        :autoStripTypes="['workflow']"
        ref="tree0"
        key="tree0"
      ></tree-component>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { mdiFileTree } from '@mdi/js'
import { getPageTitle } from '@/utils/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import TreeComponent from '@/components/cylc/tree/Tree'
import { WORKFLOW_TREE_DELTAS_SUBSCRIPTION } from '@/graphql/queries'

export default {
  name: 'Tree',

  mixins: [
    graphqlMixin,
    subscriptionComponentMixin
  ],

  components: {
    TreeComponent
  },

  head () {
    return {
      title: getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  data () {
    return {
      widget: {
        title: 'tree',
        icon: mdiFileTree
      }
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
        WORKFLOW_TREE_DELTAS_SUBSCRIPTION,
        this.variables,
        'workflow',
        [],
        /* isDelta */ true,
        /* isGlobalCallback */ true
      )
    }
  }
}
</script>
