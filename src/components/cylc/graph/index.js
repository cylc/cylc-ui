// This file probably doesn't need any imports. It is just to offload the cognitive load of reading the Graph.vue,
// done by moving some structures used over the code here. Probably most of these structures could also be frozen.

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

const edgeOptions = {
  normal: {
    lineColor: '#777'
  },
  selected: {
    lineColor: '#888'
  }
}

const states = Object.freeze({
  EXPIRED: { state: 'expired', icon: '', colour: '#fefaff' },
  FAILED: { state: 'failed', icon: '', colour: '#cf4848' },
  QUEUED: { state: 'queued', icon: '', colour: '#efefd9' },
  READY: { state: 'ready', icon: '', colour: '#bfe5e7' },
  RETRYING: { state: 'retrying', icon: '', colour: '#efefd9' },
  RUNNING: { state: 'running', icon: '', colour: '#6aa4f1' },
  SUBFAILED: { state: 'subfailed', icon: '', colour: '#be6ac0' },
  SUBMITTED: { state: 'submitted', icon: '', colour: '#7dcfd4' },
  SUCCEEDED: { state: 'succeeded', icon: '', colour: '#51af51' },
  WAITING: { state: 'waiting', icon: '', colour: '#efefd9' },
  DEFAULT: { state: 'default', icon: '', colour: '#efefd9' },
  UNDEFINED: { state: 'UNDEFINED', icon: '', colour: '#efefd9' }
})

const dagreOptions = {
  name: 'dagre',
  // dagre algorithm options, uses default value on undefined
  nodeSep: 140, // the separation between adjacent nodes in the same rank
  edgeSep: 30, // the separation between adjacent edges in the same rank
  rankSep: 140, // the separation between adjacent nodes in the same rank
  rankDir: 'TB', // 'TB' for top to bottom flow, 'LR' for left to right
  minLen: function (_) {
    return 1
  }, // number of ranks to keep between the source and target of the edge
  edgeWeight: function (_) {
    return 1
  }, // higher weight edges are generally made shorter and straighter than lower weight edges
  // general layout options
  fit: false, // whether to fit to viewport
  padding: 150, // fit padding
  spacingFactor: 1.2, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  boundingBox: undefined, // constrain layout bounds { x1, y1, x2, y2 } or { x1, y1, w, h }
  ready: function () {
    this.layoutReady = true
    this.layoutStopped = false
  },
  stop: function () {
    this.layoutStopped = true
    this.layoutReady = false
    this.loading = false
  }
}

const hierarchicalOptions = {
  name: 'breadthfirst',
  fit: false, // whether to fit the viewport to the graph
  directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
  padding: 30, // padding on fit
  circle: false, // put depths in concentric circles if true, put depths top down if false
  grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
  spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
  nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
  roots: undefined, // the roots of the trees
  maximal: false, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled,
  animateFilter: function (node, i) { return true },
  ready: function () {
    this.layoutReady = true
    this.layoutStopped = false
  },
  stop: function () {
    this.layoutStopped = true
    this.layoutReady = false
    this.loading = false
  },
  transform: function (node, position) { return position } // transform a given node position. Useful for changing flow direction in discrete layouts
}

const panzoomDefaults = {
  zoomFactor: 0.1, // zoom factor per zoom tick
  zoomDelay: 45, // how many ms between zoom ticks
  minZoom: 0.1, // min zoom level
  maxZoom: 2, // max zoom level
  fitPadding: 50, // padding when fitting
  panSpeed: 10, // how many ms in between pan ticks
  panDistance: 100, // max pan distance per tick
  panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
  panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
  panInactiveArea: 8, // radius of inactive area in pan drag box
  panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib) scales from this to 1.0
  zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
  fitSelector: undefined, // selector of elements to fit
  animateOnFit: () => {
    // whether to animate on fit
    return false
  },
  fitAnimationDuration: 1000, // duration of animation on fit
  sliderHandleIcon: 'mdi mdi-minus',
  zoomInIcon: 'mdi mdi-plus',
  zoomOutIcon: 'mdi mdi-minus',
  resetIcon: 'mdi mdi-arrow-expand-all'
}

const cytoscapeDefaultStyle = [
  {
    selector: 'node',
    css: {
      'background-color': (node) => {
        const nodeState = String(node.data('state'))
        const STATE = nodeState.toUpperCase()
        let color = states.DEFAULT.colour
        if (Object.hasOwnProperty.call(states, STATE)) {
          color = states[STATE].colour
        }
        return color
      },
      'font-family': 'Avenir, Helvetica, Arial, sans-serif',
      color: '#333',
      'text-max-width': '.5em',
      'text-wrap': 'wrap',
      'text-valign': 'top',
      'text-halign': 'right',
      'line-height': 1.1,
      'text-margin-x': 5,
      'font-size': '.8em',
      'min-zoomed-font-size': '.8em',
      width: '6em',
      height: '6em'
    }
  },
  {
    selector: 'edge',
    css: {
      width: 2,
      // content: 'data(label)',
      'curve-style': 'unbundled-bezier',
      //  A series of values that specify for each control point the distance perpendicular to a line formed from source to target
      'control-point-distance': '-20 -20 -20',
      // A series of values that weights control points along a line from source to target, '0': curve towards source node, '1': towards target node
      'control-point-weight': '0.25 0.5 0.75',
      'target-arrow-shape': 'triangle',
      'line-color': edgeOptions.normal.lineColor,
      'target-arrow-color': '#222',
      opacity: 0.8,
      'target-distance-from-node': 10
    }
  },
  {
    selector: 'edge.selected',
    style: {
      width: 4,
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
    selector: ':parent',
    style: {
      'background-opacity': 0.1,
      'background-fit': 'contain contain',
      'background-color': '#b7c0e8',
      'border-color': '#999',
      'border-width': '1px'
    }
  }
]

export {
  states,
  dagreOptions,
  hierarchicalOptions,
  panzoomDefaults,
  cytoscapeDefaultStyle
}
