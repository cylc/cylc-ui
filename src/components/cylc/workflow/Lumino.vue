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
    <div class="workflow-panel">
      <div ref="main" class="main py-4 pl-4 fill-height"></div>
      <div v-show="false">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import LuminoWidget from '@/components/cylc/workflow/lumino-widget'
import { BoxPanel, DockPanel, Widget } from '@lumino/widgets'

/**
 * A component to wrap the Lumino application.
 *
 * It will create a BoxPanel (left to right, no gutters) with a dock
 * panel. Each component created in the default slot will be added
 * to an invisible area.
 *
 * Upon creation, the component will take care to transfer the $el
 * of each children component to the Lumino widget div, creating the
 * impression that the component was created inside the tab/widget.
 *
 * Lumino uses DOM, and Vue the VDOM. So this is an approach that
 * works, but there could be alternative approaches too. Feel free
 * to adapt it to your use case as necessary.
 */
export default {
  /**
   * Show a useful name in logs/debug/vue-extension
   */
  name: 'Lumino',

  props: {
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

  /**
   * Data for the Lumino component
   */
  data () {
    return {
      // create a box panel, which holds the dock panel, and controls its layout
      main: new BoxPanel({ direction: 'left-to-right', spacing: 0 }),
      // create dock panel, which holds the widgets
      dock: new DockPanel(),
      widgets: []
    }
  },

  /**
   * Here we define the ID's for the Lumino DOM elements, and add the Dock panel to the main
   * Box panel. In the next tick of Vue, the DOM element and the Vue element/ref are attached.
   */
  created () {
    this.dock.id = 'dock'
    this.main.id = 'main'
    this.main.addWidget(this.dock)
    window.onresize = () => { this.main.update() }
    BoxPanel.setStretch(this.dock, 1)
    const vm = this
    this.$nextTick(() => {
      Widget.attach(vm.main, vm.$refs.main)
      this.syncWidgets()
    })
  },

  /**
   * Every time a new child element is added to the slot, this method will
   * be called. It will iterate the children elements looking for new ones
   * to add.
   *
   * The removal is handled via event listeners from Lumino.
   */
  updated () {
    this.syncWidgets()
  },

  methods: {
    /**
     * Iterates through the component children, looking for newly created
     * components, and then creates a related Lumino Widget for this component.
     */
    syncWidgets () {
      const tabTitleProp = this.$props.tabTitleProp
      this.$children
        .filter(child => !this.widgets.includes(child.$attrs.id))
        .forEach(newChild => {
          const id = `${newChild.$attrs.id}`
          const name = newChild.$attrs[tabTitleProp] ? newChild.$attrs[tabTitleProp] : newChild.$options.name
          this.addWidget(id, name)
          this.$nextTick(() => {
            document.getElementById(id).appendChild(newChild.$el)
          })
        })
    },

    /**
     * Create a widget.
     *
     */
    addWidget (id, name) {
      this.widgets.push(id)
      const luminoWidget = new LuminoWidget(id, name, /* closable */ true)
      this.dock.addWidget(luminoWidget)
      // give time for Lumino's widget DOM element to be created
      this.$nextTick(() => {
        document.getElementById(id)
          .addEventListener('lumino:activated', this.onWidgetActivated)
        document.getElementById(id)
          .addEventListener('lumino:deleted', this.onWidgetDeleted)
      })
    },

    /**
     * React to a deleted event.
     *
     * @param customEvent {
     *   detail: {
     *     id: string,
     *     name: string,
     *     closable: boolean
     *   }
     * }}
     */
    onWidgetActivated (customEvent) {
      this.$emit('lumino:activated', customEvent.detail)
    },

    /**
     * React to a deleted event.
     *
     * @param customEvent {
     *   detail: {
     *     id: string,
     *     name: string,
     *     closable: boolean
     *   }
     * }}
     */
    onWidgetDeleted (customEvent) {
      const id = customEvent.detail.id
      this.widgets.splice(this.widgets.indexOf(id), 1)
      document.getElementById(id)
        .removeEventListener('lumino:deleted', this.onWidgetDeleted)
      document.getElementById(id)
        .removeEventListener('lumino:activated', this.onWidgetActivated)
      this.$emit('lumino:deleted', customEvent.detail)
    }
  }
}
</script>
