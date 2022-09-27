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
    <!-- the controls -->
    <span>Spacing: {{ spacing.toPrecision(4) }}</span>
    <v-btn
      @click="this.increaseSpacing"
    >
      Increase
    </v-btn>
    <v-btn
      @click="this.decreaseSpacing"
    >
      Decrease
    </v-btn>

    <!-- the graph -->
    <svg
      id="graphgraph"
      width="100%"
      height="100%"
    >
      <defs>
        <marker
          id="arrow-end"
          viewbox="0 0 8 8"
          refX="1" refY="5"
          markerUnits="strokeWidth"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M 0 0 L 8 4 L 0 8 z" fill="black" />
        </marker>
      </defs>
      <g
        class="svg-pan-zoom_viewport"
      >
        <!-- the nodes -->
        <g
          v-for="node in graphNodes"
          :key="node.id"
          :id="node.id"
          :ref="node.id"
          :transform="nodeTransformations[node.id]"
        >
          <GraphNode
            :task="node"
          />
        </g>
        <g
          transform="
            translate(10, -15)
          "
        >
          <!-- the edges -->
          <g
            v-for="(edgePath, index) in graphEdges"
            :key="index"
          >
            <path
              :d="edgePath"
              stroke="black"
              stroke-width="5"
              fill="none"
              marker-end="url(#arrow-end)"
            />
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
import Vue from 'vue'
import gql from 'graphql-tag'
import { mapState } from 'vuex'
import { mdiFileTree } from '@mdi/js'
import pageMixin from '@/mixins/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionViewMixin from '@/mixins/subscriptionView'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
// import WorkflowCallback from '@/components/cylc/common/callbacks'
import CylcTreeCallback from '@/services/treeCallback'
import GraphNode from '@/components/cylc/GraphNode'
import { graphviz } from '@hpcc-js/wasm'
import * as svgPanZoom from 'svg-pan-zoom'

// NOTE: use TaskProxies not nodesEdges{nodes} to list nodes to allow
// request overlap with other views (notably the tree view)
const QUERY = gql`
fragment GraphEdgeData on Edge {
  id
  source
  target
}

fragment GraphNodeData on TaskProxy {
  id
  state
  isHeld
  isRunahead
  isQueued
  name
}

fragment GraphJobData on Job {
  id
  state
  name
}

fragment GraphAddedDelta on Added {
  edges {
    ...GraphEdgeData
  }
  taskProxies {
    ...GraphNodeData
  }
  jobs {
    ...GraphJobData
  }
}

fragment GraphUpdatedDelta on Updated {
  edges {
    ...GraphEdgeData
  }
  taskProxies {
    ...GraphNodeData
  }
  jobs {
    ...GraphJobData
  }
}

fragment GraphDeltas on Deltas {
  added {
    ...GraphAddedDelta
  }
  updated {
    ...GraphUpdatedDelta
  }
  pruned {
    workflow
    edges
    taskProxies
    jobs
  }
}

subscription OnWorkflowTreeDeltasData($workflowId: ID) {
  deltas(workflows: [$workflowId], stripNull: true) {
    ...GraphDeltas
  }
}
`

function posToPath (pos) {
  // the last point comes first, followed by the others in order I.E:
  // -1, 0, 1, 2, ... -3, -2
  const parts = pos.substring(2).split(' ').map(x => x.split(','))
  const [last] = parts.splice(0, 1)
  let path = null
  for (const part of parts) {
    if (!path) {
      path = `M${part[0]},-${part[1]} C`
    } else {
      path = path + ` ${part[0]},-${part[1]}`
    }
  }
  path = path + ` ${last[0]},-${last[1]}`
  console.log(`% ${pos}\n${path}`)
  return path
}

