import Vue from 'vue'
import { Widget } from '@lumino/widgets'
import Tree from '@/components/cylc/Tree'
import Graph from '@/components/cylc/Graph'

/**
 * A widget that will have just a single HTML element to be referenced by the Vue component.
 * Based on the example-dockpanel class ContentWidget.
 */
class ContentWidget extends Widget {
  /**
   * @param {string} id - widget id
   * @param {string} name - widget name (displayed in the tab bar)
   */
  constructor (id, name) {
    super({ node: ContentWidget.createNode(id) })
    this.id = id
    // classes and flags
    this.setFlag(Widget.Flag.DisallowLayout)
    this.addClass('content')
    // tab title
    this.title.label = name
    this.title.closable = true
  }

  /**
   * Return a dummy div to be used as parent for the Vue component element.
   * @param {string} id - widget id
   * @return HTMLElement
   */
  static createNode (id) {
    const div = document.createElement('div')
    div.setAttribute('id', id)
    div.setAttribute('class', 'fill-height')
    return div
  }

  onCloseRequest (msg) {
    // remove the Vue component
    const event = new Event('delete:widgetcomponent')
    document.getElementById(this.id).dispatchEvent(event)
    // close widget
    super.onCloseRequest(msg)
  }
}

const TreeWrapper = Vue.component('tree-wrapper', {
  name: 'TreeWrapper',
  props: {
    widgetId: {
      type: String,
      required: true
    },
    workflows: {
      type: Array,
      required: true
    }
  },
  components: {
    tree: Tree
  },
  mounted () {
    const widgetElement = document.getElementById(this.widgetId)
    widgetElement.appendChild(this.$refs[this.widgetId].$el)
    const vm = this
    document.getElementById(this.widgetId).addEventListener('delete:widgetcomponent', () => {
      EventBus.$emit('delete:tree', { id: vm.widgetId })
      vm.$destroy()
    }, false)
  },
  template: `
    <div>
      <tree :workflows="workflows" :ref="widgetId"/>
    </div>
  `
})

const GraphWrapper = Vue.component('graph-wrapper', {
  name: 'GraphWrapper',
  props: {
    widgetId: {
      type: String,
      required: true
    },
    workflowName: {
      type: String,
      required: true
    }
  },
  components: {
    graph: Graph
  },
  mounted () {
    const widgetElement = document.getElementById(this.widgetId)
    widgetElement.appendChild(this.$refs[this.widgetId].$el)
    const vm = this
    document.getElementById(this.widgetId).addEventListener('delete:widgetcomponent', () => {
      EventBus.$emit('delete:graph', { id: vm.widgetId })
      vm.$destroy()
    }, false)
  },
  template: `
    <div>
      <graph :workflow-name="workflowName" :ref="widgetId"/>
    </div>
  `
})

const EventBus = new Vue()

export {
  ContentWidget, TreeWrapper, GraphWrapper, EventBus
}
