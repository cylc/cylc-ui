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
    <div ref="main" id="main" class="pa-4 fill-height"></div>
    <div v-show="false">
      <tree-wrapper
          v-for="widgetId of this.treeWidgetIds"
          :key="widgetId"
          :workflows="workflowTree"
          :widgetId="widgetId"
          :is-loading="isLoading"
      />
      <graph-wrapper
          v-for="widgetId of this.graphWidgetIds"
          :key="widgetId"
          :workflow-name="workflowName"
          :widgetId="widgetId"
          :is-loading="isLoading"
      />
      <mutations-wrapper
          v-for="widgetId of this.mutationsWidgetIds"
          :key="widgetId"
          :workflow-name="workflowName"
          :widgetId="widgetId"
          :is-loading="isLoading"
      />
    </div>
  </div>
</template>

<script>
import { BoxPanel, DockPanel, Widget } from '@lumino/widgets'
import {
  ContentWidget,
  GraphWrapper,
  TreeWrapper,
  MutationsWrapper
} from '@/components/cylc/workflow/index'

export default {
  name: 'Workflow',
  props: {
    workflowTree: {
      type: Array,
      required: true
    },
    workflowName: {
      type: String,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  components: {
    // TODO: once our components (tree, graph, dot, etc) share a common interface (i.e. same props) we should be able to have a single wrapper
    'tree-wrapper': TreeWrapper,
    'graph-wrapper': GraphWrapper,
    'mutations-wrapper': MutationsWrapper
  },
  data () {
    return {
      // create a box panel, which holds the dock panel, and controls its layout
      main: new BoxPanel({ direction: 'left-to-right', spacing: 0 }),
      // create dock panel, which holds the widgets
      dock: new DockPanel(),
      treeWidgetIds: [],
      graphWidgetIds: [],
      mutationsWidgetIds: []
    }
  },
  created () {
    this.dock.id = 'dock'
    this.main.id = 'main'
    this.main.addWidget(this.dock)
    window.onresize = () => { this.main.update() }
    BoxPanel.setStretch(this.dock, 1)
    const vm = this
    this.$nextTick(() => {
      Widget.attach(vm.main, vm.$refs.main)
    })
  },
  methods: {
    addTreeWidget (id) {
      const contentWidget = new ContentWidget(id, 'tree')
      this.dock.addWidget(contentWidget)
      this.treeWidgetIds.push(id)
    },
    removeTreeWidget (id) {
      this.treeWidgetIds.splice(this.treeWidgetIds.indexOf(id), 1)
    },
    addGraphWidget (id) {
      const contentWidget = new ContentWidget(id, 'graph')
      this.dock.addWidget(contentWidget)
      this.graphWidgetIds.push(id)
    },
    addMutationsWidget (id) {
      const contentWidget = new ContentWidget(id, 'mutations')
      this.dock.addWidget(contentWidget)
      this.mutationsWidgetIds.push(id)
    }
  }
}
</script>
