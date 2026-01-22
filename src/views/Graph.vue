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
  <div class="c-graph w-100 h-100">
    <!-- the controls -->
    <ViewToolbar
      :groups="controlGroups"
      @setOption="setOption"
    />

    <!-- the graph -->
    <svg
      width="100%"
      height="100%"
      ref="graph"
      class="graph job_theme--default"
    >
      <defs>
        <marker
          :id="`${_uid}-arrow-end`"
          viewbox="0 0 8 8"
          refX="1" refY="5"
          markerUnits="strokeWidth"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M 0 0 L 8 4 L 0 8 z" fill="rgb(90,90,90)" />
        </marker>
      </defs>
      <g
        class="svg-pan-zoom_viewport job_theme--default"
      >
        <!-- the nodes -->
        <g
          v-for="node in graphNodes"
          :key="node.id"
          :id="node.id"
          :ref="node.id"
          :transform="nodeTransformations[node.id]"
          class="graph-node-container"
        >
          <GraphNode
            :task="node"
            :jobs="node.children"
            :jobTheme="jobTheme"
            :class="{ 'flow-none': isFlowNone(node.node.flowNums) }"
          />
        </g>
        <!-- the edges
          NOTE: These transformations are static fudge factors to keep the node
          and edge layers aligned. They will need to be adjusted if the
          GraphNode component layout / dimensions are changed.
        -->
        <g
          class="edges"
          :transform="
            (transpose) ? 'translate(-25, -8)' : 'translate(0, -25)'
          "
        >
          <g
            v-for="(edgePath, index) in graphEdges"
            :key="index"
            :ref="`edge-${index}`"
          >
            <path
              :d="edgePath"
              stroke="rgb(90,90,90)"
              stroke-width="5"
              fill="none"
              :marker-end="`url(#${_uid}-arrow-end)`"
            />
          </g>
        </g>
        <g v-if="groupCycle">
          <GraphSubgraph
            v-for="(subgraph, key) in subgraphs"
            :key="key"
            :subgraph="subgraph"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { mapGetters } from 'vuex'
import { useJobTheme } from '@/composables/localStorage'
import graphqlMixin from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import {
  initialOptions,
  useInitialOptions,
} from '@/utils/initialOptions'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
// import CylcTreeCallback from '@/services/treeCallback'
import GraphNode from '@/components/cylc/GraphNode.vue'
import GraphSubgraph from '@/components/cylc/GraphSubgraph.vue'
import ViewToolbar from '@/components/cylc/ViewToolbar.vue'
import {
  posToPath,
  nonCryptoHash,
} from '@/utils/graph-utils'
import { Graphviz } from '@hpcc-js/wasm/graphviz'
import svgPanZoom from 'svg-pan-zoom'
import {
  mdiTimer,
  mdiImageFilterCenterFocus,
  mdiArrowCollapse,
  mdiArrowExpand,
  mdiRefresh,
  mdiFileRotateRight,
  mdiVectorSelection,
} from '@mdi/js'
import { isFlowNone } from '@/utils/tasks'

// NOTE: Use TaskProxies not nodesEdges{nodes} to list nodes as this is what
// the tree view uses which allows the requests to overlap with this and other
// views. Data overlap is good because it reduces the amount of data we need
// to request / store / process.
const QUERY = gql`
subscription Workflow ($workflowId: ID) {
  deltas(workflows: [$workflowId]) {
    added {
      ...AddedDelta
    }
    updated (stripNull: true) {
      ...UpdatedDelta
    }
    pruned {
      ...PrunedDelta
    }
  }
}

fragment WorkflowData on Workflow {
  id
  reloaded
}

fragment EdgeData on Edge {
  id
  source
  target
}

fragment TaskProxyData on TaskProxy {
  id
  state
  isHeld
  isRunahead
  isQueued
  isRetry
  isWallclock
  isXtriggered
  name
  task {
    meanElapsedTime
  }
  flowNums
  runtime {
    runMode
  }
}

fragment JobData on Job {
  id
  state
  name
  startedTime
}

fragment AddedDelta on Added {
  workflow {
    ...WorkflowData
  }
  edges {
    ...EdgeData
  }
  taskProxies {
    ...TaskProxyData
  }
  jobs {
    ...JobData
  }
}

fragment UpdatedDelta on Updated {
  workflow {
    ...WorkflowData
  }
  edges {
    ...EdgeData
  }
  taskProxies {
    ...TaskProxyData
  }
  jobs {
    ...JobData
  }
}

fragment PrunedDelta on Pruned {
  workflow
  edges
  taskProxies
  jobs
}
`

