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
          id="arrow-end"
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
              marker-end="url(#arrow-end)"
            />
          </g>
        </g>
        <g v-if="groupCycle || groupFamily">
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
import { mapGetters, mapState } from 'vuex'
import { useJobTheme } from '@/composables/localStorage'
import graphqlMixin from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import {
  initialOptions,
  useInitialOptions
} from '@/utils/initialOptions'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
// import CylcTreeCallback from '@/services/treeCallback'
import GraphNode from '@/components/cylc/GraphNode.vue'
import GraphSubgraph from '@/components/cylc/GraphSubgraph.vue'
import ViewToolbar from '@/components/cylc/ViewToolbar.vue'
import {
  posToPath,
  nonCryptoHash
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
  mdiVectorCombine,
  mdiAlphaCCircle,
  mdiAlphaFCircle
} from '@mdi/js'
import { isFlowNone } from '@/utils/tasks'

/** @typedef {import('@/utils/uid').Tokens} Tokens */

/**
 * A nested Family object
 * @typedef {Object} Family
 * @property {Family[]} children - Array of the familys child families
 * @property {number} id - An integer id (required for vuetify toolbar)
 * @property {string} name - The family name
 * @property {boolean} disabled - used in vuetify toolbar
 */

/**
 * A node object
 * @typedef {Object} Node
 * @property {Node[]} children - The nodes immediate children
 * @property {any} familyTree - The nodes familyTree
 * @property {string} id - The node id
 * @property {string} name - The node name
 * @property {Object} node - The node object (note not of type Node)
 * @property {string} parent - The nodes immediate parent id
 * @property {Tokens} tokens - The nodes token object
 * @property {'task'|'$namespace'|'$edge'} type - The node's type
 */

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
  name
  firstParent {
    id
    name
  }
  task {
    meanElapsedTime
  }
  flowNums
}

fragment FamilyProxyData on FamilyProxy {
  __typename
  id
  state
  isHeld
  isRunahead
  isQueued
  name
  ancestors {
    name
  }
  childTasks {
    id
  }
  firstParent {
    id
    name
  }
}

fragment JobData on Job {
  id
  state
  name
  startedTime
}

