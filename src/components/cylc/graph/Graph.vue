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
        name='freeze'
        :outlined='true'
        :class="{
          'freeze-button': true,
          'button-highlight': freeze
        }"
        small
        align-bottom
        justify-center
        @click='freezeGraph("freeze", $event)'
      >
        freeze layout
      </v-btn>
      <div>
        <v-btn
          v-for="engine in layoutEngines"
          :key="engine"
          :id='`${engine}-button`'
          :outlined='true'
          :name='engine'
          :class="{
            'layout-button': true,
            'button-highlight':(engine === layoutName)
          }"
          @click.prevent='switchLayout(`${engine}`, $event)'
          small
          align-center
          justify-center
        >
          {{ engine }}
        </v-btn>
      </div>
    </div>
    <div class='graph-warning'>
      <span>WARNING: POC Graph View: beware of large workflows!</span>
    </div>
    <div class='cytoscape-navigator-overlay'>
      <canvas></canvas>
      <div class='cytoscape-navigatorView'></div>
      <div class='cytoscape-navigatorOverlay'></div>
    </div>
    <!-- cytoscape container -->
    <div id="cytoscape"></div>
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
import nodeHtmlLabel from 'cytoscape-node-html-label'
import { debounce, each, has } from 'lodash'
import { mapState } from 'vuex'
import {
  states,
  dagreOptions,
  hierarchicalOptions,
  panzoomdefaults,
  cytoscapeDefaultStyle
} from './index'

