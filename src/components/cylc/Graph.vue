<template>
  <div class="c-graph">
    <SyncLoader
      :loading='loading'
      :color='vueSpinner.color'
      :size='vueSpinner.size'
      class='spinner'
    ></SyncLoader>
    <div class='switchlayout'>
      <v-btn
        id='freeze-button'
        small
        name='freeze'
        align-bottom
        justify-center
        :outlined='true'
        class='freeze-button'
        @click='freezeGraph("freeze", $event)'
      >
        freeze
      </v-btn>
      <div>
        <v-btn
          v-for="engine in layoutEngines"
          v-bind:key="engine"
          :id='`${engine}-button`'
          small
          align-center
          justify-center
          :outlined='true'
          :name='engine'
          :class='`${engine.replace("-", "")}-button`'
          @click='switchLayout(`${engine}`, $event)'
        >
          {{ engine }}
        </v-btn>
        <div
          id='layout'
          class='layout-title'
        >
          layout: {{layoutName}}
          <span v-if='freeze'>-frozen</span>
        </div>
      </div>
    </div>
    <div class='cytoscape-navigator-overlay'>
      <canvas></canvas>
      <div class='cytoscape-navigatorView'></div>
      <div class='cytoscape-navigatorOverlay'></div>
    </div>
    <div>
    </div>
    <cytoscape
      id='cytoscape'
      :pre-config='preConfig'
      :after-created='afterCreated'
      :debug='true'
    ></cytoscape>
  </div>
</template>

<script>
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import navigator from 'cytoscape-navigator'
import panzoom from 'cytoscape-panzoom'
import undoRedo from 'cytoscape-undo-redo'
import popper from 'cytoscape-popper'
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'
import Tippy from 'tippy.js'
import 'tippy.js/themes/light-border.css'
import nodeHtmlLabel from 'cytoscape-node-html-label'
import VueCytoscape from '@/components/core/Cytoscape.vue'
import { mixin } from '@/mixins/index'
// eslint-disable-next-line no-unused-vars
import { debounce, each, has, isEmpty, isUndefined, memoize } from 'lodash'

let ur = {}
let layoutOptions = {}
let tippy
const elements = []
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
const config = {}

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
  // dagre algo options, uses default value on undefined
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

// eslint-disable-next-line no-unused-vars
const popperOptions = {
  content: 'test data',
  renderedPosition: 'bottom',
  renderedDimensions: undefined,
  popper: undefined,
  closeOnClickOutside: true
}

