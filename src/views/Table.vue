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
    <CylcObjectMenu />
    <div class="c-table h-100">
      <table-component
        :tasks="tasks"
        ref="table0"
        key="table0"
      ></table-component>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { mdiTable } from '@mdi/js'
import pageMixin from '@/mixins/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionViewMixin from '@/mixins/subscriptionView'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import TableComponent from '@/components/cylc/table/Table'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import CylcObjectMenu from '@/components/cylc/cylcObject/Menu'
import WorkflowCallback from '@/components/cylc/common/callbacks'
import TableCallback from '@/components/cylc/table/callbacks'
// import { WORKFLOW_TABLE_DELTAS_SUBSCRIPTION } from '@/graphql/queries'
import { WORKFLOW_TREE_DELTAS_SUBSCRIPTION } from '../graphql/queries'

export default {
  mixins: [
    pageMixin,
    graphqlMixin,
    subscriptionComponentMixin,
    subscriptionViewMixin
  ],
  name: 'Table',
  components: {
    CylcObjectMenu,
    TableComponent
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },
  data: () => ({
    widget: {
      title: 'table',
      icon: mdiTable
    }
  }),
  computed: {
    ...mapState('table', ['table']),
    tasks () {
      return Object.values(this.table)
    },
    query () {
      return new SubscriptionQuery(
        // this is disabled for now as differences in the fragment names are causing the
        // subscription to be reloaded when its merged. This will need to be re-enabled in
        // future, if we need more information then the currently active WORKFLOW_TREE_DELTAS_SUBSCRIPTION provides
        // WORKFLOW_TABLE_DELTAS_SUBSCRIPTION,
        WORKFLOW_TREE_DELTAS_SUBSCRIPTION,
        this.variables,
        // we really should consider giving these unique names, as technically they are just use as the subscription names
        // By using a unique name, we can avoid callback merging errors like the one documented line 350 in the workflow.service.js file
        'workflow',
        [
          new WorkflowCallback(),
          new TableCallback()
        ]
      )
    }
  }
}
</script>
