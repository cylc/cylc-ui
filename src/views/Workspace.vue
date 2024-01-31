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
      :views="allViews"
      :workflow-name="workflowName"
      @add="addView"
    />
    <div
      class="workflow-panel"
      :style="$options.panelStyle"
    >
      <Lumino
        ref="lumino"
        @lumino:deleted="onWidgetDeletedEvent"
        :views="widgets"
        :workflow-name="workflowName"
        :allViews="allViews"
      />
    </div>
  </div>
</template>

<script>
import {
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { uniqueId } from 'lodash'
import { allViews, useDefaultView } from '@/views/views.js'
import { getPageTitle } from '@/utils/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionMixin from '@/mixins/subscription'
import ViewState from '@/model/ViewState.model'
import Lumino from '@/components/cylc/workflow/Lumino.vue'
import Toolbar from '@/components/cylc/workflow/Toolbar.vue'
import { toolbarHeight } from '@/utils/toolbar'

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

  setup () {
    const $eventBus = inject('eventBus')
    const $workflowService = inject('workflowService')

    /**
     * The widgets added to the view.
     *
     * @type {{ [id: string]: { view: string, initialOptions: Object } }}
     */
    const widgets = ref({})

    /** Template ref */
    const lumino = ref(null)

    onMounted(() => {
      $workflowService.startSubscriptions()
      addDefaultView()

      $eventBus.on('add-view', addView)
    })

    onBeforeUnmount(() => {
      $eventBus.off('add-view', addView)
    })

    onBeforeRouteUpdate((to, from) => {
      // start over again with the new deltas query/variables/new widget as in onMounted
      removeAllWidgets()
      addDefaultView()
    })

    onBeforeRouteLeave((to, from) => {
      removeAllWidgets()
    })

    /**
     * Add a new view widget.
     *
     * viewName - the name of the view to be added (Vue component name).
     */
    const addView = ({ viewName, initialOptions = {} }) => {
      widgets.value[uniqueId('widget_')] = { view: viewName, initialOptions }
    }

    const addDefaultView = () => {
      // in the next tick as otherwise we would get stale/old variables for the graphql query
      nextTick(() => {
        addView({ viewName: useDefaultView().value })
      })
    }

    /**
     * Remove all the widgets present in the DockPanel.
     */
    const removeAllWidgets = () => {
      Array.from(lumino.value.dock.widgets())
        .forEach(widget => widget.close())
    }

    return {
      addView,
      allViews,
      lumino,
      widgets,
    }
  },

  methods: {
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

  panelStyle: {
    height: `calc(100vh - ${toolbarHeight}px)`,
  },
}
</script>
