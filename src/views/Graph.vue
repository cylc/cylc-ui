<style>
@import '~@/styles/cytoscape/panzoom.css';
@import '~@/styles/cytoscape/cytoscape-custom.css';
</style>
<template>
  <div id='holder'>
    <SyncLoader :loading='loading' :color='color' :size='size' class='spinner'></SyncLoader>
    <div class='switchlayout'>
      <v-btn id='dagre-button' name='dagre' align-center justify-center :depressed='true' class='dagre-button'>DAGRE</v-btn>
      <v-btn id='cosebilkent-button' name='cose-bilkent' align-center justify-center :depressed='true' class='cosebilkent-button'>COSE-BILKENT</v-btn>
      <v-btn id='klay-button' align-center justify-center :depressed='true' class='klay-button'>KLAY</v-btn>
      <v-btn id='hierarchical-button' name='hierarchical' align-center justify-center :depressed='true' class='hierarchical-button'>HIERARCHICAL</v-btn>
    <v-btn id='cola-button' name='cola' align-center justify-center :depressed='false' class='cola-button'>COLA</v-btn>
    </div>
    <div class='cytoscape-navigator-overlay'>
      <canvas></canvas>
      <div class='cytoscape-navigatorView'></div>
      <div class='cytoscape-navigatorOverlay'></div>
    </div>
    <b id='collapseAll' class='collapseAll' style='cursor: pointer; color: white'>collapse all</b> /
    <cytoscape id='cytoscape' :pre-config='preConfig' :after-created='afterCreated' :debug='true'>
    </cytoscape>
  </div>
</template>

<script>
import cytoscape from 'cytoscape'
import cola from 'cytoscape-cola'
import dagre from 'cytoscape-dagre'
import klay from 'cytoscape-klay'
import coseBilkent from 'cytoscape-cose-bilkent'
import navigator from 'cytoscape-navigator'
import panzoom from 'cytoscape-panzoom'
import expandCollapse from 'cytoscape-expand-collapse'
import undoRedo from 'cytoscape-undo-redo'
import popper from 'cytoscape-popper'
import jquery from 'jquery'
import axios from 'axios'
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'
import Tippy from 'tippy.js'

import VueCytoscape from '@/components/core/Cytoscape.vue'
import { mixin } from '@/mixins/index'

const DATA_URL = 'simple-cytoscape-dot.7.js'
let ur = {}
// eslint-disable-next-line no-unused-vars
const loading = true
let layoutOptions = {}
let expandCollapseOptions = {}
let tippy

const nodeOptions = {
  normal: {
    bgColor: '#444'
  },
  selected: {
    bgColor: 'yellow'
  },
  active: {
    bgColor: 'yellow'
  }
}

var edgeOptions = {
  normal: {
    lineColor: '#fff'
  },
  selected: {
    lineColor: 'yellow'
  }
}

