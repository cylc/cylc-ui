<template>
  <div id="workflow-panel" class="fill-height">
    <toolbar />
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
          :widgetId="widgetId"
      />
    </div>
  </div>
</template>

<script>
import { BoxPanel, DockPanel, Widget } from '@lumino/widgets'
import { mixin } from '@/mixins/index'
import { workflowService } from 'workflow-service'
import Toolbar from '@/components/cylc/Toolbar'
import { mapState } from 'vuex'
import { convertGraphQLWorkflowToTree } from '@/components/cylc/tree'
import Tree from '@/components/cylc/Tree'
import Vue from 'vue'
import Graph from '@/components/cylc/Graph'

export const bus = new Vue()

// query to retrieve all workflows
const QUERIES = {
  root: `
    {
      workflows(ids: ["WORKFLOW_ID"]) {
        id
        name
        status
        owner
        host
        port
        taskProxies(sort: { keys: ["cyclePoint"] }) {
          id
          state
          cyclePoint
          latestMessage
          firstParent {
            id
            name
            cyclePoint
            state
          }
          task {
            meanElapsedTime
            name
          }
          jobs(sort: { keys: ["submit_num"], reverse:true }) {
            id
            batchSysName
            batchSysJobId
            host
            startedTime
            submittedTime
            finishedTime
            state
            submitNum
          }
        }
        familyProxies (sort: { keys: ["firstParent"]}) {
          id
          name
          state
          cyclePoint
          firstParent {
            id
            name
            cyclePoint
            state
          }
        }
      }
    }
  `
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
    document.getElementById(this.widgetId).addEventListener('delete:widgetcomponent', (e) => {
      vm.$destroy()
    }, false)
  },
  template: `
    <div>
      <tree :workflows="workflows" :ref="widgetId" />
    </div>
  `
})

const GraphWrapper = Vue.component('graph-wrapper', {
  name: 'GraphWrapper',
  props: {
    widgetId: {
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
    document.getElementById(this.widgetId).addEventListener('delete:widgetcomponent', (e) => {
      vm.$destroy()
    }, false)
  },
  template: `
    <div>
      <graph :ref="widgetId" />
    </div>
  `
})

/**
 * A widget that will have just a single HTML element to be referenced by the Vue component.
 * Based on the example-dockpanel class ContentWidget.
 */
class ContentWidget extends Widget {
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

  onCloseRequest (msg) {
    // remove the Vue component
    const event = new Event('delete:widgetcomponent')
    document.getElementById(this.id).dispatchEvent(event)
    // close widget
    super.onCloseRequest(msg)
  }
}

export default {
  mixins: [mixin],
  name: 'Workflow',
  props: {
    workflowName: {
      type: String,
      required: true
    }
  },
  components: {
    toolbar: Toolbar,
    'tree-wrapper': TreeWrapper,
    'graph-wrapper': GraphWrapper
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },
  data: () => ({
    viewID: '',
    subscriptions: {},
    isLoading: true,
    // create a box panel, which holds the dock panel, and controls its layout
    main: new BoxPanel({ direction: 'left-to-right', spacing: 0 }),
    // create dock panel, which holds the widgets
    dock: new DockPanel(),
    treeWidgetIds: [],
    graphWidgetIds: []
  }),
  computed: {
    ...mapState('workflows', ['workflows']),
    currentWorkflow: function () {
      for (const workflow of this.workflows) {
        if (workflow.name === this.workflowName) {
          return workflow
        }
      }
      return null
    },
    workflowTree: function () {
      const workflowTree = []
      if (this.currentWorkflow !== null && Object.hasOwnProperty.call(this.currentWorkflow, 'familyProxies')) {
        try {
          workflowTree.push(convertGraphQLWorkflowToTree(this.currentWorkflow))
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e)
        }
      }
      return workflowTree
    }
  },
  created () {
    this.viewID = `Workflow(${this.workflowName}): ${Math.random()}`
    workflowService.register(
      this,
      {
        activeCallback: this.setActive
      }
    )
    this.subscribe('root')

    this.dock.id = 'dock'
    this.main.id = 'main'
    this.main.addWidget(this.dock)
    window.onresize = () => { this.main.update() }
    BoxPanel.setStretch(this.dock, 1)
    const vm = this
    bus.$on('add:tree', () => {
      const id = `tree-widget-${new Date().getTime()}`
      const contentWidget = new ContentWidget(id, 'tree')
      vm.dock.addWidget(contentWidget)
      vm.treeWidgetIds.push(id)
    })
    bus.$on('add:graph', () => {
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
    workflowService.unregister(this)
  },
  methods: {
    subscribe (queryName) {
      /**
       * Subscribe this view to a new GraphQL query.
       * @param {string} queryName - Must be in QUERIES.
       */
      if (!(queryName in this.subscriptions)) {
        this.subscriptions[queryName] =
          workflowService.subscribe(
            this,
            QUERIES[queryName].replace('WORKFLOW_ID', this.workflowName)
          )
      }
    },
    unsubscribe (queryName) {
      /**
       * Unsubscribe this view to a new GraphQL query.
       * @param {string} queryName - Must be in QUERIES.
       */
      if (queryName in this.subscriptions) {
        workflowService.unsubscribe(
          this.subscriptions[queryName]
        )
      }
    },
    setActive (isActive) {
      /** Toggle the isLoading state.
       * @param {bool} isActive - Are this views subs active.
       */
      this.isLoading = !isActive
    }
  }
}
</script>