fragment FamilyData on Family {
  id
  name
  firstParent {
    id
    name
  }
  childFamilies {
    name
  }
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
  familyProxies {
    ...FamilyProxyData
  }
  jobs {
    ...JobData
  }
  families {
    ...FamilyData
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
  familyProxies {
    ...FamilyProxyData
  }
  jobs {
    ...JobData
  }
  families {
    ...FamilyData
  }
}

fragment PrunedDelta on Pruned {
  workflow
  edges
  taskProxies
  familyProxies
  jobs
  families
}
`
/**
 * Object representing a graph edge.
 *
 * Simplified version of a data store $edge node.
 */
class Edge {
  /**
   * Create a new Edge object.
   * @param {Tokens} tokens - The edge tokens
   */
  constructor (tokens) {
    const { user, workflow } = tokens
    /** @type {Tokens} */
    this.tokens = tokens
    /** @type {Tokens} */
    this.source = tokens.edge[0].clone({ user, workflow })
    /** @type {Tokens} */
    this.target = tokens.edge[1].clone({ user, workflow })
  }
}

/**
 * Get a flattened array of the nested children
 * @property {Node[]} nodeArray - Array of nodes
 * @returns {Object} flattened array of all node childeren (including the original node)
 * @param {String} id - The node id
 * @param {String} name - The node name
 * @param {String} type - 'workflow' | 'cycle' | 'family' | 'task' | 'job'
 * @param {Object[]} children - Array of children
 */
export const childArray = (nodeArray) => {
  return nodeArray.flatMap(({ id, name, children, type }) => {
    // We dont want to include jobs so dont include children if type is "task"
    if (type === 'task') {
      return [{ id, name, type }]
    } else {
      return [{ id, name, children, type }]
        .concat(children ? childArray(children) : [])
    }
  })
}

/**
 * Convert a mapping to a format that VTreeView can handle.
 * @param {Map<string, { children: Map, diabled: Boolean }>} map - The mapping to convert
 * @returns {Object[]} - The converted mapping
 */
export function convertTree (map) {
  return Array.from(map, ([name, { children, disabled }]) => ({
    name,
    children: convertTree(children),
    disabled,
  }))
}

/**
 * Get the nodes binned by cycle point
 *
 * @param {Node[]} nodes - The graph nodes
 * @returns {{ [dateTime: string]: Object[] }=} mapping of cycle points to nodes
 */
export function getCyclesToNodes (nodes) {
  return nodes.reduce((x, y) => {
    (x[y.tokens.cycle] ||= []).push(y)
    return x
  }, {})
}

export default {
  name: 'Graph',

  mixins: [
    graphqlMixin,
    subscriptionComponentMixin
  ],

  components: {
    GraphNode,
    GraphSubgraph,
    ViewToolbar
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

    /**
     * The group by family toggle state.
     * Array containing names of grouped families
     * @type {import('vue').Ref<array>}
     */
    const groupFamily = useInitialOptions('groupFamily', { props, emit }, [])

    /**
     * The collapse by cycle toggle state.
     * Array containing names of collapsed cycles
     * @type {import('vue').Ref<array>}
     */
    const collapseCycle = useInitialOptions('collapseCycle', { props, emit }, [])

    /**
     * The collapse by family toggle state.
     * Array containing names of collapsed families
     * @type {import('vue').Ref<array>}
     */
    const collapseFamily = useInitialOptions('collapseFamily', { props, emit }, [])

    return {
      jobTheme: useJobTheme(),
      transpose,
      autoRefresh,
      spacing,
      groupCycle,
      groupFamily,
      collapseCycle,
      collapseFamily,
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
    ...mapState('workflows', ['cylcTree']),
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
    namespaces () {
      return this.workflows[0]?.$namespaces || []
    },
    /**
     * Gets the Family tree as a nested object for use in vuetify toolbar drop down
     * @returns {Family[]} array containing nested structure of families
     */
    treeDropDownFamily () {
      return this.allParentLookUp.size ? this.getTree() : [{ name: 'No families', disabled: true }]
    },
    /**
     * Gets the array of cycles
     * @returns {string[]}
     */
    cycles () {
      return this.workflows[0]?.children.map(({ tokens }) => tokens.cycle) || []
    },
    /**
     * Object for looking up family ancestors
     *
     * example return mapping:
     * {
     *  GREAT_GRANDPARENT_FAMILY: [ ],
     *  GRANDPARENT_FAMILY: [ 'GREAT_GRANDPARENT_FAMILY' ],
     *  PARENT_FAMILY: [ 'GREAT_GRANDPARENT_FAMILY', 'GRANDPARENT_FAMILY' ],
     *  FAMILY: [ 'GREAT_GRANDPARENT_FAMILY', 'GRANDPARENT_FAMILY', 'PARENT_FAMILY' ],
     * }
     *
     * note: object value arrays contain family names as strings only - not nodes
     *
     * @returns {Map<string, string[]>} keys are family names, values are arrays containing all ancestors names
     */
    allParentLookUp () {
      const lookup = []
      for (const namespace of this.namespaces) {
        if (namespace.name === 'root') continue
        const ancestors = []
        let parent = namespace.node.firstParent
        while (parent.name !== 'root') {
          const parentNode = this.cylcTree.$index[parent.id]
          ancestors.unshift(parentNode.name)
          parent = parentNode.node.firstParent
        }
        lookup.push([namespace.name, ancestors])
      }
      // Sort by shortest ancestor list to longest:
      return new Map(lookup.sort((a, b) => a[1].length - b[1].length))
    },
    /**
     * Object for looking up children
     *
     * example return object
     *
     * {
     *  workflow-name/run1/cycle/PARENT_FAMILY:
     *   [
     *     {
     *       id: 'workflow-name/run1/cycle/PARENT_FAMILY'
     *       name: 'PARENT_FAMILY'
     *       children: Proxy
     *     },
     *     {
     *       id: 'workflow-name/run1/cycle/FAMILY'
     *       name: 'FAMILY'
     *       children: Proxy
     *     },
     *     {
     *       id: 'workflow-name/run1/cycle/task1'
     *       name: 'task1'
     *       children: Proxy
     *     }
     *   ]
     *  workflow-name/run1/cycle/FAMILY:
     *   [
     *     {
     *       id: 'workflow-name/run1/cycle/FAMILY'
     *       name: 'FAMILY'
     *       children: Proxy
     *     },
     *     {
     *       id: 'workflow-name/run1/cycle/task1'
     *       name: 'task1'
     *       children: Proxy
     *     }
     *   ]
     *  workflow-name/run1/cycle/task1:
     *   [
     *     {
     *       id: 'workflow-name/run1/cycle/task1'
     *       name: 'task1'
     *       children: Proxy
     *     }
     *   ]
     * }
     * @returns {Object} keys are node ids, values are arrays of objects containing all children
     */
    allChildrenLookUp () {
      const lookup = {}
      for (const workflow of this.workflows) {
        lookup[workflow.id] = childArray([workflow])
        for (const cycle of workflow.children) {
          lookup[cycle.id] = childArray([cycle])
          // for tasks
          for (const task of cycle.children) {
            lookup[task.id] = childArray([task])
          }
          // for families
          for (const family of this.allParentLookUp.keys()) {
            const familyId = `${cycle.id}/${family}`
            if (this.cylcTree.$index[familyId]) {
              lookup[familyId] = childArray([this.cylcTree.$index[familyId]])
            }
          }
        }
      }
      return lookup
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
              disableIf: ['autoRefresh']
            },
            {
              title: 'Auto Refresh',
              icon: mdiTimer,
              action: 'toggle',
              value: this.autoRefresh,
              key: 'autoRefresh'
            },
            {
              title: 'Transpose',
              icon: mdiFileRotateRight,
              action: 'toggle',
              value: this.transpose,
              key: 'transpose'
            },
            {
              title: 'Centre',
              icon: mdiImageFilterCenterFocus,
              action: 'callback',
              callback: this.reset
            },
            {
              title: 'Increase Spacing',
              icon: mdiArrowExpand,
              action: 'callback',
              callback: this.increaseSpacing
            },
            {
              title: 'Decrease Spacing',
              icon: mdiArrowCollapse,
              action: 'callback',
              callback: this.decreaseSpacing
            },
            {
              title: 'Group by cycle point',
              icon: mdiVectorSelection,
              action: 'toggle',
              value: this.groupCycle,
              key: 'groupCycle'
            },
            {
              title: 'Group by family',
              icon: mdiVectorCombine,
              action: 'select-tree',
              value: this.groupFamily,
              key: 'groupFamily',
              items: this.treeDropDownFamily,
            },
            {
              title: 'Collapse by cycle point',
              icon: mdiAlphaCCircle,
              action: 'select-tree',
              value: this.collapseCycle,
              key: 'collapseCycle',
              items: this.cycles.map((name) => ({ name })),
            },
            {
              title: 'Collapse by family',
              icon: mdiAlphaFCircle,
              action: 'select-tree',
              value: this.collapseFamily,
              key: 'collapseFamily',
              items: this.treeDropDownFamily,
            }
          ]
        }
      ]
    }
  },

  methods: {
    /**
     * Get a nested object of families
     *
     * @returns {Family[]} array containing nested structure of families
     */
    getTree () {
      const tree = new Map()
      for (const [name, ancestors] of this.allParentLookUp) {
        let pointer = tree
        let disabled = false
        for (const ancestor of ancestors) {
          pointer = pointer.get(ancestor).children
          disabled ||= this.collapseFamily.includes(ancestor)
        }
        pointer.set(name, {
          children: new Map(),
          disabled,
        })
      }
      return convertTree(tree)
    },

    /**
     * Creates an edge from the name and cycle of source and target nodes
     * @param {Object} param0 - the source and target node names and cycles
     * @returns {[string, Edge]} the created edge
     */
    createEdge ({ sourceName, targetName, sourceCycle, targetCycle }) {
      let src, tgt
      if (sourceName === sourceCycle && targetName === targetCycle) {
        // both source & target collapsed by cycle point
        src = tgt = `${sourceCycle}|${targetCycle}`
      } else if (sourceName === sourceCycle) {
        // source collapsed by cycle point
        src = tgt = `${sourceCycle}|${targetCycle}/${targetName}`
      } else if (targetName === targetCycle) {
        // target collapsed by cycle point
        src = tgt = `${sourceCycle}/${sourceName}|${targetCycle}`
      } else {
        // not collapsed by cycle point
        src = `${sourceCycle}/${sourceName}`
        tgt = `${targetCycle}/${targetName}`
      }
      const tokens = this.workflows[0].tokens.clone({
        cycle: `$edge|${src}|${tgt}`
      })
      return [tokens.id, new Edge(tokens)]
    },

    /**
     * Removes source and target edges from the map of edges.
     * @param {string} id - ID of source node of edge to be removed
     * @param {Map<string, Edge>} edges - edges included in the graph
     * @returns {Edge[]} removed edge store arrays
     */
    removeEdges (id, edges) {
      const removed = []
      for (const [edgeID, edge] of edges) {
        if ([edge.source.id, edge.target.id].includes(id)) {
          edges.delete(edgeID) && removed.push(edge)
        }
      }
      return removed
    },

    /**
     * Check if node is collapsed by an ancestor family
     *
     * @param {string} id - ID of the task/family/namespace
     * @returns {string=} name of the collapsed ancestor if any
     */
    getCollapsedAncestor (id) {
      const { name } = this.cylcTree.$index[id].node.firstParent
      if (name !== 'root') {
        // TODO: could use Set.intersection if browser support is good enough?
        return this.collapseFamily.find((family) => (
          name === family || this.allParentLookUp.get(name).includes(family)
        ))
      }
    },

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
          refreshRate: 'auto'
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
      return this.workflows.flatMap(
        (workflow) => workflow.children.flatMap(
          (cycle) => cycle.children
        )
      )
    },

    getGraphEdges () {
      // map graph edges from the store (non reactive)
      const ret = new Map()
      for (const { $edges } of this.workflows) {
        for (const { tokens } of $edges || []) {
          ret.set(tokens.id, new Edge(tokens))
        }
      }
      return ret
    },

    /**
     * Get the dimensions of currently rendered graph nodes
     * (we feed these dimensions into the GraphViz dot code to improve layout).
     *
     * @param {Node[]} nodes - The graph nodes
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
     * Recursive function that adds a subgraph to the dot code
     *
     * Terminology:
     * The pointer is a node object passed to the method
     * The pointer child is the family that will be grouped
     * The pointer grandchildren are the nodes that will be included in the grouping
     *
     * @param {String[]} dotcode - The array of strings that make up the dot code
     * @param {Node} pointer - Node object pointer used for recursion to navigate graph tree
     */
    addSubgraph (dotcode, pointer) {
      // If there are no families grouped we dont need to run this code
      if (!this.groupFamily.length) {
        return
      }
      // We can only group by nodes of type family
      if (pointer.type !== 'family') {
        return
      }

      // The pointer has children
      // We want to see if we can group each child
      for (const child of pointer.children) {
        // The pointer child has children (grandChildren)
        // These grandChildren are the nodes that will be included in the grouping
        const grandChildren = this.allChildrenLookUp[child.id]
        if (!grandChildren) { return }
        // Some of the nodes may have been collapsed
        // Work out if any have and store for reference later
        const removedNodes = new Set()
        for (const grandChild of grandChildren) {
          if (this.collapseFamily.includes(grandChild.name)) {
            for (const child of grandChild.children) {
              removedNodes.add(child.name)
            }
          }
        }
        let openedBrackets = false
        if (
          // If this pointer has grandchildren
          grandChildren.length &&
          // Is the child of the pointer a family that is grouped?
          // If yes - we want to include in the grouping
          this.groupFamily.includes(child.node.name) &&
          // But if its collapsed then we dont want to group it
          // We dont put boxes around collapsed nodes - design choice
          !this.collapseFamily.includes(child.node.name)
        ) {
          // Take our array of grandchildren and remove nodes that we dont want to include
          // nodeFormattedArray will be an array of string node ids to be included in the grouping
          const nodeFormattedArray = grandChildren.filter((grandChild) => (
            // if its not in the list of families (unless its been collapsed)
            (!this.allParentLookUp.has(grandChild.name) || this.collapseFamily.includes(grandChild.name)) &&
            // the node has been removed/collapsed
            !removedNodes.has(grandChild.name) &&
            // the node doesnt have a collapsed ancestor
            !this.getCollapsedAncestor(grandChild.id)
          )).map(a => `"${a.id}"`)
          // if there are any nodes left after the filtering step
          // make a dotcode subgraph string
          if (nodeFormattedArray.length) {
            openedBrackets = true
            dotcode.push(`
            subgraph cluster_margin_family_${child.name}${child.tokens.cycle}
              {
              margin=100.0
              label="margin"
              subgraph cluster_${child.name}${child.tokens.cycle}
                {${nodeFormattedArray}${nodeFormattedArray.length ? ';' : ''}
                  label = "${child.name}"
                  fontsize = "70px"
                  style=dashed
                  margin=60.0
            `)
          }
        }

        // If there the pointer has a child
        // repeat the process for that child
        if (child) {
          this.addSubgraph(dotcode, child)
        }
        if (openedBrackets) {
          dotcode.push('}}')
        }
      }
    },

    getDotCode (nodeDimensions, nodes, edges, cyclesToNodes) {
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

      const graphSections = {}
      for (const [cycle, nodesInCycle] of Object.entries(cyclesToNodes)) {
        if (nodesInCycle.length && !this.collapseCycle.includes(cycle)) {
          for (const task of nodesInCycle) {
            const section = graphSections[task.node.firstParent.id] ??= []
            section.push(`${task.name} [title=${task.name}]`)
          }
          if (this.groupCycle) {
            const removedNodes = new Set()
            for (const node of nodesInCycle) {
              if (this.collapseFamily.includes(node.name)) {
                for (const child of this.allChildrenLookUp[node.id]) {
                  removedNodes.add(child.name)
                }
              }
            }
            const nodeFormattedArray = nodesInCycle.filter((a) => (
              // if its not in the list of families (unless its been collapsed)
              (!this.allParentLookUp.has(a.name) || this.collapseFamily.includes(a.name)) &&
              // the node has been removed/collapsed
              (!removedNodes.has(a.name) || this.collapseFamily.includes(a.name)) &&
              // its not a node representing this cycle
              a.name !== cycle &&
              // its not the root node
              a.name !== 'root' &&
              // the node doesnt have a collapsed ancestor
              !this.getCollapsedAncestor(a.id)
            )).map(a => `"${a.id}"`)
            ret.push(`
              subgraph cluster_margin_family_${cycle}
                {
                margin=100.0
                label="margin"
                subgraph cluster_${cycle} {
                    ${nodeFormattedArray}${nodeFormattedArray.length ? ';' : ''}
                    label = "${cycle}"
                    fontsize = "70px"
                    style=dashed
                    margin=60.0
              `)
          }
          this.addSubgraph(ret, this.cylcTree.$index[`${this.workflowIDs[0]}//${cycle}/root`])
          if (this.groupCycle) {
            ret.push('}}')
          }
        }
      }

      if (this.transpose) {
        // left-right orientation
        // route edges from anywhere on the node of the source task to anywhere
        // on the task *node* of the destination task *icon*
        for (const edge of edges.values()) {
          ret.push(`  "${edge.source.id}" -> "${edge.target.id}":task`)
        }
      } else {
        // top-bottom orientation
        // route edges from the bottom of the source task *icon* to the top of
        // the destination task *icon*
        for (const edge of edges.values()) {
          ret.push(`  "${edge.source.id}":out -> "${edge.target.id}":in`)
        }
      }
      ret.push('}')
      return ret.join('\n')
    },

    /**
     * Generate a hash for this list of nodes and edges.
     * @param {Node[]} nodes
     * @param {Map<string, Edge>} edges
     */
    hashGraph (nodes, edges) {
      return nonCryptoHash(
        nodes.reduce((acc, n) => acc + n.id, '') +
        Array.from(edges.keys()).reduce((acc, id) => acc + id, '')
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
        y: -realZoom * (bbox.y - height / (realZoom * 2) + bbox.height / 2)
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
      let nodes = await this.waitFor(() => {
        const nodes = this.getGraphNodes()
        return nodes.length ? nodes : false
      })
      const edges = this.getGraphEdges()

      for (const cycle of this.collapseCycle) {
        const cycleNode = this.cylcTree.$index[
          this.workflows[0].tokens.clone({ cycle }).id
        ]
        if (!cycleNode) continue
        // ---------------REMOVE NODES BASED ON CYCLE POINT------------
        // must do this before removing nodes/edges based on family as cycle collapsing takes priority over families
        for (const { id } of this.allChildrenLookUp[cycleNode.id]) {
          if (id !== cycleNode.id) {
            // REMOVE NODES
            nodes = nodes.filter((node) => node.id !== id)
            // REMOVE EDGES
            // if there is an edge with a source or target it needs removing
            for (const edge of this.removeEdges(id, edges)) {
              // ---------------ADD EDGES BASED ON CYCLE POINT------------
              // prevent self-loop edges:
              if (edge.source.cycle === edge.target.cycle) continue

              const sourceName = this.collapseCycle.includes(edge.source.cycle)
                ? edge.source.cycle
                : this.getCollapsedAncestor(edge.source.id) ?? edge.source.task
              const targetName = this.collapseCycle.includes(edge.target.cycle)
                ? edge.target.cycle
                : this.getCollapsedAncestor(edge.target.id) ?? edge.target.task

              edges.set(
                ...this.createEdge({
                  sourceName,
                  sourceCycle: edge.source.cycle,
                  targetName,
                  targetCycle: edge.target.cycle,
                })
              )
            }
          }
        }
        // ---------------ADD NODES BASED ON CYCLE POINT------------
        nodes.push(cycleNode)
      }

      for (const family of this.collapseFamily) {
        for (const cycle of this.cycles) {
          // ...get the node from the index...
          const famNode = this.cylcTree.$index[
            this.workflows[0].tokens.clone({ cycle, task: family }).id
          ]
          if (!famNode) continue
          // ...now we have a node - we have to understand all its relations in the graph...
          // ---------------REMOVE NODES BASED ON FAMILY------------
          // ...this node is collapsed so need to remove any of its children
          // (nodes and edges) from the graph if it has any...
          for (const { id } of this.allChildrenLookUp[famNode.id]) {
            if (id !== famNode.id) {
              // REMOVE NODES
              nodes = nodes.filter((node) => node.id !== id)
              // REMOVE EDGES
              // if there is an edge with a source or target it needs removing
              for (const edge of this.removeEdges(id, edges)) {
                // ---------------ADD EDGES BASED ON FAMILY------------
                // skip if one end of edge is in a collapsed cycle - deal with this later:
                if (this.collapseCycle.some(
                  (x) => x === edge.source.cycle || x === edge.target.cycle
                )) continue

                // ...this node is collapsed so need to remove any of its children (nodes and edges) from the graph if it has any...
                const sourceName = this.getCollapsedAncestor(edge.source.id) ?? edge.source.task
                const targetName = this.getCollapsedAncestor(edge.target.id) ?? edge.target.task
                // prevent self-loop edges:
                if (sourceName === targetName && edge.source.cycle === edge.target.cycle) continue

                edges.set(
                  ...this.createEdge({
                    sourceName,
                    sourceCycle: edge.source.cycle,
                    targetName,
                    targetCycle: edge.target.cycle,
                  })
                )
              }
            }
          }
          // ...now we have removed any parts of child nodes that shouldnt be there we can add nodes and edges that should be...
          // ---------------ADD NODES BASED ON FAMILY------------
          if (!this.collapseCycle.includes(cycle) && !this.getCollapsedAncestor(famNode.id)) {
            nodes.push(famNode)
          }
        }
      }

      if (!nodes || !nodes.length) {
        // we can't graph this, reset and wait for something to draw
        this.graphID = null
        this.updating = false
        return
      }

      const cyclesToNodes = getCyclesToNodes(nodes)
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
        await this.layout(nodes, edges, nodeDimensions, cyclesToNodes)
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
        const lastEdgeID = `edge-${edges.size - 1}`
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
     * @param {Node[]} nodes
     * @param {Map<string, Edge>} edges
     * @param {{ [id: string]: SVGRect }} nodeDimensions
     */
    async layout (nodes, edges, nodeDimensions, cyclesToNodes) {
      // generate the GraphViz dot code
      const dotCode = this.getDotCode(nodeDimensions, nodes, edges, cyclesToNodes)

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
              label: obj.label
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
    }
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
    groupCycle (newValue, oldValue) {
      // refresh the graph when group by cycle point option is changed
      this.graphID = null
      this.refresh()
      // if (newValue === true) { this.groupFamily = false }
    },
    groupFamily (newValue, oldValue) {
      // refresh the graph when group by family option is changed
      this.graphID = null
      this.refresh()
      // if (newValue === true) { this.groupCycle = false }
    },
    collapseFamily (newValue, oldValue) {
      // refresh the graph when group by family option is changed
      this.graphID = null
      this.refresh()
      // if (newValue === true) { this.groupCycle = false }
    },
    collapseCycle (newValue, oldValue) {
      // refresh the graph when group by family option is changed
      this.graphID = null
      this.refresh()
      // if (newValue === true) { this.groupCycle = false }
    }
  }
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
