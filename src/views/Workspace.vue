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
  <div data-cy="workspace-view">
    <Toolbar
      :views="$options.allViews"
      :workflow-name="workflowName"
      @add="this.addView"
      :initialOptions="{}"
    />
    <div class="workflow-panel">
      <Lumino
        ref="lumino"
        @lumino:deleted="onWidgetDeletedEvent"
        :views="widgets"
        tab-title-prop="tab-title"
        :workflow-name="workflowName"
        :allViews="$options.allViews"
      />
    </div>
  </div>
</template>

<script>
import { uniqueId } from 'lodash'
import { toArray } from '@lumino/algorithm'
import { getPageTitle } from '@/utils/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionMixin from '@/mixins/subscription'
import ViewState from '@/model/ViewState.model'
import Lumino from '@/components/cylc/workflow/Lumino'
import Toolbar from '@/components/cylc/workflow/Toolbar'
import TableView from '@/views/Table'
import TreeView from '@/views/Tree'
import GraphView from '@/views/Graph'
import LogView from '@/views/Log'

export default {
  name: 'Workspace',

  mixins: [
    graphqlMixin,
    subscriptionMixin
  ],

  components: {
    Lumino,
    Toolbar
  },

  head () {
    return {
      title: getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  props: {
    initialOptions: {
      type: Object,
      required: false,
      default: () => {}
    }
  },

  data: () => ({
    /**
     * The widgets added to the view.
     *
     * @type {{ [id: string]: { view: string, initialOptions: Object } }}
     */
    widgets: {}
  }),

  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$nextTick(() => {
        vm.addView({ viewName: TreeView.name })
      })
    })
  },

  beforeRouteUpdate (to, from) {
    this.removeAllWidgets()
    // start over again with the new deltas query/variables/new widget as in beforeRouteEnter
    // and in the next tick as otherwise we would get stale/old variables for the graphql query
    this.$nextTick(() => {
      // Create a Tree View for the current workflow by default
      this.addView({ viewName: TreeView.name })
    })
  },

  beforeRouteLeave (to, from) {
    this.removeAllWidgets()
  },

  mounted () {
    this.$eventBus.on('add-view', this.addView)
  },

  beforeUnmount () {
    this.$eventBus.off('add-view', this.addView)
  },

  methods: {
    /**
     * Add a new view widget.
     *
     * viewName - the name of the view to be added (Vue component name).
     */
    addView ({ viewName, initialOptions = {} }) {
      this.widgets[uniqueId()] = { view: viewName, initialOptions }
    },
    /**
     * Remove all the widgets present in the DockPanel.
     */
    removeAllWidgets () {
      toArray(this.$refs.lumino.dock.widgets())
        .forEach(widget => widget.close())
    },
    /**
     * Called for each widget removed. Each widget contains a subscription
     * attached. This method will check if it needs to cancel the
     * subscription (e.g. we removed the last widget using a deltas
     * subscription).
     *
     * Calling it might change the value of the `isLoading` data
     * attribute.
     *
     * @param {{
     *   id: string
     * }} event UI event containing the widget ID (string value, needs to be parsed)
     */
    onWidgetDeletedEvent (event) {
      delete this.widgets[event.id]
      // If we have no more widgets in the view, then we are not loading, not complete, not error,
      // but back to beginning. When a widget is added, if it uses a query, then the mixins will
      // take care to set the state to LOADING and then COMPLETE (and hopefully not ERROR).
      if (!Object.keys(this.widgets).length) {
        this.viewState = ViewState.NO_STATE
      }
    }
  },

  /**
   * A list of Vue views or components. These components must provide a .widget
   * property/data with the title and icon properties.
   *
   * Each view in this list will be available from the Toolbar to be added as
   * a widget.
   *
   * Note for peformance reasons this should not be in data() - we don't want
   * these to be made reactive as they are already Vue components.
   *
   * @type {Object[]}
   */
  allViews: [
    TreeView,
    TableView,
    GraphView,
    LogView
  ]
}
</script>
