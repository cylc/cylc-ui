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
  <div v-show="false">
    <!-- Hidden div acts as staging area for views before they are
    moved into a lumino widget -->
    <component
      v-for="(item, id) of views"
      :key="id"
      :ref="(ref) => { viewRefs[id] = ref }"
      :is="item.view"
      :tab-title="getTabTitle(item.view)"
      :workflow-name="workflowName"
      :initialOptions="item.initialOptions"
      class="h-100"
    />
  </div>
</template>

<script>
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
    /**
     * Prop to customize the tab title. Defaults to name.
     * If a component does not have the $component.$tabTitleProp
     * set, then we still revert to the old default $component.name.
     */
    tabTitleProp: {
      type: String,
      default: 'name'
    }
  },

  emits: [
    'lumino:activated',
    'lumino:deleted'
  ],

  data () {
    return {
      /** Keep track of views' refs separate from $refs in order to access
       * by ID */
      viewRefs: {}
    }
  },

  /**
   * Here we define the ID's for the Lumino DOM elements, and add the Dock panel to the main
   * Box panel. In the next tick of Vue, the DOM element and the Vue element/ref are attached.
   */
  created () {
    // We need to load each view used by this view/component.
    // See "local-registration" in Vue.js documentation.
    this.allViews.forEach(view => {
      this.$options.components[view.name] = view
    })

    // create a box panel, which holds the dock panel, and controls its layout
    this.box = new BoxPanel({ direction: 'left-to-right', spacing: 0 })
    // create dock panel, which holds the widgets
    this.dock = new DockPanel()
    // Note: box & dock must not be in data() as the functionality breaks if
    // the lumino objects are proxied by Vue

    this.box.addWidget(this.dock)
    window.onresize = () => { this.box.update() }
    BoxPanel.setStretch(this.dock, 1)
    this.$nextTick(() => {
      // Attach box panel to DOM:
      Widget.attach(this.box, this.$refs.main)
      // Add widget(s):
      this.syncWidgets(this.views, {})
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
      const { tabTitleProp } = this.$props
      for (const [id, item] of Object.entries(newVal)) {
        if (!(id in oldVal)) {
          const view = this.$options.components[item.view]
          const name = view[tabTitleProp] ?? view.name
          this.addWidget(id, name)
        }
      }
    },

    /**
     * Create a widget, add it to the dock, and move the corresponding view
     * from the hidden div into it.
     */
    addWidget (id, name, onTop = true) {
      const luminoWidget = new LuminoWidget(id, name, /* closable */ true)
      this.dock.addWidget(luminoWidget, { mode: 'tab-after' })
      // give time for Lumino's widget DOM element to be created
      this.$nextTick(() => {
        const widgetEl = document.getElementById(id)
        widgetEl.appendChild(this.viewRefs[id].$el)
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
      delete this.viewRefs[id]
      const widgetEl = document.getElementById(id)
      widgetEl.removeEventListener('lumino:deleted', this.onWidgetDeleted)
      widgetEl.removeEventListener('lumino:activated', this.onWidgetActivated)
      this.$emit('lumino:deleted', customEvent.detail)
    },

    getTabTitle (viewName) {
      return this.$options.components[viewName].data().widget.title
    }
  }
}
</script>