export default {
  name: 'Graph',
  props: {
    workflowName: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      isConnected: false,
      config,
      elements,
      graphData: {
        nodes: [],
        edges: []
      },
      loading: true,
      vueSpinner: {
        color: '#5e9aff',
        size: '.2em'
      },
      // layout variables
      layoutName: 'dagre',
      layoutStopped: true,
      layoutReady: false,
      freeze: false,
      // elements
      nodesEdges: [],
      workflows: [],
      // layout engines
      layoutEngines: [
        'dagre',
        'hierarchical'
      ]
    }
  },
  watch: {
    graphData: debounce(function (newVal) {
      this.debouncer.call()
    }, 100),

    layoutName: {
      handler (value) {
        this.updateLayout(value)
      }
    },

    workflows: {
      handler: function (newval, oldval) {
        console.debug('initialising')
        this.workflowUpdated(newval)
      },
      deep: true
    }
  },

  mixins: [mixin],

  metaInfo () {
    return {
      title: this.getPageTitle('App.graph', { name: this.workflowName })
    }
  },

  beforeRouteLeave (to, from, next) {
    if (tippy) {
      tippy.hide()
    }
    next()
  },

  beforeDestroy () {
    if (tippy) {
      tippy.hide()
    }
  },

  mounted () {
    console.debug('MOUNTED')
    this.$store.watch((store) => {
      this.workflows = store.workflows
    })
  },

  components: {
    SyncLoader,
    cytoscape: VueCytoscape
  },

  methods: {
    async workflowUpdated (workflows) {
      try {
        if (this.freeze === false) {
          this.loading = true
          const elements = {
            nodes: [],
            edges: []
          }

          if (!isUndefined(workflows)) {
            each(workflows, (value, key) => {
              each(value, (workflow, key) => {
                if (workflow.name === this.workflowName) {
                  if (Object.hasOwnProperty.call(workflow, 'nodesEdges')) {
                    const edges = []
                    if (Object.hasOwnProperty.call(workflow.nodesEdges, 'edges')) {
                      each(workflow.nodesEdges.edges || [], (edge, key) => {
                        edges.push({
                          data: edge
                        })
                      })
                    }
                    elements.edges = edges
                    const nodes = []
                    if (Object.hasOwnProperty.call(workflow.nodesEdges, 'nodes')) {
                      each(workflow.nodesEdges.nodes || [], (node, key) => {
                        nodes.push({
                          data: node
                        })
                      })
                    }
                    elements.nodes = nodes
                  }
                }
              })
            })
          }
          if (isEmpty(elements)) {
            console.warn('gdata is empty or undefined')
          } else {
            this.graphData = elements
          }
        }
      } catch (error) {
        console.error('workflowUpdated error: ', error)
      }
    },

    changeLayout (value) {
      try {
        if (this.freeze) {
          return
        }
        if (!isUndefined(value) && !isEmpty(value)) {
          this.layoutName = value
        }
      } catch (error) {
        console.error('changeLayout error: ', error)
      }
    },

    async preConfig (cytoscape) {
      // cytoscape: this is the cytoscape constructor
      try {
        console.debug('PRE-CONFIG')
        cytoscape.use(dagre)
        this.cy = cytoscape({
          container: document.getElementById('cytoscape')
        })
        this.debouncer = debounce(this.updateGraph, 100)
      } catch (error) {
        console.error('preConfig error: ', error)
      }
    },

    async afterCreated (cy) {
      try {
      // load graph data and run layout
        layoutOptions = dagreOptions
        const loaded = await this.initialise(cy)
        if (loaded) {
          this.loading = false
        } else {
          console.error('there was an error loading the graph view')
        }
      } catch (error) {
        console.error('afterCreated error', error)
      }
    },

    async registerExtensions (instance) {
      try {
        // register extensions
        if (typeof cytoscape('core', 'navigator') !== 'function') {
          console.debug('registering navigator')
          navigator(cytoscape)
        }

        if (typeof cytoscape('core', 'panzoom') !== 'function') {
          console.debug('registering panzoom')
          panzoom(cytoscape)
        }

        if (typeof cytoscape('core', 'undoRedo') !== 'function') {
          console.debug('registering undoRedo')
          undoRedo(cytoscape)
        }

        if (typeof cytoscape('core', 'popper') !== 'function') {
          console.debug('registering popper')
          popper(cytoscape)
        }

        if (typeof cytoscape('core', 'nodeHtmlLabel') !== 'function') {
          console.debug('registering nodeHtmlLabel')
          nodeHtmlLabel(cytoscape)
        }
      } catch (error) {
        console.error('registerExtensions error', error)
      }
    },

    async updateStyle (data) {
      try {
        return this.updateConfig(data)
      } catch (error) {
        console.error('updateStyle error: ', error)
      }
    },

    async updateConfig (data) {
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
                'background-color': function memoize (node) {
                  const nodeState = String(node.data('state'))
                  const STATE = nodeState.toUpperCase()
                  let color = states.DEFAULT.colour
                  if (Object.hasOwnProperty.call(states, STATE)) {
                    color = states[STATE].colour
                  }
                  return color
                },
                // content: 'data(label)',
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
          ],
          elements: []
        }

        return config
      } catch (error) {
        console.error('config error: ', error)
      }
    },

    // eslint-disable-next-line no-unused-vars
    async runlayout (instance) {
      try {
        await instance
          .elements()
          .layout(layoutOptions)
          .run()
        return instance
      } catch (error) {
        console.error('runlayout error: ', error)
      }
    },

    async setupUndo (instance) {
      try {
        ur = instance.undoRedo()
        return ur
      } catch (error) {
        console.error('setupUndo error', error)
      }
    },

    async initialise (instance) {
      try {
        console.debug('INITIALISING')
        instance = cytoscape({
          container: document.getElementById('cytoscape')
        })
        this.cy = await this.getGraph(instance)
        this.getInteractivity(instance)
        this.activateKeys(instance)
        this.setHtmlLabel(instance, states)
        return true
      } catch (error) {
        console.error('initialise error', error)
      }
    },

    async getGraph (instance) {
      try {
        console.debug('GETGRAPH')
        await this.registerExtensions()
        layoutOptions = dagreOptions
        await this.runlayout(instance)
        ur = await this.setupUndo(instance)
        this.getPanzoom(instance)
        this.getNavigator(instance)
        this.getUndoRedo(instance)
        return instance
      } catch (error) {
        console.error('getGraph error', error)
      }
    },

    async updateGraph () {
      try {
        if (tippy) {
          tippy.hide()
        }
        const cy = this.cy
        cy.elements().remove()
        const stylesheet = await this.updateStyle(this.graphData)
        cy.style().fromJson(stylesheet.style).update()
        cy.add(this.graphData)
        this.getUndoRedo(cy)
        const loaded = await cy.elements()
          .layout(layoutOptions)
          .run()
        loaded ? this.loading = false : console.error('there was an error loading the graph view')
      } catch (error) {
        console.error('updateGraph error: ', error)
      }
    },

    getPanzoom (instance) {
      try {
        const panzoomdefaults = {
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
          animateOnFit: function () {
            // whether to animate on fit
            return false
          },
          fitAnimationDuration: 1000 // duration of animation on fit
        }
        instance.panzoom(panzoomdefaults)
        return instance.panzoom
      } catch (error) {
        console.error('getPanzoom error', error)
      }
    },

    getNavigator (instance) {
      try {
        instance.navigator({
          container: '.cytoscape-navigator-overlay',
          viewLiveFramerate: 0, // set false to update graph pan only on drag end set 0 to do it instantly set a number (frames per second) to update not more than N times per second
          thumbnailEventFramerate: 30, // max thumbnail's updates per second triggered by graph updates
          thumbnailLiveFramerate: false, // max thumbnail's updates per second. Set false to disable
          dblClickDelay: 200, // milliseconds
          removeCustomContainer: true, // destroy the container specified by user on plugin destroy
          rerenderDelay: 100 // ms to throttle rerender updates to the panzoom for performance
        })
        return instance.navigator
      } catch (error) {
        console.error('getPanzoom error', error)
      }
    },

    getUndoRedo (instance) {
      try {
        const undoRedoOptions = {
          isDebug: true, // Debug mode for console messages
          actions: {}, // actions to be added
          undoableDrag: true, // Whether dragging nodes are undoable can be a function as well
          stackSizeLimit: undefined, // Size limit of undo stack, note that the size of redo stack cannot exceed size of undo stack
          ready: function () {
            // callback when undo-redo is ready
            this.loading = false
          }
        }
        instance.undoRedo(undoRedoOptions)
        return instance.undoRedo
      } catch (error) {
        console.error('getUndoRedo error', error)
      }
    },

    getConstants (instance) {
      // hierarchical clustering internal needs cy instance
      // eslint-disable-next-line no-unused-vars
      const hca = instance.elements().hca({
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
    },

    setHtmlLabel (instance, states) {
      try {
        instance.nodeHtmlLabel([{
          query: 'node',
          cssClass: 'cy-title',
          valign: 'bottom',
          halign: 'right',
          valignBox: 'bottom',
          halignBox: 'right'
        },
        {
          query: 'node',
          tpl: (data) => {
            let JOBSTATE
            // eslint-disable-next-line no-unused-vars
            let jobSquare
            let jobsGrid = ''
            const offset = 22
            let xoffset = offset * -1
            let yoffset = 0

            each(data.jobs, (job, key) => {
              JOBSTATE = String(job.state).toUpperCase()
              // index++
              xoffset += offset
              if (xoffset % (offset * 3) === 0) {
                xoffset = 0
                yoffset += offset
              }
              jobSquare =
              '<svg width="200" height="130" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">' +
              '<rect x="' + xoffset + '" y="' + yoffset + '" width="20" height="20" rx="4" ry="4"  stroke="" fill="' + states[JOBSTATE].colour + '" fill-opacity="1" stroke-opacity="0.8"/>'
              jobsGrid = jobsGrid.concat('', jobSquare)
            })
            return '<div style="display:relative margin-top: 3em; class="cy-title"><span class="cy-title__label">' + data.task.name + '</span><br/>' +
            '<span  class="cy-title__cyclepoint">' +
            data.cyclePoint +
            '</span><br>' +
            jobsGrid +
            '</div>'
          }
        }
        ])
      } catch (error) {
        console.error('setHtmlLabel error ', error)
      }
    },

    getInteractivity (instance) {
      try {
        instance.on('tap', 'node', (event) => {
          const node = event.target
          console.debug('tapped ' + node.id(), node.data())
          const ref = node.popperRef()
          tippy = new Tippy(ref, {
            content: function memoize () {
              const content = document.createElement('div')
              content.id = 'tooltip'
              content.classList.add('node-tooltip')
              let runpercent = 0
              if (has(node.data, 'runpercent')) {
                runpercent = node.data('runpercent')
              }
              const parent = node.data('parent')
              const state = node.data('state')
              let jobInfoBlock = '<div>'
              let details
              let jobsquare
              const tasksquare = '<div class="box-task-graph ' + state + '-graph"></div>'
              const jobs = node.data('jobs')
              const parentstring =
                '<strong>parent <span style="color: #555;">' +
                parent +
                '</span></strong>'
              const progress =
                '<br><strong>progress <span style="color: #555;"><br>' +
                runpercent +
                '%</span></strong>'

              each(jobs, (job, key) => {
                let batchSysName = ''
                let batchSysJobId = ''
                let host = ''
                let startedTime = ''
                let submittedTime = ''
                let finishedTime = ''
                let submitNum = ''
                const jobid = '<span class="jobid">' + job.batchSysJobId + '</span>'
                jobsquare = '<div class="box-job-graph ' + job.state + '-graph"></div>'
                details = '<details><summary>' + jobid + jobsquare + '</summary>'
                jobInfoBlock += details
                submitNum =
                '<br><strong>submit number:  <span style="color: #555;">' +
                job.submitNum +
                '</span></strong>'
                jobInfoBlock += submitNum

                batchSysName =
                '<br><strong>batch sytem name: <span style="color: #555;">' +
                job.batchSysName +
                '</span></strong>'
                jobInfoBlock += batchSysName

                batchSysJobId =
                '<br><strong>batch sytem job id: <span style="color: #555;">' +
                job.batchSysJobId +
                '</span></strong>'
                jobInfoBlock += batchSysJobId

                host =
                '<br><strong>host:  <span style="color: #555;">' +
                job.host +
                '</span></strong>'
                jobInfoBlock += host

                startedTime =
                '<br><strong>started time:  <span style="color: #555;">' +
                job.startedTime +
                '</span></strong>'
                jobInfoBlock += startedTime

                submittedTime =
                '<br><strong>submitted time:  <span style="color: #555;">' +
                job.submittedTime +
                '</span></strong>'
                jobInfoBlock += submittedTime

                finishedTime =
                '<br><strong>finished time:  <span style="color: #555;">' +
                job.finishedTime +
                '</span></strong><br>'
                jobInfoBlock += finishedTime
                jobInfoBlock += '<hr class="hr-graph">'
                jobInfoBlock += '</details>'
              })

              const jobblock =
              '</div>' +
              jobInfoBlock +
              '</div></div>'
              content.innerHTML =
                '<div class="header-graph"><strong>task</div></strong><br>' +
                // '<strong>id <span style="color: #555;">' +
                // node.data('id') +
                // '</span></strong><br>' +
                '<strong>name <span style="color: #555;">' +
                node.data('label') +
                '</span></strong><br>' +
                '<strong>state <span style="color: #555; padding-left: 14px;">' +
                state +
                '</span></strong>' +
                 tasksquare
              if (state === 'running') {
                content.innerHTML += progress
              }
              if (parent !== undefined) {
                content.innerHTML += parentstring
              }
              content.innerHTML += '<hr class="hr-graph">'
              content.innerHTML += '<div class="header-graph"><strong>jobs</div></strong><br>'
              content.innerHTML += jobblock
              content.align = 'left'
              return content
            },
            theme: 'light-border',
            trigger: 'manual',
            arrow: true,
            placement: 'left',
            hideOnClick: 'true',
            delay: [0, 2000],
            animation: 'fade',
            multiple: false,
            sticky: true,
            flip: true,
            flipOnUpdate: true,
            duration: [250, 275],
            allowHTML: true,
            interactive: true,
            touch: true
          })
          tippy.show()
        })
      } catch (error) {
        console.error('interactivity tippy edge error ', error)
      }

      try {
        instance.on('tap', 'edge', (event) => {
          const edge = event.target
          console.debug('tapped ' + edge.id(), edge.data())
          edge.addClass('selected')
          const ref = edge.popperRef()
          tippy = new Tippy(ref, {
            content: () => {
              const content = document.createElement('div')
              content.classList.add('edge-tooltip')
              content.innerHTML =
              '<div class="header-graph"><strong>edge</div></strong><br>' +
               '<strong>owner: <span class="details-graph">' +
                edge.data('owner') +
                '</span></strong><br>' +
                '<strong>name: <span class="details-graph">' +
                edge.data('name') +
                '</span></strong><br>' +
                '<strong>source: <span class="details-graph">' +
                edge.data('source') +
                '</span></strong><br>' +
                '<strong>target: <span class="details-graph">' +
                edge.data('target') +
                '</span></strong><br>' +
                // '<strong>id <span class="details-graph>' +
                // edge.data('id') +
                // '</span></strong><br>' +
                '<strong>label: <span class="details-graph">' +
                edge.data('label') +
                '</span></strong></div>'
              content.align = 'left'
              return content
            },
            theme: 'light-border',
            trigger: 'manual',
            arrow: true,
            placement: 'left',
            hideOnClick: 'false',
            delay: [0, 2000],
            animation: 'fade',
            multiple: false,
            sticky: true,
            flip: true,
            flipOnUpdate: true,
            duration: [250, 275],
            allowHTML: true,
            interactive: true
          })
          tippy.show()
        })
      } catch (error) {
        console.error('interactivity tippy edge error ', error)
      }

      try {
        // eslint-disable-next-line no-unused-vars
        instance.on('click', (event) => {
          instance.elements().removeClass('semitransp')
          instance.elements().removeClass('highlight')
          instance.elements().removeClass('selected')
          if (tippy) {
            tippy.hide()
          }
        })
      } catch (error) {
        console.error('interactivity tippy remove edge selection error ', error)
      }
    },

    switchLayout (message, event) {
      event.preventDefault()
      this.layoutName = message
      this.layoutReady = true
      this.layoutStopped = false
    },

    freezeGraph () {
      this.freeze ? this.freeze = false : this.freeze = true
    },

    updateLayout (key) {
      try {
        const cy = this.cy
        switch (key) {
          case 'dagre':
            layoutOptions = dagreOptions
            this.doLayout(dagreOptions)
            break
          case 'hierarchical':
            cy.elements().hca({
              mode: 'threshold',
              threshold: 25,
              distance: 'euclidian', // euclidian, squaredEuclidian, manhattan, max
              preference: 'mean', // median, mean, min, max,
              damping: 0.8, // [0.5 - 1]
              minIterations: 100, // [optional] The minimum number of iteraions the algorithm will run before stopping (default 100).
              maxIterations: 1000, // [optional] The maximum number of iteraions the algorithm will run before stopping (default 1000).
              attributes: [
                (node) => {
                  return node.data('weight')
                }
              ]
            })
            layoutOptions = hierarchicalOptions
            this.doLayout(hierarchicalOptions)
            break
          default:
            layoutOptions = dagreOptions
            this.doLayout(dagreOptions)
            break
        }
      } catch (error) {
        console.error('updateLayout error', error)
      }
    },

    doLayout (layoutOptions) {
      try {
        this.cy.elements()
          .layout(layoutOptions)
          .run()
      } catch (error) {
        console.error('doLayout error', error)
        return false
      }
    },

    activateKeys (instance) {
      document.addEventListener(
        'keydown',
        (event) => {
          if ((event.metaKey && event.which === 90) || (event.ctrlKey && event.which === 90)) {
            instance.undoRedo().undo()
          } else if ((event.metaKey && event.which === 89) || (event.ctrlKey && event.which === 89)) {
            instance.undoRedo().redo()
          }
        },
        true
      )
    }
  }
}
</script>

<style lang="css">
@import '~@/styles/cytoscape/panzoom.css';
</style>

<style lang="scss">
@import '~@/styles/cytoscape/html-label.scss';
@import '~@/styles/cytoscape/cytoscape-custom.scss';
</style>