export default {
  name: 'Graph',

  mixins: [
    graphqlMixin,
    subscriptionComponentMixin,
  ],

  components: {
    GraphNode,
    GraphSubgraph,
    ViewToolbar,
  },

  props: { initialOptions },

  setup (props, { emit }) {
    /**
     * The transpose toggle state.
     * If true layout is left-right, else top-bottom
     * @type {import('vue').Ref<boolean>}
     */
    const transpose = useInitialOptions('transpose', { props, emit }, false)

    /**
     * The auto-refresh toggle state.
     * If true the graph layout will be updated on a timer
     * @type {import('vue').Ref<boolean>}
     */
    const autoRefresh = useInitialOptions('autoRefresh', { props, emit }, true)

    /**
     * The node spacing state.
     * @type {import('vue').Ref<number>}
     */
    const spacing = useInitialOptions('spacing', { props, emit }, 1.5)

    /**
     * The group by cycle point toggle state.
     * If true the graph nodes will be grouped by cycle point
     * @type {import('vue').Ref<boolean>}
     */
    const groupCycle = useInitialOptions('groupCycle', { props, emit }, false)

    return {
      jobTheme: useJobTheme(),
      transpose,
      autoRefresh,
      spacing,
      groupCycle,
      isFlowNone,
    }
  },

  data () {
    return {
      // the graph orientation
      orientation: 'TB',
      // the auto-refresh timer
      refreshTimer: null,
      // the nodes end edges we render to the graph
      graphNodes: [],
      graphEdges: [],
      subgraphs: {},
      // the svg transformations to apply to each node to apply the layout
      // generated by graphviz
      nodeTransformations: {},
      // Hash derived from the IDs of the nodes and edges in the graph
      // used to avoid needlessly re-laying-out the graph when not needed
      graphID: null,
      // instance of system which provides pan/zoom/navigation support
      panZoomWidget: null,
      // true if layout is in progress
      updating: false,
      // supports loading graph when component is mounted and autoRefresh is off.
      // true if page is loading for the first time and nodeDimensions are yet to be calculated
      initialLoad: true,
    }
  },

  mounted () {
    // compile & instantiate graphviz wasm
    /** @type {Promise<Graphviz>} */
    this.graphviz = Graphviz.load()
    // allow render to happen before we go configuring svgPanZoom
    this.$nextTick(() => {
      this.refresh()
      this.updateTimer()
    })
    this.mountSVGPanZoom()
  },

  beforeUnmount () {
    clearInterval(this.refreshTimer)
  },

  computed: {
    ...mapGetters('workflows', ['getNodes']),
    query () {
      return new SubscriptionQuery(
        QUERY,
        this.variables,
        'workflow',
        [],
        /* isDelta */ true,
        /* isGlobalCallback */ true
      )
    },
    workflowIDs () {
      return [this.workflowId]
    },
    workflows () {
      return this.getNodes('workflow', this.workflowIDs)
    },
    controlGroups () {
      return [
        {
          title: 'Graph',
          controls: [
            {
              title: 'Refresh',
              icon: mdiRefresh,
              action: 'callback',
              callback: this.refresh,
              disableIf: ['autoRefresh'],
            },
            {
              title: 'Auto Refresh',
              icon: mdiTimer,
              action: 'toggle',
              value: this.autoRefresh,
              key: 'autoRefresh',
            },
            {
              title: 'Transpose',
              icon: mdiFileRotateRight,
              action: 'toggle',
              value: this.transpose,
              key: 'transpose',
            },
            {
              title: 'Centre',
              icon: mdiImageFilterCenterFocus,
              action: 'callback',
              callback: this.reset,
            },
            {
              title: 'Increase Spacing',
              icon: mdiArrowExpand,
              action: 'callback',
              callback: this.increaseSpacing,
            },
            {
              title: 'Decrease Spacing',
              icon: mdiArrowCollapse,
              action: 'callback',
              callback: this.decreaseSpacing,
            },
            {
              title: 'Group by cycle point',
              icon: mdiVectorSelection,
              action: 'toggle',
              value: this.groupCycle,
              key: 'groupCycle',
            },
          ],
        },
      ]
    },
  },

  methods: {
    mountSVGPanZoom () {
      // Check the SVG is ready:
      // * The SVG document must be rendered with something in it before we can
      //   mount the svgPanZoom widget (because it needs to determine the
      //   documents dimensions).
      const children = this.$refs.graph.children
      if (
        // there should be at least two children (defs and one group)
        children.length < 2 ||
        // the first item (after defs) should have measurable dimensions
        !children[1].getBBox() ||
        // and it's dimensions should be non-zero
        children[1].getBBox().width === 0
      ) {
        // the SVG is not ready yet, give it time, we'll re-try when the
        // graph layout changes
        return
      }

      // Initialise the svgPanZoom component:
      // * Initiating svgPanZoom may result in some "violation" warnings
      //   see https://github.com/bumbu/svg-pan-zoom/issues/408.
      this.panZoomWidget = svgPanZoom(
        this.$refs.graph,
        {
          // NOTE: fix must be false otherwise it's trying to measure up before
          // the viewport is loaded or something like that which causes
          // NaN values to end up in the transformation matrix
          // TODO: enable the "thumbnail" viewer (i.e. minimap, see svg-pan-zoom)
          viewportSelector: '.svg-pan-zoom_viewport',
          panEnabled: true,
          controlIconsEnabled: false,
          zoomEnabled: true,
          dblClickZoomEnabled: true,
          mouseWheelZoomEnabled: true,
          preventMouseEventsDefault: true,
          zoomScaleSensitivity: 0.2,
          minZoom: 0.01, // how zoomed out we can go
          maxZoom: 50, // how zoomed in we can go
          fit: false,
          contain: false,
          center: true,
          refreshRate: 'auto',
        }
      )

      // Center the view after load:
      this.reset()
    },
    setOption (option, value) {
      this[option] = value
    },
    updateTimer () {
      // turn the timer on or off depending on the value of autoRefresh
      // if initialLoad is true we want to set a refresh interval
      // regardles of autoRefresh state.
      if (this.autoRefresh || this.initialLoad) {
        this.refreshTimer = setInterval(this.refresh, 2000)
      } else {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    increaseSpacing () {
      // increase graph layout node spacing by 10%
      this.spacing = this.spacing * 1.1
    },
    decreaseSpacing () {
      // decrease graph layout node spacing by 10%
      this.spacing = this.spacing * (10 / 11)
    },
    getGraphNodes () {
      // list graph nodes from the store (non reactive list)
      const ret = []
      for (const workflow of this.workflows) {
        for (const cycle of workflow.children) {
          for (const task of cycle.children) {
            ret.push(task)
          }
        }
      }
      return ret
    },
    getGraphEdges () {
      // list graph edges from the store (non reactive list)
      const ret = []
      for (const workflow of this.workflows) {
        for (const edge of workflow.$edges || []) {
          ret.push(edge)
        }
      }
      return ret
    },
    /**
     * Get the dimensions of currently rendered graph nodes
     * (we feed these dimensions into the GraphViz dot code to improve layout).
     *
     * @param {Object[]} nodes
     * @returns {{ [id: string]: SVGRect }} mapping of node IDs to their
     * bounding boxes.
     */
    getNodeDimensions (nodes) {
      const ret = {}
      let bbox
      for (const node of nodes) {
        const elements = this.$refs[node.id]
        bbox = elements[0]?.getBBox()
        if (!bbox) {
          throw Error(`Node ${node.id} not rendered`)
        }
        ret[node.id] = bbox
      }
      return ret
    },
    /**
     * Get the nodes binned by cycle point
     *
     * @param {Object[]} nodes
     * @returns {{ [dateTime: string]: Object[] }=} mapping of cycle points to nodes
     */
    getCycles (nodes) {
      if (!this.groupCycle) return
      return nodes.reduce((x, y) => {
        (x[y.tokens.cycle] ||= []).push(y)
        return x
      }, {})
    },
    getDotCode (nodeDimensions, nodes, edges, cycles) {
      // return GraphViz dot code for the given nodes, edges and dimensions
      const ret = ['digraph {']
      let spacing = this.spacing
      if (this.transpose) {
        // transposed graphs need more space because the edges can start
        // anywhere on the node
        spacing = spacing * 1.5
      }
      // NOTE: graphviz defaults nodesep=0.25 ranksep=0.5
      // increase the normal sep values to better space our larger nodes
      ret.push(
        `  rankdir=${(this.transpose) ? 'LR' : 'TB'}`,
        `  nodesep=${spacing}`,
        `  ranksep=${spacing * 2}`,
        '  node [shape="rect"]'
      )
      for (const node of nodes) {
        // use an HTML-like GraphViz node label to allow fine control over
        // where edges are routed from and to using "ports"
        // * route edges TO the node's "in" port and FROM the node's "out" port.
        // * apply node dimensions to the table so that the node GraphViz
        //   renders has the same dimensions as the node we render
        const bbox = nodeDimensions[node.id]
        ret.push(`
          "${node.id}" [
            label=<
              <TABLE HEIGHT="${bbox.height}">
                <TR>
                  <TD PORT="in" WIDTH="100"></TD>
                </TR>
                <TR>
                  <TD PORT="task" WIDTH="100" HEIGHT="${bbox.height}">icon</TD>
                  <TD WIDTH="${bbox.width - 100}">${node.id}</TD>
                </TR>
                <TR>
                  <TD PORT="out" WIDTH="100"></TD>
                </TR>
              </TABLE>
            >
          ]
        `)
      }

      if (this.groupCycle) {
        // Loop over the subgraphs
        Object.keys(cycles).forEach((key, i) => {
          // Loop over the nodes that are included in the subraph
          const nodeFormattedArray = cycles[key].map(a => `"${a.id}"`)
          ret.push(`
          subgraph cluster_margin_${i}
          {
            margin=100.0
            label="margin"
            subgraph cluster_${i} {${nodeFormattedArray};\n
              label = "${key}";\n
              fontsize = "70px"
              style=dashed
              margin=60.0
            }
          }`)
        })
      }

      if (this.transpose) {
        // left-right orientation
        // route edges from anywhere on the node of the source task to anywhere
        // on the task *node* of the destination task *icon*
        for (const edge of edges) {
          ret.push(`  "${edge.node.source}" -> "${edge.node.target}":task`)
        }
      } else {
        // top-bottom orientation
        // route edges from the bottom of the source task *icon* to the top of
        // the destination task *icon*
        for (const edge of edges) {
          ret.push(`  "${edge.node.source}":out -> "${edge.node.target}":in`)
        }
      }
      ret.push('}')
      return ret.join('\n')
    },
    hashGraph (nodes, edges) {
      // generate a hash for this list of nodes and edges
      return nonCryptoHash(
        nodes.map(n => n.id).reduce((x, y) => { return x + y }) +
        (edges || []).map(n => n.id).reduce((x, y) => { return x + y }, 1)
      )
    },
    reset () {
      // pan / zoom so that the graph is centered and in frame
      this.panZoomTo(
        this.$refs.graph.getElementsByClassName('svg-pan-zoom_viewport')[0]
      )
    },
    panZoomTo (ele) {
      // pan / zoom so that the provided SVG element is centered and in frame
      // Acknowledgment: Code adapted from suggestion from @iftahh in
      // https://github.com/bumbu/svg-pan-zoom/issues/381
      if (!this.panZoomWidget) {
        // the svgPanZoom widget has not been mounted yet
        return
      }
      this.panZoomWidget.resize()
      const bbox = ele.getBBox()
      const { width, height, realZoom } = this.panZoomWidget.getSizes()

      // pan to center
      this.panZoomWidget.pan({
        x: -realZoom * (bbox.x - width / (realZoom * 2) + bbox.width / 2),
        y: -realZoom * (bbox.y - height / (realZoom * 2) + bbox.height / 2),
      })

      // zoom to fit
      const relativeZoom = this.panZoomWidget.getZoom()
      const desiredWidth = 50 * Math.sqrt(bbox.width / 25) * 11 * realZoom
      this.panZoomWidget.zoom(relativeZoom * width / desiredWidth)
    },
    async refresh () {
      // refresh the graph layout if required
      if (this.updating) {
        // prevent parallel layout
        return
      }
      this.updating = true

      // extract the graph (non reactive lists of nodes & edges)
      const nodes = await this.waitFor(() => {
        const nodes = this.getGraphNodes()
        return nodes.length ? nodes : false
      })
      const edges = this.getGraphEdges()

      if (!nodes || !nodes.length) {
        // we can't graph this, reset and wait for something to draw
        this.graphID = null
        this.updating = false
        return
      }

      const cycles = this.getCycles(nodes)

      // compute the graph ID
      const graphID = this.hashGraph(nodes, edges)
      if (this.graphID === graphID) {
        // the graph has not changed => do nothing
        this.updating = false
        return
      }

      // wipe the rendered graph
      // wipe old graph edges
      this.graphEdges = [] // wipe old graph edges
      // wipe old node transformations
      const nodeIds = nodes.map((n) => n.id)
      for (const id in this.nodeTransformations) {
        if (!nodeIds.includes(id)) { // this node has been removed
          delete this.nodeTransformations[id]
        }
      }
      // wipe old nodes
      this.graphNodes = nodes

      // obtain the node dimensions to use in the layout
      // NOTE: need to wait for the nodes to all be rendered before we can
      // measure them
      const nodeDimensions = await this.waitFor(() => {
        try {
          return this.getNodeDimensions(nodes) // all nodes rendered
        } catch {
          return false // one or more nodes awaiting render
        }
      })

      // if autoRefresh is off on page load no graph will be rendered.
      // we let the page refresh on initial load
      // once nodeDimensions have rendered for the first time
      // we prevent further refreshing by setting initialLoad to false
      if (nodeDimensions) {
        if (this.initialLoad) { this.initialLoad = false }
      } else {
        return
      }

      // layout the graph
      try {
        await this.layout(nodes, edges, nodeDimensions, cycles)
      } catch (e) {
        // something went wrong, allow the layout to retry later
        this.graphID = null
        this.updating = false
        console.error(e)
        return
      }

      // re-center the SVG if this was the first layout or if the orientation
      // was changed
      if (!this.graphID) {
        const lastEdgeID = `edge-${edges.length - 1}`
        await this.waitFor(() => {
          // wait for the last edge of the graph to be rendered
          const lastEdge = this.$refs[lastEdgeID]
          return lastEdge && lastEdge[0] && lastEdge[0].getBBox()
        })
        this.reset()
      }

      this.graphID = graphID
      this.updating = false
    },
    async waitFor (callback, retries = 10) {
      // wait for things to render
      // Will return when the callback returns something truthy.
      // OR after the configured number of retries
      for (let retry = 0; retry < retries; retry++) {
        const ret = callback()
        if (ret) return ret
        await new Promise(requestAnimationFrame)
        await this.$nextTick()
      }
    },
    /**
     * Re-layout the graph after any new nodes have been rendered.
     *
     * @param {Object[]} nodes
     * @param {Object[]} edges
     * @param {{ [id: string]: SVGRect }} nodeDimensions
     */
    async layout (nodes, edges, nodeDimensions, cycles) {
      // generate the GraphViz dot code
      const dotCode = this.getDotCode(nodeDimensions, nodes, edges, cycles)

      // run the layout algorithm
      const jsonString = (await this.graphviz).layout(dotCode, 'json')
      const json = JSON.parse(jsonString)

      this.subgraphs = {}
      // update graph node positions
      for (const obj of json.objects) {
        if (obj.bb) {
          // if the object is a subgraph
          if (obj.label !== 'margin') {
            // ignore the margins in the dot-code which do not need DOM elements
            const [left, bottom, right, top] = obj.bb.split(',')
            this.subgraphs[obj.name] = {
              x: left,
              y: -top,
              width: right - left,
              height: top - bottom,
              label: obj.label,
            }
          }
        } else {
          // else the object is a node
          const [x, y] = obj.pos.split(',')
          const bbox = nodeDimensions[obj.name]
          // translations:
          // 1. The graphviz node coordinates
          // 2. Centers the node on this coordinate
          // TODO convert (2) to maths OR fix it to avoid recomputation?
          this.nodeTransformations[obj.name] = `
          translate(${x}, -${y})
          translate(-${bbox.width / 2}, -${bbox.height / 2})
        `
        }
      }
      // update edge paths
      this.graphEdges = json.edges?.map(edge => posToPath(edge.pos)) ?? []

      if (!this.panZoomWidget) {
        // mount the svgPanZoom widget on first load
        this.mountSVGPanZoom()
      }
    },
  },

  watch: {
    transpose () {
      // refresh the graph when the transpose option is changed
      this.graphID = null
      this.refresh()
    },
    spacing () {
      // refresh the graph when the spacing is changed
      this.graphID = null
      this.refresh()
    },
    autoRefresh () {
      // toggle the timer when autoRefresh is changed
      this.updateTimer()
    },
    initialLoad () {
      // when initialLoad changes from true to false
      // do a final refresh
      if (!this.autoRefresh) {
        this.updateTimer()
      }
    },
    groupCycle () {
      // refresh the graph when group by cycle point option is changed
      this.graphID = null
      this.refresh()
    },
  },
}
</script>

<style lang="scss">
  .c-graph {
    overflow: hidden;

    .c-view-toolbar {
      // turn the view toolbar into a floating component
      position: fixed;
      background-color: rgba(240,240,240,0.9);
      border-radius: 0.75em;
      margin: 0.5em;
      padding: 0.4em;
    }
  }
</style>
