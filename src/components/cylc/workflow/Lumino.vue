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
  <div ref="main" class="main pa-2 fill-height">
    <!-- Lumino box panel gets inserted here -->
  </div>
  <template
    v-for="(item, id) in views"
    :key="id"
  >
    <Teleport :to="`#${id}`">
      <component
        :is="item.view"
        :workflow-name="workflowName"
        :initialOptions="item.initialOptions"
        class="h-100"
      />
    </Teleport>
  </template>
</template>

<script>
import { startCase } from 'lodash'
import LuminoWidget from '@/components/cylc/workflow/lumino-widget'
import { BoxPanel, DockPanel, Widget } from '@lumino/widgets'

/**
 * A component to wrap the Lumino application.
 *
 * It will create a BoxPanel (left to right, no gutters) with a dock
 * panel. Each component/view is rendered in a hidden div, then we transfer
 * the element into the Lumino widget div, creating the
 * impression that the component was created inside the tab/widget.
 *
 * Lumino uses DOM, and Vue the VDOM. So this is an approach that
 * works, but there could be alternative approaches too.
 */
export default {
  name: 'Lumino',

  components: {}, // Filled on created()

  props: {
    /**
     * Parent-provided mapping of widget ID to the name of
     * view component class + options.
     *
     * @type {{ [id: string]: { view: string, initialOptions: Object } }}
     */
    views: {
      type: Object,
      default: () => {}
    },
    workflowName: {
      type: String,
      required: true
    },
    /** All possible view component classes that can be rendered */
    allViews: {
      type: Array,
      required: true
    },
  },

  emits: [
    'lumino:activated',
    'lumino:deleted'
  ],

  beforeCreate () {
    // Populate components
    for (const { name, component } of this.allViews) {
      this.$options.components[name] = component
    }
  },

  /**
   * Here we define the ID's for the Lumino DOM elements, and add the Dock panel to the main
   * Box panel. In the next tick of Vue, the DOM element and the Vue element/ref are attached.
   */
  created () {
    // create a box panel, which holds the dock panel, and controls its layout
    this.box = new BoxPanel({ direction: 'left-to-right', spacing: 0 })
    // create dock panel, which holds the widgets
    this.dock = new DockPanel()
    // Note: box & dock must not be in data() as the functionality breaks if
    // the lumino objects are proxied by Vue

    this.box.addWidget(this.dock)
    BoxPanel.setStretch(this.dock, 1)

    const resizeObserver = new ResizeObserver(() => {
      this.box.update()
    })

    this.$nextTick(() => {
      // Attach box panel to DOM:
      Widget.attach(this.box, this.$refs.main)
      // Watch for resize of the main element to trigger relayout:
      resizeObserver.observe(this.$refs.main)
    })
  },

  computed: {
    /**
     * We want to watch this.views; however, the (newVal, oldVal) args
     * do not differ when a deeply watched object's properties change.
     * So here is a workaround.
     */
    _views () {
      return Object.assign({}, this.views)
    }
  },

  watch: {
    _views: {
      deep: true,
      handler: 'syncWidgets'
    }
  },

  methods: {
    /**
     * Look for newly added views, creating a corresponding Lumino Widget
     * for each.
     */
    syncWidgets (newVal, oldVal) {
      for (const [id, item] of Object.entries(newVal)) {
        if (!(id in oldVal)) {
          this.addWidget(id, item.view)
        }
      }
    },

    /**
     * Create a widget and add it to the dock.
     */
    addWidget (id, name, onTop = true) {
      const luminoWidget = new LuminoWidget(id, startCase(name), /* closable */ true)
      this.dock.addWidget(luminoWidget, { mode: 'tab-after' })
      // give time for Lumino's widget DOM element to be created
      this.$nextTick(() => {
        const widgetEl = document.getElementById(id)
        widgetEl.addEventListener('lumino:activated', this.onWidgetActivated)
        widgetEl.addEventListener('lumino:deleted', this.onWidgetDeleted)
        if (onTop) {
          this.dock.selectWidget(luminoWidget)
        }
      })
    },

    /**
     * React to a deleted event.
     *
     * @param {{
     *   detail: {
     *     id: string,
     *     name: string,
     *     closable: boolean
     *   }
     * }} customEvent
     */
    onWidgetActivated (customEvent) {
      this.$emit('lumino:activated', customEvent.detail)
    },

    /**
     * React to a deleted event.
     *
     * @param {{
     *   detail: {
     *     id: string,
     *     name: string,
     *     closable: boolean
     *   }
     * }} customEvent
     */
    onWidgetDeleted (customEvent) {
      const { id } = customEvent.detail
      const widgetEl = document.getElementById(id)
      widgetEl.removeEventListener('lumino:deleted', this.onWidgetDeleted)
      widgetEl.removeEventListener('lumino:activated', this.onWidgetActivated)
      this.$emit('lumino:deleted', customEvent.detail)
    },
  }
}
</script>
