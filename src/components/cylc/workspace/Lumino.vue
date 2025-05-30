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
  <div ref="mainDiv" class="main pa-2 fill-height">
    <!-- Lumino box panel gets inserted here -->
  </div>
  <WidgetComponent
    v-for="[id, { name }] in views"
    :key="id"
    :id="id"
  >
    <component
      :is="props.allViews.get(name).component"
      :workflow-name="workflowName"
      v-model:initial-options="views.get(id).initialOptions"
      class="h-100"
    />
  </WidgetComponent>
</template>

<script setup>
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import { useStore } from 'vuex'
import { startCase, uniqueId } from 'lodash'
import WidgetComponent from '@/components/cylc/workspace/Widget.vue'
import LuminoWidget from '@/components/cylc/workspace/lumino-widget'
import { BoxPanel, DockPanel, Widget } from '@lumino/widgets'
import { useDefaultView } from '@/views/views'
import { eventBus } from '@/services/eventBus'

import '@lumino/default-theme/style'

/*
 * A component to wrap the Lumino application.
 *
 * It will create a BoxPanel (left to right, no gutters) with a dock
 * panel. Each component/view is teleported into the Lumino widget div.
 *
 * Lumino uses DOM, and Vue the VDOM. So this is an approach that
 * works, but there could be alternative approaches too.
 */

/**
 * Mitt event for adding a view to the workspace.
 * @typedef {Object} AddViewEvent
 * @property {string} name - the view to add
 * @property {Record<string,*>} initialOptions - prop passed to the view component
 */

const $store = useStore()

const props = defineProps({
  workflowName: {
    type: String,
    required: true
  },
  /**
   * All possible view component classes that can be rendered
   *
   * @type {Map<string, import('@/views/views.js').CylcView>}
   */
  allViews: {
    type: Map,
    required: true
  },
})

const emit = defineEmits([
  'emptied'
])

/**
 * Template ref
 * @type {import('vue').Ref<HTMLElement>}
 */
const mainDiv = ref(null)

/**
 * Mapping of widget ID to the name of view component and its initialOptions prop.
 *
 * @type {import('vue').Ref<Map<string, AddViewEvent>>}
 */
const views = ref(new Map())

const defaultView = useDefaultView()

// create a box panel, which holds the dock panel, and controls its layout
const boxPanel = new BoxPanel({ direction: 'left-to-right', spacing: 0 })
// create dock panel, which holds the widgets
const dockPanel = new DockPanel()
boxPanel.addWidget(dockPanel)
BoxPanel.setStretch(dockPanel, 1)

const resizeObserver = new ResizeObserver(() => {
  boxPanel.update()
})

onMounted(() => {
  // Attach box panel to DOM:
  Widget.attach(boxPanel, mainDiv.value)
  // Watch for resize of the main element to trigger relayout:
  resizeObserver.observe(mainDiv.value)
  eventBus.on('add-view', addView)
  eventBus.on('lumino:deleted', onWidgetDeleted)
  getLayout(props.workflowName)
})

onBeforeUnmount(() => {
  resizeObserver.disconnect()
  eventBus.off('add-view', addView)
  eventBus.off('lumino:deleted', onWidgetDeleted)
  saveLayout()
  // Register with Lumino that the dock panel is no longer used,
  // otherwise uncaught errors can occur when restoring layout
  dockPanel.dispose()
})

/**
 * Create a widget and add it to the dock.
 *
 * @param {AddViewEvent} event
 * @param {boolean} onTop
 */
const addView = ({ name, initialOptions = {} }, onTop = true) => {
  const id = uniqueId('widget')
  const luminoWidget = new LuminoWidget(id, startCase(name), /* closable */ true)
  dockPanel.addWidget(luminoWidget, { mode: 'tab-after' })
  // give time for Lumino's widget DOM element to be created
  nextTick(() => {
    views.value.set(id, { name, initialOptions })
    if (onTop) {
      dockPanel.selectWidget(luminoWidget)
    }
  })
}

/**
 * Remove all the widgets present in the DockPanel.
 */
// (This is likely to be used in the future)
// eslint-disable-next-line no-unused-vars
const closeAllViews = () => {
  for (const widget of Array.from(dockPanel.widgets())) {
    widget.close()
  }
}

/**
 * Get the saved layout (if there is one) for the given workflow,
 * else add the default view.
 *
 * @param {string} workflowName
 */
const getLayout = (workflowName) => {
  restoreLayout(workflowName) || addView({ name: defaultView.value })
}

/**
 * Save the current layout/views to the store.
 */
const saveLayout = () => {
  $store.commit('app/saveLayout', {
    workflowName: props.workflowName,
    layout: dockPanel.saveLayout(),
    views: new Map(views.value),
  })
}

/**
 * Restore the layout for this workflow from the store, if it was saved.
 *
 * @param {string} workflowName
 * @returns {boolean} true if the layout was restored, false otherwise
 */
const restoreLayout = (workflowName) => {
  const stored = $store.state.app.workspaceLayouts.get(workflowName)
  if (stored) {
    dockPanel.restoreLayout(stored.layout)
    // Wait for next tick so that Lumino has created the widget divs that the
    // views will be teleported into
    nextTick(() => {
      views.value = stored.views
    })
    return true
  }
  return false
}

/**
 * React to a deleted event.
 *
 * @param {string} id - widget ID
 */
const onWidgetDeleted = (id) => {
  views.value.delete(id)
  if (!views.value.size) {
    emit('emptied')
  }
}
</script>