/* TODO: everything! */
// eslint-disable-next-line no-extend-native
String.prototype.nonCryptoHash = function () {
  let hash = 0
  let i
  let chr
  if (this.length === 0) return hash
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

function updateArray (before, after) {
  // remove old items
  for (const item of before) {
    if (after.indexOf(after) === -1) {
      console.log(`NODE-- ${item.id}`)
      before.splice(
        before.indexOf(item), 1
      )
    }
  }
  // insert new items
  for (const item of after) {
    if (before.indexOf(item) === -1) {
      console.log(`NODE++ ${item.id}`)
      before.push(item)
    }
  }
}

export default {
  mixins: [
    pageMixin,
    graphqlMixin,
    subscriptionComponentMixin,
    subscriptionViewMixin
  ],
  name: 'Graph',
  components: {
    GraphNode
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },
  data () {
    return {
      widget: {
        title: 'graph',
        icon: mdiFileTree
      },
      // the auto-refresh timer
      refreshTimer: null,
      // the spacing between nodes
      spacing: 1.5,
      // the nodes end edges we render to the graph
      graphNodes: [],
      graphEdges: [],
      // the svg transformations to apply to each node to apply the layout
      // generated by graphviz
      nodeTransformations: {},
      // Hash derived from the IDs of the nodes and edges in the graph
      // used to avoid needlessly re-laying-out the graph when not needed
      graphID: null
    }
  },
  mounted () {
    svgPanZoom(
      document.getElementById('graphgraph'),
      {
        // NOTE: fix must be false otherwise it's trying to measure up before
        // the viewport is loaded or something like that which causes
        // NaN values to end up in the transformation matrix
        // TODO: enable the "thumbnail" viewer (i.e. minimap, see svg-pan-zoom)
        viewportSelector: '.svg-pan-zoom_viewport',
        panEnabled: true,
        controlIconsEnabled: true,
        zoomEnabled: true,
        dblClickZoomEnabled: true,
        mouseWheelZoomEnabled: true,
        preventMouseEventsDefault: true,
        zoomScaleSensitivity: 0.2,
        minZoom: 0.1, // how zoomed out we can go
        maxZoom: 10, // how zoomed in we can go
        fit: false,
        contain: false,
        center: true,
        refreshRate: 'auto'
      }
    )

    this.refreshTimer = setInterval(this.refresh, 2000)
  },
  beforeDestroy () {
    clearInterval(this.refreshTimer)
  },
  computed: {
    ...mapState('workflows', ['lookup', 'cylcTree']),
    query () {
      return new SubscriptionQuery(
        QUERY,
        this.variables,
        'workflow',
        [
          // new WorkflowCallback()
          new CylcTreeCallback()
        ]
      )
    },
    workflowIDs () {
      return [this.workflowId]
    },
    workflows () {
      const ret = []
      for (const id in this.cylcTree.$index || {}) {
        if (this.workflowIDs.includes(id)) {
          ret.push(this.cylcTree.$index[id])
        }
      }
      return ret
    }
  },
  methods: {
    increaseSpacing () {
      // increase graph layout node spacing by 10%
      this.spacing = this.spacing * 1.1
    },
    decreaseSpacing () {
      // decrease graph layout node spacing by 10%
      this.spacing = this.spacing * (10 / 11)
    },
    getNodes () {
      // list graph nodes from the store (non reactive list)
      const ret = []
      for (const workflow of this.workflows) {
        for (const cycle of workflow.children || []) {
          for (const task of cycle.children || []) {
            ret.push(task)
          }
        }
      }
      return ret
    },
    getEdges () {
      // list graph edges from the store (non reactive list)
      const ret = []
      for (const workflow of this.workflows) {
        for (const edge of workflow.$edges || []) {
          ret.push(edge)
        }
      }
      return ret
    },
    getNodeDimensions () {
      // get the dimensions of currently rendered graph nodes
      // (we feed these dimensions into the GraphViz dot code to improve layout)
      const ret = {}
      for (const id in this.$refs) {
        const elements = this.$refs[id]
        if (elements.length) {
          ret[id] = elements[0].getBBox()
        }
      }
      return ret
    },
    getDotCode (nodeDimensions, nodes, edges) {
      // return GraphViz dot code for the given nodes, edges and dimensions
      const ret = ['digraph {']
      // NOTE: graphviz defaults nodesep=0.25 ranksep=0.5
      // increase the normal sep values to better space our larger nodes
      ret.push(`  nodesep=${this.spacing}`)
      ret.push(`  ranksep=${this.spacing * 2}`)
      ret.push('  node [shape="rect"]')
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
      for (const edge of edges) {
        ret.push(`  "${edge.node.source}":out -> "${edge.node.target}":in`)
      }
      ret.push('}')
      return ret.join('\n')
    },
    hashGraph (nodes, edges) {
      // generate a hash for this list of nodes and edges
      return (
        nodes.map(n => n.id).reduce((x, y) => { return x + y }) +
        edges.map(n => n.id).reduce((x, y) => { return x + y })
      ).nonCryptoHash()
    },
    async refresh () {
      // refresh the graph layout if required

      // extract the graph (non reactive lists of nodes & edges)
      const nodes = this.getNodes()
      const edges = this.getEdges()

      // compute the graph ID
      const graphID = this.hashGraph(nodes, edges)
      if (this.graphID === graphID) {
        // the graph has not changed => do nothing
        return
      }
      this.graphID = graphID

      // wipe the rendered graph
      // this.graphNodes = []
      this.graphEdges = []
      // this.nodeTransformations = {}

      // TODO: this a lot better!
      let keep = null
      for (const id in this.nodeTransformations) {
        // remove the transformations we no longer need
        // leave behind the remainder to avoid causing graph flicker
        // we will update them in translate()
        keep = false
        for (const node of nodes) {
          if (node.id === id) {
            keep = true
            break
          }
        }
        if (!keep) {
          Vue.delete(
            this.nodeTransformations,
            id
          )
        }
      }

      // remove nodes no longer present in the graph
      // TODO: this method is buggy hence calling it multiple times!
      updateArray(this.graphNodes, nodes)
      updateArray(this.graphNodes, nodes)
      updateArray(this.graphNodes, nodes)

      // wait for DOM / graphical updates to happen, then layout the graph
      // we do this because we need to wait for and new nodes to be rendered
      // before we can get the node dimensions required for layout
      await this.wait(this.layout, nodes, edges)
    },
    async wait (callback, nodes, edges) {
      // wait for DOM updates and graphical rendering to complete, then run the
      // callback

      // TODO: the two nextTicks are needed
      // the requestAnimationFrames probably aren't

      await new Promise(requestAnimationFrame)
      await new Promise(requestAnimationFrame)
      this.$nextTick(async function () {
        // DOM updated to node/edge removal
        await new Promise(requestAnimationFrame)
        await new Promise(requestAnimationFrame)
        // graphics updated to chanes
        this.$nextTick(async function () {
          // DOM updated to node addition
          await new Promise(requestAnimationFrame)
          await new Promise(requestAnimationFrame)

          // ok, we're ready, run the update
          await callback(nodes, edges)
        })
      })
    },
    async layout (nodes, edges) {
      // re-layout the graph after any new nodes have been rendered

      // generate the GraphViz dot code
      const nodeDimensions = this.getNodeDimensions()
      const dotCode = this.getDotCode(nodeDimensions, nodes, edges)

      // run the layout algorithm
      graphviz.layout(dotCode, 'json').then((jsonString) => {
        const json = JSON.parse(jsonString)

        // update graph node positions
        for (const obj of json.objects) {
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
        // update edge paths
        this.graphEdges.length = 0 // empty array
        for (const edge of json.edges || []) {
          this.graphEdges.push(posToPath(edge.pos))
        }
      })
    }
  }
}
</script>