export default {
  name: 'Graph',

  props: {
    workflowName: {
      type: String,
      required: true
    }
  },

  components: {
    SyncLoader
  },

  data: function () {
    return {
      /**
       * Loading indicator data. Used to tell the component whether it should display the loading status or not,
       * which color to use, etc.
       */
      loading: true,
      vueSpinner: {
        color: '#5e9aff',
        size: '.2em'
      },
      /**
       * The Cytoscape layout options. By default it is set to Dagre. When switching the layout in the UI, it will
       * replace this by a hierarchicalOptions or another options object.
       */
      layoutOptions: dagreOptions,
      /**
       * Available layout engines. These are used by components in the UI to allow the user to choose which layout
       * to use in the UI
       */
      layoutEngines: [
        'dagre',
        'hierarchical'
      ],
      /**
       * Cytoscape layout data. Controls things like the current layout, whether layout is frozen or not, etc.
       */
      layoutName: 'dagre',
      layoutStopped: true,
      layoutReady: false,
      freeze: false,
      /**
       * Cytoscape tooltip plugin object.
       */
      tippy: null,
      /**
       * Graph data. These values are empty by default, then are populated later via watchers.
       */
      graphData: {
        nodes: [],
        edges: []
      }
    }
  },

  watch: {
    graphData: function () {
      this.updateGraph()
    },

    workflows: {
      handler: function (newValue) {
        this.workflowUpdated(newValue)
      },
      deep: true
    }
  },

  beforeCreate () {
    cytoscape.use(dagre)
  },

  created () {
    this.updateGraph = debounce(this.updateGraph_, 100)
    this.workflowUpdated = debounce(this.workflowUpdated_, 100)
  },

  mounted () {
    const instance = cytoscape({
      container: document.getElementById('cytoscape')
    })
    this.registerExtensions()
    this.runLayout(instance)
    this.setupUndoRedo(instance)
    this.setupPanzoom(instance)
    this.setupNavigator(instance)
    this.setupInteractivity(instance)
    this.setupEventListeners(instance)
    this.setupHtmlLabel(instance, states)
    this.loading = false
  },

  beforeDestroy () {
    // before the component is destroyed, we need to remember to remove the tooltip, otherwise it is still visible
    // in the next view/route.
    if (this.tippy !== null) {
      this.tippy.hide()
    }
  },

  computed: {
    ...mapState('workflows', ['workflows'])
  },

  methods: {
    /**
     * @param {[
       * {
       *   nodesEdges: {
       *     edges: [],
       *     nodes: []
       *   }
       * }
     * ]} workflows - vuex state managed workflows
     */
    workflowUpdated_ (workflows) {
      if (!this.freeze) {
        this.loading = true
        const elements = {
          nodes: [],
          edges: []
        }
        const filtered = workflows.filter((workflow) => workflow.name === this.workflowName)
        if (filtered.length !== 0) {
          const workflow = filtered[0]
          if (Object.hasOwnProperty.call(workflow, 'nodesEdges')) {
            if (Object.hasOwnProperty.call(workflow.nodesEdges, 'edges')) {
              workflow.nodesEdges.edges.forEach((edge) => {
                elements.edges.push({
                  data: edge
                })
              })
            }
            if (Object.hasOwnProperty.call(workflow.nodesEdges, 'nodes')) {
              workflow.nodesEdges.nodes.forEach((node) => {
                elements.nodes.push({
                  data: node
                })
              })
            }
          }
        }
        // clear existing data
        this.graphData.edges.length = 0
        this.graphData.nodes.length = 0
        // assign new data (need to assign a new one, so that the watcher(deep:false) triggers off)
        this.graphData = elements
      }
    },

    // --- Begin initialization functions

    /**
     * Register the extensions used by Cytoscape for this component.
     */
    registerExtensions () {
      if (typeof cytoscape('core', 'navigator') !== 'function') {
        navigator(cytoscape)
      }
      if (typeof cytoscape('core', 'panzoom') !== 'function') {
        panzoom(cytoscape)
      }
      if (typeof cytoscape('core', 'undoRedo') !== 'function') {
        undoRedo(cytoscape)
      }
      if (typeof cytoscape('core', 'popper') !== 'function') {
        popper(cytoscape)
      }
      if (typeof cytoscape('core', 'nodeHtmlLabel') !== 'function') {
        nodeHtmlLabel(cytoscape)
      }
    },

    /**
     * Runs the current layout.
     * @param {cytoscape} instance - the cytoscape instance
     * @see https://js.cytoscape.org/#cy.layout
     */
    runLayout (instance) {
      instance
        .elements()
        .layout(this.layoutOptions)
        .run()
    },

    /**
     * Sets up the undo-redo plugin in the instance.
     * @param {cytoscape} instance - the cytoscape instance
     */
    setupUndoRedo (instance) {
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
    },

    /**
     * Sets up the panzoom plugin in the instance.
     * @param {cytoscape} instance - the cytoscape instance
     */
    setupPanzoom (instance) {
      instance.panzoom(panzoomdefaults)
    },

    /**
     * Sets up the navigator plugin in the instance.
     * @param {cytoscape} instance - the cytoscape instance
     */
    setupNavigator (instance) {
      instance.navigator({
        container: '.cytoscape-navigator-overlay',
        viewLiveFramerate: 0, // set false to update graph pan only on drag end set 0 to do it instantly set a number (frames per second) to update not more than N times per second
        thumbnailEventFramerate: 30, // max thumbnail's updates per second triggered by graph updates
        thumbnailLiveFramerate: false, // max thumbnail's updates per second. Set false to disable
        dblClickDelay: 200, // milliseconds
        removeCustomContainer: true, // destroy the container specified by user on plugin destroy
        rerenderDelay: 100 // ms to throttle rerender updates to the panzoom for performance
      })
    },

    /**
     * Sets up interactivity on the graph node. Defining what happens when the user clicks on nodes, edges, etc.
     * @param {cytoscape} instance - the cytoscape instance
     */
    setupInteractivity (instance) {
      instance.on('tap', 'node', (event) => {
        const node = event.target
        const ref = node.popperRef()
        this.tippy = new Tippy(ref, {
          content: () => {
            const content = document.createElement('div')
            content.id = 'tooltip'
            content.classList.add('node-tooltip')
            let runPercent = 0
            if (has(node.data, 'runpercent')) {
              runPercent = node.data('runpercent')
            }
            const parent = node.data('parent')
            const state = node.data('state')
            const tasksquare = '<div class="box-task-graph ' + state + '-graph"></div>'
            const jobs = node.data('jobs')
            const parentstring = `<strong>parent <span style="color: #555;">${parent}</span></strong>`
            const progress = `<br><strong>progress <span style="color: #555;"><br>${runPercent}%</span></strong>`

            let jobInfoBlock = '<div>'
            each(jobs, (job, key) => {
              const jobId = `<span class="jobid">${job.batchSysJobId}</span>`
              const jobSquare = `<div class="box-job-graph ${job.state}-graph"></div>`
              const details = `<details><summary>${jobId}${jobSquare}</summary>`
              const submitNum = `<br><strong>submit number:  <span style="color: #555;">${job.submitNum}</span></strong>`
              const batchSysName = `<br><strong>batch sytem name: <span style="color: #555;">${job.batchSysName}</span></strong>`
              const batchSysJobId = `<br><strong>batch sytem job id: <span style="color: #555;">${job.batchSysJobId}</span></strong>`
              const host = `<br><strong>host:  <span style="color: #555;">${job.host}</span></strong>`
              const startedTime = `<br><strong>started time:  <span style="color: #555;">${job.startedTime}</span></strong>`
              const submittedTime = `<br><strong>submitted time:  <span style="color: #555;">${job.submittedTime}</span></strong>`
              const finishedTime = `<br><strong>finished time:  <span style="color: #555;">${job.finishedTime}</span></strong><br>`

              jobInfoBlock += `${details}${submitNum}${batchSysName}${batchSysJobId}${host}${startedTime}${submittedTime}${finishedTime}`
              jobInfoBlock += '<hr class="hr-graph">'
              jobInfoBlock += '</details>'
            })
            jobInfoBlock += '</div>'

            const jobblock = `${jobInfoBlock}</div></div>`
            content.innerHTML =
              '<div class="header-graph"><strong>task</div></strong><br>' +
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
            content.innerHTML += `<hr class="hr-graph"><div class="header-graph"><strong>jobs</div></strong><br>${jobblock}`
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
        this.tippy.show()
      })

      instance.on('tap', 'edge', (event) => {
        const edge = event.target
        edge.addClass('selected')
        const ref = edge.popperRef()
        this.tippy = new Tippy(ref, {
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
        this.tippy.show()
      })

      instance.on('click', (_) => {
        instance.elements().removeClass('semitransp')
        instance.elements().removeClass('highlight')
        instance.elements().removeClass('selected')
        if (this.tippy !== null) {
          this.tippy.hide()
        }
      })
    },

    /**
     * Sets up the event listeners for the instance.
     * NB: remember to remove the event listeners to avoid memory leaks.
     * @param {cytoscape} instance - the cytoscape instance
     */
    setupEventListeners (instance) {
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
    },

    /**
     * Sets up the Node HTML Label (using the nodeHtmlLabel plugin).
     * @param {cytoscape} instance - the cytoscape instance
     * @param {*} states
     */
    setupHtmlLabel (instance, states) {
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
          let jobsGrid = ''
          const offset = 22
          let xOffset = offset * -1
          let yOffset = 0

          each(data.jobs, (job, _) => {
            const jobState = String(job.state).toUpperCase()
            xOffset += offset
            if (xOffset % (offset * 3) === 0) {
              xOffset = 0
              yOffset += offset
            }
            const jobSquare = `<svg width="200" height="130" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
                        <rect x="${xOffset}" y="${yOffset}" width="20" height="20" rx="4" ry="4"  stroke="" fill="${states[jobState].colour}" fill-opacity="1" stroke-opacity="0.8"/>`
            jobsGrid = jobsGrid.concat('', jobSquare)
          })
          return `<div style="position: relative; margin-top: 3em;" class="cy-title">
                  <span class="cy-title__label">${data.task.name}</span>
                  <br/>
                  <span  class="cy-title__cyclepoint">${data.cyclePoint}</span>
                  <br/>
                  ${jobsGrid}
                </div>`
        }
      }])
    },
    // --- End of initialization functions

    /**
     * Freezes the graph by toggling the freeze flag.
     */
    freezeGraph () {
      this.freeze = !this.freeze
    },

    /**
     * This function is called every time the `graphData` changes. Check the watchers created in this component.
     * NB: this function is debounced once the component is created. Check `created` for its timeout setting.
     * @return {Promise<void>}
     */
    async updateGraph_ () {
      if (this.tippy !== null) {
        this.tippy.hide()
      }
      const instance = cytoscape({
        container: document.getElementById('cytoscape')
      })
      instance
        .elements()
        .remove()
      instance
        .style()
        .fromJson(cytoscapeDefaultStyle)
        .update()
      instance.add(this.graphData)
      this.setupUndoRedo(instance)
      const loaded = await instance
        .elements()
        .layout(this.layoutOptions)
        .run()
      if (!loaded) {
        throw new Error('There was an error loading the graph view!')
      }
      this.loading = false
    },

    /**
     * Called by the UI when the user switches a layout using some UI component (button/dropdown/etc). Its
     * responsibility is simply to change the attributes related to the layout, and then fire an updateLayout call.
     * @param message
     * @param event
     */
    switchLayout (message, event) {
      this.layoutName = message
      this.layoutReady = true
      this.layoutStopped = false
      this.updateLayout()
    },

    /**
     * Called after the user switches layout. Its responsibility is to change the this.layoutOptions (dagre by default)
     * to the correct options, and then call this.doLayout(newOptions).
     */
    updateLayout () {
      switch (this.layoutName) {
        case 'dagre':
          this.layoutOptions = dagreOptions
          this.runLayout(dagreOptions)
          break
        case 'hierarchical':
          this.cytoscapeInstance.elements().hca({
            mode: 'threshold',
            threshold: 25,
            distance: 'euclidean', // euclidean, squaredEuclidean, manhattan, max
            preference: 'mean', // median, mean, min, max,
            damping: 0.8, // [0.5 - 1]
            minIterations: 100, // [optional] The minimum number of iterations the algorithm will run before stopping (default 100).
            maxIterations: 1000, // [optional] The maximum number of iterations the algorithm will run before stopping (default 1000).
            attributes: [
              (node) => {
                return node.data('weight')
              }
            ]
          })
          this.layoutOptions = hierarchicalOptions
          this.runLayout(hierarchicalOptions)
          break
        default:
          // Should never happen!
          this.layoutOptions = dagreOptions
          this.runLayout(dagreOptions)
          break
      }
    }
  }
}
</script>

<style lang="css">
@import '~tippy.js/themes/light-border.css';
@import '~@/styles/cytoscape/panzoom.css';
</style>

<style lang="scss">
@import '~@/styles/cytoscape/html-label.scss';
@import '~@/styles/cytoscape/cytoscape-custom.scss';
</style>
