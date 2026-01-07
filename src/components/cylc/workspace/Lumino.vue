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
      :widgetID="id"
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
import { startCase, uniqueId } from 'lodash-es'
import WidgetComponent from '@/components/cylc/workspace/Widget.vue'
import { LuminoWidget } from '@/components/cylc/workspace/luminoWidget'
import { BoxPanel, DockPanel, Widget } from '@lumino/widgets'
import { watchWithControl } from '@/utils/reactivity'
import { replacer, reviver } from '@/utils/json'
import { useDefaultView } from '@/views/views'
import { eventBus } from '@/services/eventBus'
import { useWorkspaceLayoutsCache } from '@/composables/cacheStorage'

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
 * Options for views in the workspace.
 * @typedef {Object} IViewOptions
 * @property {string} name - the view component name
 * @property {Record<string,*>} initialOptions - prop passed to the view component
 */

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
 * @type {import('vue').Ref<Map<string, IViewOptions>>}
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

const layoutsCache = useWorkspaceLayoutsCache()
const layoutWatcher = watchWithControl(views, saveLayout, { deep: true })

onMounted(async () => {
  // Store any add-view events that occur before the layout is ready
  // (e.g. when opening log view from command menu):
  const bufferedAddViewEvents = []
  eventBus.on('add-view', (e) => bufferedAddViewEvents.push(e))

  // Attach box panel to DOM:
  Widget.attach(boxPanel, mainDiv.value)
  // Watch for resize of the main element to trigger relayout:
  resizeObserver.observe(mainDiv.value)

  await getLayout()
  dockPanel.layoutModified.connect(() => layoutWatcher.trigger())

  eventBus.off('add-view')
  eventBus.on('add-view', addView)
  bufferedAddViewEvents.forEach((e) => addView(e))
  eventBus.on('lumino:deleted', onWidgetDeleted)
  eventBus.on('reset-workspace-layout', resetToDefault)
})

onBeforeUnmount(() => {
  resizeObserver.disconnect()
  eventBus.off('add-view', addView)
  eventBus.off('lumino:deleted', onWidgetDeleted)
  eventBus.off('reset-workspace-layout', resetToDefault)
  layoutWatcher.pause()
  // Register with Lumino that the dock panel is no longer used,
  // otherwise uncaught errors can occur when restoring layout
  dockPanel.dispose()
})

/**
 * Create a widget and add it to the dock.
 *
 * @param {IViewOptions} param0
 * @param {boolean} onTop
 */
async function addView ({ name, initialOptions = {} }, onTop = true) {
  layoutWatcher.pause()
  const id = uniqueId('widget')
  const luminoWidget = new LuminoWidget(id, startCase(name), /* closable */ true)
  dockPanel.addWidget(luminoWidget, { mode: 'tab-after' })
  if (onTop) {
    dockPanel.selectWidget(luminoWidget)
  }
  // give time for Lumino's widget DOM element to be created
  await nextTick()
  views.value.set(id, { name, initialOptions })
  layoutWatcher.resume()
  layoutWatcher.trigger()
}

/**
 * Remove all the widgets present in the DockPanel.
 */
async function closeAllViews () {
  for (const widget of Array.from(dockPanel.widgets())) {
    widget.close()
  }
  await nextTick()
}

/**
 * Get the saved layout (if there is one) for the current workflow,
 * else add the default view.
 */
async function getLayout () {
  await restoreLayout() || await addView({ name: defaultView.value })
}

/**
 * Save the current layout/views to cache storage.
 */
async function saveLayout () {
  // Serialize layout first to synchronously capture the current state
  const serializedLayout = JSON.stringify({
    layout: dockPanel.saveLayout(),
    views: views.value,
  }, replacer)
  const cache = await layoutsCache
  // Overrides on FIFO basis:
  await cache.put(props.workflowName, new Response(
    serializedLayout,
    { headers: { 'Content-Type': 'application/json' } }
  ))
  const keys = await cache.keys()
  if (keys.length > 100) {
    await cache.delete(keys[0])
  }
}

/**
 * Return the saved layout for this workflow from cache storage, if it was saved.
 */
async function getStoredLayout () {
  const cache = await layoutsCache
  const stored = await cache.match(props.workflowName).then((r) => r?.text())
  if (stored) {
    return JSON.parse(
      stored,
      (key, value) => reviver(key, LuminoWidget.layoutReviver(key, value))
    )
  }
}

/**
 * Restore the layout for this workflow, if it was saved.
 *
 * @returns true if the layout was restored, false otherwise
 */
async function restoreLayout () {
  const stored = await getStoredLayout()
  if (stored) {
    layoutWatcher.pause()
    dockPanel.restoreLayout(stored.layout)
    // Wait for next tick so that Lumino has created the widget divs that the
    // views will be teleported into
    await nextTick()
    views.value = stored.views
    layoutWatcher.resume()
    return true
  }
  return false
}

/**
 * Reset the workspace layout to a single tab with the default view.
 */
async function resetToDefault () {
  await layoutWatcher.ignore(closeAllViews)
  await addView({ name: defaultView.value })
}

/**
 * React to a deleted event.
 *
 * @param {string} id - widget ID
 */
function onWidgetDeleted (id) {
  layoutWatcher.ignore(() => {
    views.value.delete(id)
    if (!views.value.size) {
      emit('emptied')
    }
  })
}
</script>
