<template>
  <div>
    <div ref="main" id="main" class="pa-4 fill-height"></div>
    <div v-show="false">
      <tree-wrapper
          v-for="widgetId of this.treeWidgetIds"
          :key="widgetId"
          :workflows="workflowTree"
          :widgetId="widgetId"
      />
      <graph-wrapper
          v-for="widgetId of this.graphWidgetIds"
          :key="widgetId"
          :workflow-name="workflowTree[0].name"
          :widgetId="widgetId"
      />
    </div>
  </div>
</template>

<script>
import { BoxPanel, DockPanel, Widget } from '@lumino/widgets'
import { ContentWidget, EventBus, GraphWrapper, TreeWrapper } from '@/components/cylc/workflow/index'

export default {
  name: 'Workflow',
  props: {
    workflowTree: {
      type: Array,
      required: true
    }
  },
  components: {
    'tree-wrapper': TreeWrapper,
    'graph-wrapper': GraphWrapper
  },
  data () {
    return {
      // create a box panel, which holds the dock panel, and controls its layout
      main: new BoxPanel({ direction: 'left-to-right', spacing: 0 }),
      // create dock panel, which holds the widgets
      dock: new DockPanel(),
      treeWidgetIds: [],
      graphWidgetIds: []
    }
  },
  created () {
    this.dock.id = 'dock'
    this.main.id = 'main'
    this.main.addWidget(this.dock)
    window.onresize = () => { this.main.update() }
    BoxPanel.setStretch(this.dock, 1)
    const vm = this
    EventBus.$on('add:tree', () => {
      const id = `tree-widget-${new Date().getTime()}`
      const contentWidget = new ContentWidget(id, 'tree')
      vm.dock.addWidget(contentWidget)
      vm.treeWidgetIds.push(id)
    })
    EventBus.$on('add:graph', () => {
      const id = `graph-widget-${new Date().getTime()}`
      const contentWidget = new ContentWidget(id, 'graph')
      vm.dock.addWidget(contentWidget)
      vm.graphWidgetIds.push(id)
    })
    this.$nextTick(() => {
      Widget.attach(vm.main, vm.$refs.main)
    })
  },
  beforeDestroy () {
    EventBus.$off('add:tree')
    EventBus.$off('add:graph')
  }
}
</script>