export default {
  name: 'Graph',
  mixins: [mixin],
  metaInfo () {
    // TODO: once the component is using live data, use the workflow name here
    // const workflowName = this.$route.params.name || '(TODO)'
    // and pass to the getPageTitle('App.graph', , { name: workflowName })
    return {
      title: this.getPageTitle('App.graph')
    }
  },
  beforeRouteLeave (to, from, next) {
    if (tippy) {
      tippy.hide()
    }
    next()
  },
  components: {
    SyncLoader,
    cytoscape: VueCytoscape
  },
  data () {
    return {
      i: 1,
      // vue-spinner
      color: '#5e9aff',
      height: '35px',
      width: '4px',
      margin: '2px',
      radius: '2px',
      size: '1em',
      loading: true
    }
  },
  methods: {
    preConfig (cytoscape) {
      // cytoscape: this is the cytoscape constructor
      cytoscape.use(cola)
      cytoscape.use(dagre)
      cytoscape.use(coseBilkent)
      cytoscape.use(klay)
    },
    async afterCreated (cy) {
      const dagreOptions = {
        name: 'dagre',
        //  // dagre algo options, uses default value on undefined
        nodeSep: 140, // the separation between adjacent nodes in the same rank
        edgeSep: 30, // the separation between adjacent edges in the same rank
        rankSep: 140, // the separation between adjacent nodes in the same rank
        rankDir: 'TB', // 'TB' for top to bottom flow, 'LR' for left to right
        // eslint-disable-next-line no-unused-vars
        minLen: function (edge) {
          return 1
        }, // number of ranks to keep between the source and target of the edge
        // eslint-disable-next-line no-unused-vars
        edgeWeight: function (edge) {
          return 1
        }, // higher weight edges are generally made shorter and straighter than lower weight edges
        // general layout options
        fit: true, // whether to fit to viewport
        padding: 150, // fit padding
        spacingFactor: 1.2, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        boundingBox: undefined, // constrain layout bounds { x1, y1, x2, y2 } or { x1, y1, w, h }
        ready: function () {}, // on layoutready
        stop: function () {} // on layoutstop
      }

      const coseBilkentOptions = {
        name: 'cose-bilkent',
        ready: function () {}, // Called on `layoutready`
        stop: function () {}, // Called on `layoutstop`
        nodeDimensionsIncludeLabels: false, // Whether to include labels in node dimensions. Useful for avoiding label overlap
        refresh: 30, // number of ticks per frame higher is faster but more jerky
        fit: true, // Whether to fit the network view after when done
        padding: 10, // Padding on fit
        randomize: true, // Whether to enable incremental mode
        nodeRepulsion: 4500, // Node repulsion (non overlapping) multiplier
        idealEdgeLength: 50, // Ideal (intra-graph) edge length
        edgeElasticity: 0.45, // Divisor to compute edge forces
        nestingFactor: 0.1, // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
        gravity: 0.25, // Gravity force (constant)
        numIter: 2500, // Maximum number of iterations to perform
        tile: true, // Whether to tile disconnected nodes
        animate: 'end', // Type of layout animation. The option set is {'during', 'end', false}
        tilingPaddingVertical: 10, // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
        tilingPaddingHorizontal: 10, // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
        gravityRangeCompound: 1.5, // Gravity range (constant) for compounds
        gravityCompound: 1.0, // Gravity force (constant) for compounds
        gravityRange: 3.8, // Gravity range (constant)
        initialEnergyOnIncremental: 0.5 // Initial cooling factor for incremental layout
      }

      const klayLayoutOptions = {
        name: 'klay',
        nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
        fit: false, // Whether to fit
        padding: 20, // Padding on fit
        animate: false, // Whether to transition the node positions
        // eslint-disable-next-line no-unused-vars
        animateFilter: function (node, i) {
          return true
        }, // Whether to animate specific nodes when animation is on non-animated nodes immediately go to their final positions
        animationDuration: 500, // Duration of animation in ms if enabled
        animationEasing: undefined, // Easing of animation if enabled
        transform: function (node, pos) {
          return pos
        }, // A function that applies a transform to the final node position
        ready: undefined, // Callback on layoutready
        stop: undefined, // Callback on layoutstop
        klay: {
          // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
          addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
          aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
          borderSpacing: 20, // Minimal amount of space to be left to the border
          compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
          crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
          /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
          INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
          cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
          /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
          INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values. */
          direction: 'RIGHT', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
          /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
          edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
          edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
          feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
          fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
          /* NONE Chooses the smallest layout from the four possible candidates.
          LEFTUP Chooses the left-up candidate from the four possible candidates.
          RIGHTUP Chooses the right-up candidate from the four possible candidates.
          LEFTDOWN Chooses the left-down candidate from the four possible candidates.
          RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
          BALANCED Creates a balanced layout from the four possible candidates. */
          inLayerSpacingFactor: 3.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
          layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
          linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
          mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
          mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
          nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering.
          /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
          LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
          INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
          nodePlacement: 'INTERACTIVE', // Strategy for Node Placement
          /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
          LINEAR_SEGMENTS Computes a balanced placement.
          INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
          SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
          randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm 0 means a new seed is generated
          routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
          separateConnectedComponents: true, // Whether each connected component should be processed separately
          spacing: 24, // Overall setting for the minimal amount of space to be left between objects
          thoroughness: 7 // How much effort should be spent to produce a nice layout..
        },
        // eslint-disable-next-line no-unused-vars
        priority: function (edge) {
          return null
        } // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
      }

      const colaLayoutOptions = {
        name: 'cola',
        animate: true, // whether to show the layout as it's running
        refresh: 1, // number of ticks per frame; higher is faster but more jerky
        maxSimulationTime: 4000, // max length in ms to run the layout
        ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
        fit: false, // on every layout reposition of nodes, fit the viewport
        padding: 30, // padding around the simulation
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

        // layout event callbacks
        ready: function () {}, // on layoutready
        stop: function () {}, // on layoutstop

        // positioning options
        randomize: false, // use random node positions at beginning of layout
        avoidOverlap: true, // if true, prevents overlap of node bounding boxes
        handleDisconnected: true, // if true, avoids disconnected components from overlapping
        convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
        // eslint-disable-next-line no-unused-vars
        nodeSpacing: function (node) {
          return 100
        }, // extra spacing around nodes
        flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
        alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
        gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{'axis':'y', 'left':node1, 'right':node2, 'gap':25}]

        // different methods of specifying edge length
        // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
        edgeLength: undefined, // sets edge length directly in simulation
        edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
        edgeJaccardLength: undefined, // jaccard edge length in simulation

        // iterations of cola algorithm; uses default values on undefined
        unconstrIter: undefined, // unconstrained initial layout iterations
        userConstIter: undefined, // initial layout iterations with user-specified constraints
        allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

        // infinite layout options
        infinite: false // overrides all other options for a forces-all-the-time mode
      }

      async function registerExtensions (instance) {
        // register extensions
        if (typeof cytoscape('core', 'navigator') !== 'function') {
          console.log('registering navigator')
          navigator(cytoscape)
        }

        if (typeof cytoscape('core', 'panzoom') !== 'function') {
          console.log('registering panzoom')
          panzoom(cytoscape)
        }

        if (typeof cytoscape('core', 'undoRedo') !== 'function') {
          console.log('registering undoRedo')
          undoRedo(cytoscape)
        }

        if (typeof cytoscape('core', 'expandCollapse') !== 'function') {
          console.log('registering expandCollapse with jquery')
          expandCollapse(cytoscape, jquery)
        }

        if (typeof cytoscape('core', 'popper') !== 'function') {
          console.log('registering popper')
          popper(cytoscape)
        }
      }

      async function updateData () {
        try {
          const data = await axios.get(DATA_URL)
          return data
        } catch (error) {
          console.log('error', error)
        }
      }

      async function updateStyle () {
        try {
          const data = await updateData()
          return updateConfig(data)
        } catch (error) {
          console.log('error', error)
        }
      }

      async function updateConfig (data) {
        try {
          const config = {
            autounselectify: true,
            boxSelectionEnabled: true,
            layout: {
              name: 'dagre',
              textureOnViewport: false,
              hideEdgesOnViewport: true
            },
            style: [
              {
                selector: 'node',
                css: {
                  'background-image': function (node) {
                    let path = node.data('icon')
                    if (path === undefined || path === '') {
                      path = require('@/../public/img/baseline-donut_large-24px.svg')
                    }
                    return path
                  },
                  'background-fit': 'contain contain',
                  'background-image-opacity': function (node) {
                    return node.data('running') > 0 ? 1.0 : 0.6
                  },
                  'background-color': 'data(state)',
                  content: 'data(label)',
                  'font-family': 'Avenir, Helvetica, Arial, sans-serif',
                  color: '#fff',
                  'text-max-width': '.5em',
                  'text-wrap': 'wrap',
                  'text-valign': 'top',
                  'text-halign': 'right',
                  'line-height': 1.1,
                  'text-margin-x': 5,
                  'font-size': '.8em',
                  'min-zoomed-font-size': '.8em',
                  'border-color': '#fff',
                  'border-width': '.4em',
                  shape: 'data(shape)',
                  width: '6em',
                  height: '6em',
                  // 'pie-size': '5.6em', //The diameter of the pie, measured as a percent of node size (e.g. 100%) or an absolute length (e.g. 25px).
                  'pie-size': function (node) {
                    let size
                    node.data('running') > 0 ? size = '5.6em' : size = '0%'
                    return size
                  },
                  'pie-1-background-color': '#9ef9ff', // The colour of the node’s ith pie chart slice.
                  'pie-1-background-size': 'mapData(submitted, 0, 100, 0, 100)',
                  'pie-1-background-opacity': 0.7,
                  'pie-2-background-color': '#4ab7ff',
                  'pie-2-background-size': 'mapData(running, 0, 100, 0, 100)',
                  'pie-2-background-opacity': 0.7,
                  'pie-3-background-color': '#31ff53',
                  'pie-3-background-size': 'mapData(succeeded, 0, 100, 0, 100)', // The size of the node’s ith pie chart slice, measured in percent (e.g. 25% or 25).
                  'pie-3-background-opacity': 0.7,
                  'pie-4-background-color': '#ff3a2b',
                  'pie-4-background-size': 'mapData(failed, 0, 100, 0, 100)',
                  'pie-4-background-opacity': 0.7,
                  'pie-5-background-color': '#d453ff',
                  'pie-5-background-size': 'mapData(subfailed, 0, 100, 0, 100)',
                  'pie-5-background-opacity': 0.7,
                  'pie-6-background-color': '#fefaff',
                  'pie-6-background-size': 'mapData(expired, 0, 100, 0, 100)',
                  'pie-6-background-opacity': 0.7,
                  'pie-7-background-color': '#fff138',
                  'pie-7-background-size': 'mapData(queued, 0, 100, 0, 100)',
                  'pie-7-background-opacity': 0.7,
                  'pie-8-background-color': '#ff3a2b',
                  'pie-8-background-size': 'mapData(retrying, 0, 100, 0, 100)',
                  'pie-8-background-opacity': 0.7,
                  'pie-9-background-color': '#666',
                  'pie-9-background-size': 'mapData(waiting, 0, 100, 0, 100)',
                  'pie-9-background-opacity': 0.7,
                  'pie-10-background-color': '#cacaca',
                  'pie-10-background-size': 'mapData(todo, 0, 100, 0, 100)',
                  'pie-10-background-opacity': 0.7
                }
              },
              {
                selector: 'edge',
                css: {
                  width: 5,
                  'curve-style': 'bezier',
                  'target-arrow-shape': 'triangle',
                  'line-color': edgeOptions.normal.lineColor,
                  'target-arrow-color': '#fff',
                  opacity: 0.8,
                  'target-distance-from-node': 10
                }
              },
              {
                selector: 'edge.selected',
                style: {
                  width: 10,
                  lineColor: edgeOptions.selected.lineColor,
                  'target-arrow-color': edgeOptions.selected.lineColor
                }
              },
              {
                selector: 'node.highlight',
                style: {
                  'border-color': '#fff',
                  'border-width': '2px'
                }
              },
              {
                selector: 'node.semitransp',
                style: { opacity: '0.5' }
              },
              {
                selector: 'node.selected',
                style: { 'background-color': nodeOptions.selected.bgColor }
              },
              {
                selector: 'edge.highlight',
                style: { 'mid-target-arrow-color': 'yellow' }
              },
              {
                selector: 'edge.semitransp',
                style: { opacity: '0.2' }
              },
              {
                selector: 'node.cy-expand-collapse-collapsed-node',
                style: {
                  'background-color': '#333',
                  shape: 'rectangle'
                }
              },
              {
                selector: 'edge.cy-expand-collapse-meta-edge',
                style: {
                  'background-color': 'green',
                  shape: 'rectangle'
                }
              },
              {
                selector: ':parent',
                style: {
                  'background-opacity': 0.2,
                  // 'background-image-opacity': .2,
                  'background-fit': 'contain contain',
                  'background-color': '#b7c0e8',
                  'border-color': '#444',
                  'border-width': '2px',
                  'pie-size': '5.6em'
                }
              },
              {
                selector: ':child',
                style: {
                  // 'background-opacity': .15,
                  // 'background-image-opacity': .15,
                  // 'background-color': '#b7c0e8',
                  'border-color': '#444',
                  'border-width': '2px'
                }
              }
            ],
            elements: []
          }

          return config
        } catch (error) {
          console.log('error', error)
        }
      }

      // eslint-disable-next-line no-unused-vars
      async function runlayout (instance) {
        try {
          const cy = instance
          await cy
            .elements()
            .layout(layoutOptions)
            .run()
          return cy
        } catch (error) {
          console.log('error', error)
        }
      }

      async function setupUndo (instance) {
        const cy = instance
        const ur = cy.undoRedo()
        cy.expandCollapse(expandCollapseOptions)
        const api = cy.expandCollapse('get')
        api.collapseAll()
        layoutOptions = dagreOptions
        return ur
      }

      async function getGraph (instance) {
        await registerExtensions()
        layoutOptions = dagreOptions
        const cy = await runlayout(instance)
        const ur = await setupUndo(cy)
        getPanzoom(cy)
        getNavigator(cy)
        getUndoRedo(cy)
        cy.expandCollapse(expandCollapseOptions)
        const api = cy.expandCollapse('get')
        api.collapseAll()
        return ur
      }

      // load graph data and run layout
      const { data: elements } = await updateData()
      const stylesheet = await updateStyle()
      cy = await cytoscape({
        container: document.getElementById('cytoscape'),
        elements: elements,
        style: stylesheet.style
      })
      ur = await getGraph(cy)
      console.log('loaded elements: ', elements, cy)
      this.loading = false // remove spinner
      // ----------------------------------------

      function getPanzoom () {
        const panzoomdefaults = {
          zoomFactor: 0.1, // zoom factor per zoom tick
          zoomDelay: 45, // how many ms between zoom ticks
          minZoom: 0.1, // min zoom level
          maxZoom: 10, // max zoom level
          fitPadding: 50, // padding when fitting
          panSpeed: 10, // how many ms in between pan ticks
          panDistance: 100, // max pan distance per tick
          panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
          panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
          panInactiveArea: 8, // radius of inactive area in pan drag box
          panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib) scales from this to 1.0
          zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
          fitSelector: undefined, // selector of elements to fit
          animateOnFit: function () {
            // whether to animate on fit
            return false
          },
          fitAnimationDuration: 1000 // duration of animation on fit
        }
        cy.panzoom(panzoomdefaults)
        return cy.panzoom
      }
      // hierarchical clustering internal needs cy instance
      // eslint-disable-next-line no-unused-vars
      const hca = cy.elements().hca({
        mode: 'threshold',
        threshold: 25,
        distance: 'euclidian', // euclidian, squaredEuclidian, manhattan, max
        preference: 'mean', // median, mean, min, max,
        damping: 0.8, // [0.5 - 1]
        minIterations: 100, // [optional] The minimum number of iteraions the algorithm will run before stopping (default 100).
        maxIterations: 1000, // [optional] The maximum number of iteraions the algorithm will run before stopping (default 1000).
        attributes: [
          function (node) {
            return node.data('weight')
          }
        ]
      })

      function getNavigator (cy) {
        cy.navigator({
          container: '.cytoscape-navigator-overlay',
          viewLiveFramerate: 0, // set false to update graph pan only on drag end set 0 to do it instantly set a number (frames per second) to update not more than N times per second
          thumbnailEventFramerate: 30, // max thumbnail's updates per second triggered by graph updates
          thumbnailLiveFramerate: false, // max thumbnail's updates per second. Set false to disable
          dblClickDelay: 200, // milliseconds
          removeCustomContainer: true, // destroy the container specified by user on plugin destroy
          rerenderDelay: 100 // ms to throttle rerender updates to the panzoom for performance
        })
        return cy.navigator
      }

      function getUndoRedo (cy) {
        const undoRedoOptions = {
          isDebug: true, // Debug mode for console messages
          actions: {}, // actions to be added
          undoableDrag: true, // Whether dragging nodes are undoable can be a function as well
          stackSizeLimit: undefined, // Size limit of undo stack, note that the size of redo stack cannot exceed size of undo stack
          ready: function () {
            // callback when undo-redo is ready
            this.loading = false // add spinner
          }
        }
        cy.undoRedo(undoRedoOptions)
        return cy.undoRedo
      }

      // eslint-disable-next-line no-unused-vars
      const popperOptions = {
        content: 'test data',
        renderedPosition: 'bottom',
        renderedDimensions: undefined,
        popper: undefined,
        closeOnClickOutside: true
      }

      cy.on('tap', 'node', function (event) {
        const node = event.target
        console.log('tapped ' + node.id(), node.data())
        const ref = node.popperRef()
        // using tippy ^4.0.0
        tippy = new Tippy(ref, {
          content: () => {
            const content = document.createElement('div')
            const expired = node.data('expired')
            const failed = node.data('failed')
            const parent = node.data('parent')
            const running = node.data('running')
            // eslint-disable-next-line no-unused-vars
            const todo = node.data('todo')
            const queued = node.data('queued')
            const retrying = node.data('retrying')
            const subfailed = node.data('subfailed')
            const submitted = node.data('submitted')
            const succeeded = node.data('succeeded')
            const waiting = node.data('waiting')
            const children = node.data('collapsedChildren')
            // if state is in the data then this will become unecessary
            let state
            const currentstate = {}
            currentstate.expired = expired
            currentstate.failed = failed
            currentstate.running = running
            currentstate.queued = queued
            currentstate.retrying = retrying
            currentstate.subfailed = subfailed
            currentstate.submitted = submitted
            currentstate.succeeded = succeeded
            currentstate.waiting = waiting
            for (const item in currentstate) {
              // console.log('key:' + item + ' value:' + currentstate[item])
              if (currentstate[item] > 0) {
                state = item
              }
            }
            // console.log('isParent => ', children)
            if (children !== undefined) {
              state = 'compound node'
            }

            const parentstring =
              '<br><strong>parent <span style="color: aqua;">' +
              parent +
              '%</span></strong>'
            const progress =
              '<br><strong>progress <span style="color: aqua;">' +
              running +
              '%</span></strong>'
            content.innerHTML =
              'node<br>' +
              '<strong>id <span style="color: aqua;">' +
              node.data('id') +
              '</span></strong><br>' +
              '<strong>suid <span style="color: aqua;">' +
              node.data('suid') +
              '</span></strong><br>' +
              '<strong>label <span style="color: aqua;">' +
              node.data('label') +
              '</span></strong><br>' +
              '<strong>state <span style="color: aqua;">' +
              state +
              '</span></strong>'
            if (running > 0) {
              content.innerHTML += progress
            }
            if (parent !== undefined) {
              content.innerHTML += parentstring
            }
            content.align = 'left'
            return content
          },
          trigger: 'manual',
          arrow: true,
          placement: 'left',
          hideOnClick: 'true',
          delay: [0, 2000],
          animation: 'fade',
          multiple: false,
          sticky: true,
          flip: true,
          duration: [250, 275],
          allowHTML: false,
          interactive: true
        })
        tippy.show()
      })

      cy.on('tap', 'edge', function (event) {
        const edge = event.target
        console.log('tapped ' + edge.id(), edge.data())
        edge.addClass('selected')
        const ref = edge.popperRef()
        tippy = new Tippy(ref, {
          content: () => {
            const content = document.createElement('div')
            content.innerHTML =
              'edge<br>' +
              '<strong>source <span style="color: aqua;">' +
              edge.data('source') +
              '%</span></strong><br>' +
              '<strong>target <span style="color: aqua;">' +
              edge.data('target') +
              '%</span></strong><br>' +
              '<strong>id <span style="color: aqua;">' +
              edge.data('id') +
              '</span></strong><br>' +
              '<strong>suid <span style="color: aqua;">' +
              edge.data('suid') +
              '</span></strong><br>' +
              '<strong>label <span style="color: aqua;">' +
              edge.data('label') +
              '</span></strong><br>'
            content.align = 'left'
            return content
          },
          theme: 'light',
          trigger: 'manual',
          arrow: true,
          placement: 'left',
          hideOnClick: 'true',
          delay: [0, 2000],
          animation: 'fade',
          multiple: false,
          sticky: true,
          flip: true,
          duration: [250, 275],
          allowHTML: false,
          interactive: true
        })
        tippy.show()
      })

      // eslint-disable-next-line no-unused-vars
      cy.on('click', function (event) {
        cy.elements().removeClass('semitransp')
        cy.elements().removeClass('highlight')
        cy.elements().removeClass('selected')
        if (tippy) {
          tippy.hide()
        }
      })

      expandCollapseOptions = {
        layoutBy: undefined, // to rearrange after expand/collapse. It's just layout options or whole layout function. Choose your side!
        // recommended usage: use cose-bilkent layout with randomize: false to preserve mental map upon expand/collapse
        fisheye: true, // whether to perform fisheye view after expand/collapse you can specify a function too
        animate: true, // whether to animate on drawing changes you can specify a function too
        ready: function () {}, // callback when expand/collapse initialized
        undoable: true, // and if undoRedoExtension exists,
        cueEnabled: true, // Whether cues are enabled
        expandCollapseCuePosition: 'top-left', // default cue position is top left you can specify a function per node too
        expandCollapseCueSize: 20, // size of expand-collapse cue
        expandCollapseCueLineSize: 16, // size of lines used for drawing plus-minus icons
        expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
        collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
        expandCollapseCueSensitivity: 1 // sensitivity of expand-collapse cues,
      }

      const expandCollapseOptionsUndefined = {
        layoutBy: undefined, // to rearrange after expand/collapse. It's just layout options or whole layout function. Choose your side!
        // recommended usage: use cose-bilkent layout with randomize: false to preserve mental map upon expand/collapse
        fisheye: true, // whether to perform fisheye view after expand/collapse you can specify a function too
        animate: false, // whether to animate on drawing changes you can specify a function too
        ready: function () {}, // callback when expand/collapse initialized
        undoable: true, // and if undoRedoExtension exists,
        cueEnabled: true, // Whether cues are enabled
        expandCollapseCuePosition: 'top-left', // default cue position is top left you can specify a function per node too
        expandCollapseCueSize: 20, // size of expand-collapse cue
        expandCollapseCueLineSize: 16, // size of lines used for drawing plus-minus icons
        expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
        collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
        expandCollapseCueSensitivity: 1 // sensitivity of expand-collapse cues
      }

      const expandCollapseOptionsCoseBilkent = {
        layoutBy: {
          name: 'cose-bilkent',
          animate: 'end',
          randomize: false,
          fit: true
        },
        // recommended usage: use cose-bilkent layout with randomize: false to preserve mental map upon expand/collapse
        fisheye: true, // whether to perform fisheye view after expand/collapse you can specify a function too
        animate: false, // whether to animate on drawing changes you can specify a function too
        ready: function () {}, // callback when expand/collapse initialized
        undoable: true, // and if undoRedoExtension exists,
        cueEnabled: true, // Whether cues are enabled
        expandCollapseCuePosition: 'top-left', // default cue position is top left you can specify a function per node too
        expandCollapseCueSize: 20, // size of expand-collapse cue
        expandCollapseCueLineSize: 16, // size of lines used for drawing plus-minus icons
        expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
        collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
        expandCollapseCueSensitivity: 1 // sensitivity of expand-collapse cues
      }

      const expandCollapseOptionsKlay = {
        layoutBy: {
          name: 'cose-bilkent',
          animate: 'end',
          randomize: false,
          fit: true
        },
        // recommended usage: use cose-bilkent layout with randomize: false to preserve mental map upon expand/collapse
        fisheye: true, // whether to perform fisheye view after expand/collapse you can specify a function too
        animate: false, // whether to animate on drawing changes you can specify a function too
        ready: function () {}, // callback when expand/collapse initialized
        undoable: true, // and if undoRedoExtension exists,
        cueEnabled: true, // Whether cues are enabled
        expandCollapseCuePosition: 'top-left', // default cue position is top left you can specify a function per node too
        expandCollapseCueSize: 20, // size of expand-collapse cue
        expandCollapseCueLineSize: 16, // size of lines used for drawing plus-minus icons
        expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
        collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
        expandCollapseCueSensitivity: 1 // sensitivity of expand-collapse cues
      }

      const expandCollapseOptionsCola = {
        layoutBy: {
          name: 'cose-bilkent',
          animate: 'end',
          randomize: false,
          fit: false
        },
        // recommended usage: use cose-bilkent layout with randomize: false to preserve mental map upon expand/collapse
        fisheye: false, // whether to perform fisheye view after expand/collapse you can specify a function too
        animate: false, // whether to animate on drawing changes you can specify a function too
        ready: function () {}, // callback when expand/collapse initialized
        undoable: true, // and if undoRedoExtension exists,
        cueEnabled: true, // Whether cues are enabled
        expandCollapseCuePosition: 'top-left', // default cue position is top left you can specify a function per node too
        expandCollapseCueSize: 20, // size of expand-collapse cue
        expandCollapseCueLineSize: 16, // size of lines used for drawing plus-minus icons
        expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
        collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
        expandCollapseCueSensitivity: 1 // sensitivity of expand-collapse cues
      }

      document
        .getElementById('dagre-button')
        // eslint-disable-next-line no-unused-vars
        .addEventListener('click', function (event) {
          layoutOptions = dagreOptions
          expandCollapseOptions = expandCollapseOptionsUndefined
          cy.expandCollapse(expandCollapseOptionsUndefined)
          ur.do('collapseAll')
          cy.elements()
            .layout(klayLayoutOptions)
            .run()
          cy.elements()
            .layout(dagreOptions)
            .run()
        })

      document
        .getElementById('cosebilkent-button')
        // eslint-disable-next-line no-unused-vars
        .addEventListener('click', function (event) {
          expandCollapseOptions = expandCollapseOptionsCoseBilkent
          cy.expandCollapse(expandCollapseOptionsCoseBilkent)
          layoutOptions = coseBilkentOptions
          ur.do('collapseAll')
          cy.elements()
            .layout(coseBilkentOptions)
            .run()
        })

      document
        .getElementById('klay-button')
        // eslint-disable-next-line no-unused-vars
        .addEventListener('click', function (event) {
          expandCollapseOptions = expandCollapseOptionsKlay
          cy.expandCollapse(expandCollapseOptionsKlay)
          layoutOptions = klayLayoutOptions
          ur.do('collapseAll')
          cy.elements()
            .layout(klayLayoutOptions)
            .run()
        })

      document
        .getElementById('hierarchical-button')
        // eslint-disable-next-line no-unused-vars
        .addEventListener('click', function (event) {
          cy.elements().hca({
            mode: 'threshold',
            threshold: 25,
            distance: 'euclidian', // euclidian, squaredEuclidian, manhattan, max
            preference: 'mean', // median, mean, min, max,
            damping: 0.8, // [0.5 - 1]
            minIterations: 100, // [optional] The minimum number of iteraions the algorithm will run before stopping (default 100).
            maxIterations: 1000, // [optional] The maximum number of iteraions the algorithm will run before stopping (default 1000).
            attributes: [
              function (node) {
                return node.data('weight')
              }
            ]
          })
          ur.do('collapseAll')
          cy.elements()
            .layout(klayLayoutOptions)
            .run()
        })

      document
        .getElementById('cola-button')
      // eslint-disable-next-line no-unused-vars
        .addEventListener('click', function (event) {
          expandCollapseOptions = expandCollapseOptionsCola
          cy.expandCollapse(expandCollapseOptionsCola)
          layoutOptions = colaLayoutOptions
          ur.do('collapseAll')
          cy.elements()
            .layout(colaLayoutOptions)
            .run()
        })

      document
        .getElementById('collapseAll')
        .addEventListener('click', function () {
          ur.do('collapseAll')
          cy.elements().removeClass('semitransp')
          cy.elements().removeClass('highlight')
          cy.elements().removeClass('selected')
        })

      document.addEventListener(
        'keydown',
        function (event) {
          if (event.ctrlKey && event.which === 90) {
            cy.undoRedo().undo()
          } else if (event.ctrlKey && event.which === 89) {
            cy.undoRedo().redo()
          }
        },
        true
      )
    }
  }
}
</script>
