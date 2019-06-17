<template>
  <div id='holder'>
    <sync-loader :loading='loading' :color='color' :size='size' class='spinner'></sync-loader>
    <!-- <div class='reset'>
      <v-btn align-center justify-center color='#333' class='v-btn' id='reset-button'>
        <v-icon id='reset-icon' name='reset-icon' color='white'>mdi-backup-restore</v-icon>
      </v-btn>
    </div>-->
    <div class='cytoscape-navigator-overlay'>
      <canvas></canvas>
      <div class='cytoscape-navigatorView'></div>
      <div class='cytoscape-navigatorOverlay'></div>
    </div>
    <b id='collapseAll' class='collapseAll' style='cursor: pointer;color: white'>collapse all</b> /
    <b id='expandAll' class='expandAll' style='cursor: pointer; color: white'>expand all</b> /
    <!-- <b id='collapseRecursively' class='collapseRecursively' style='cursor: pointer; color: white'>collapse selected recursively</b>
    <b id='expandRecursively' class='expandRecursively' style='cursor: pointer; color: white' >expand selected recursively</b> -->
    <cytoscape :config='config' :preConfig='preConfig' :afterCreated='afterCreated'>
      <cy-element v-for='def in elements.nodes' :key='`${def.data.id}`' :definition='def'/>
      <cy-element v-for='def in elements.edges' :key='`${def.data.id}`' :definition='def'/>
    </cytoscape>
  </div>
</template>

<script>
/* eslint-disable */
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import coseBilkent from 'cytoscape-cose-bilkent';
import navigator from 'cytoscape-navigator';
import panzoom from 'cytoscape-panzoom';
import expandCollapse from 'cytoscape-expand-collapse';
import undoRedo from 'cytoscape-undo-redo';
import popper from 'cytoscape-popper';
import hierarchical from 'cytoscape-hierarchical';
import jqyuery from 'jquery';
import axios from 'axios';
import SyncLoader from 'vue-spinner/src/SyncLoader.vue';

// const DATA_URL = 'http://localhost:8080/complex-cytoscape-dot-1b.1.json';
const DATA_URL = 'http://localhost:8080/simple-cytoscape-dot.1.json';
const elements = [];
let loading = true;

let nodeOptions = {
  normal: {
    bgColor: '#444'
  },
  selected: {
    bgColor: 'yellow'
  },
  active: {
    bgColor: 'yellow'
  }
};

var edgeOptions = {
  normal: {
    lineColor: '#fff'
  },
  selected: {
    lineColor: 'yellow'
  }
};

const config = {
  autounselectify: true,
  boxSelectionEnabled: false,
  layout: {
    name: 'dagre',
    textureOnViewport: false,
    hideEdgesOnViewport: true
  },
  style: [
    {
      selector: 'node',
      css: {
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
        'pie-size': '84%', //The diameter of the pie, measured as a percent of node size (e.g. 100%) or an absolute length (e.g. 25px).
        'pie-1-background-color': '#9ef9ff', // The colour of the node’s ith pie chart slice.
        'pie-1-background-size': 'mapData(submitted, 0, 100, 0, 100)',
        'pie-2-background-color': '#4ab7ff',
        'pie-2-background-size': 'mapData(running, 0, 100, 0, 100)',
        'pie-3-background-color': '#31ff53',
        'pie-3-background-size': 'mapData(succeeded, 0, 100, 0, 100)', // The size of the node’s ith pie chart slice, measured in percent (e.g. 25% or 25).
        // 'pie-i-background-opacity' : 0, //The opacity of the node’s ith pie chart slice.
        'pie-4-background-color': '#ff3a2b',
        'pie-4-background-size': 'mapData(failed, 0, 100, 0, 100)',
        'pie-5-background-color': '#d453ff',
        'pie-5-background-size': 'mapData(subfailed, 0, 100, 0, 100)',
        'pie-6-background-color': '#fefaff',
        'pie-6-background-size': 'mapData(expired, 0, 100, 0, 100)',
        'pie-7-background-color': '#fff138',
        'pie-7-background-size': 'mapData(queued, 0, 100, 0, 100)',
        'pie-8-background-color': '#ff3a2b',
        'pie-8-background-size': 'mapData(retrying, 0, 100, 0, 100)',
        'pie-9-background-color': '#666',
        'pie-9-background-size': 'mapData(waiting, 0, 100, 0, 100)',
        'pie-10-background-color': '#cacaca',
        'pie-10-background-size': 'mapData(progress, 0, 100, 0, 100)'
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
    // {
    //   selector: 'node.active',
    //   style: { 'background-color': nodeOptions.active.bgColor }
    // },
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
        'background-color': 'darkblue',
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
      selector: 'edge.meta',
      style: {
        'curve-style': 'unbundled-bezier',
        'control-point-distances': '0 0 0'
      }
    },
    {
      selector: '.selected',
      style: {
        'background-color': 'yellow',
        'background-image': require('@/assets/pigeon.svg.png'),
        // 'background-image': function(node) {
        //   let icon = node.data('icon');
        //   console.log('ICON PATH --> ', icon);
        //   return require(icon);
        // }, // TODO
        'background-fit': 'contain contain',
        'background-image-opacity': 0.5,
        'pie-size': '0%'
      }
    }
    // {
    //   selector: ':active',
    //   style: {
    //     'background-color': 'purple'
    //   }
    // }
  ],
  elements: []
};

export default {
  metaInfo() {
    return {
      title: 'Cylc UI | Graph'
    };
  },
  name: 'Graph',
  data() {
    return {
      config,
      elements,
      i: 1,
      // vue-spinner
      color: '#5e9aff',
      height: '35px',
      width: '4px',
      margin: '2px',
      radius: '2px',
      size: '1em',
      loading: true
    };
  },
  components: {
    SyncLoader
  },
  methods: {
    preConfig(cytoscape) {
      console.log('calling pre-config', config, elements);
      // cytoscape: this is the cytoscape constructor
      cytoscape.use(dagre);
      cytoscape.use(popper);
      cytoscape.use(coseBilkent);
      cytoscape.use(hierarchical);
    },
    async afterCreated() {
      console.log('after created');
      const cy = await this.$cytoscape.instance;
      const { data: elements } = await axios.get(DATA_URL);
      elements.nodes.forEach(n => cy.add(n));
      elements.edges.forEach(n => cy.add(n)), console.log('after created');
      console.log('loaded elements: ', elements, cy), (this.loading = false); // remove spinner
      cy.fit();
      // hierarchical clustering internal
      // cy.elements().hca({
      //   mode: 'threshold',
      //   threshold: 25,
      //   distance: 'euclidian', // euclidian, squaredEuclidian, manhattan, max
      //   preference: 'mean', // median, mean, min, max,
      //   damping: 0.8, // [0.5 - 1]
      //   minIterations: 100, // [optional] The minimum number of iteraions the algorithm will run before stopping (default 100).
      //   maxIterations: 1000, // [optional] The maximum number of iteraions the algorithm will run before stopping (default 1000).
      //   attributes: [
      //     function(node) {
      //       return node.data('weight');
      //     }
      //   ]
      // });
      // hierarchical clustering
      // cy.elements().hierarchical({
      //   mode: 'regular', // extension mode
      //   threshold: 25, // stopping criterion that affects granularity (#) of clusters
      //   distance: 'euclidean', // distance metric for measuring the distance between two nodes
      //   linkage: 'single', // linkage criteria for determining the distance between two clusters
      //   attributes: [
      //     // attributes/features used to group nodes
      //     function(node) {
      //       return node.position('x');
      //     },
      //     function(node) {
      //       return node.position('y');
      //     }
      //   ]
      // });
      cy.elements()
        .layout({
          name: 'dagre',
          //  // dagre algo options, uses default value on undefined
          nodeSep: 140, // the separation between adjacent nodes in the same rank
          edgeSep: 30, // the separation between adjacent edges in the same rank
          rankSep: 140, // the separation between adjacent nodes in the same rank
          rankDir: 'TB', // 'TB' for top to bottom flow, 'LR' for left to right
          minLen: function(edge) {
            return 1;
          }, // number of ranks to keep between the source and target of the edge
          edgeWeight: function(edge) {
            return 1;
          }, // higher weight edges are generally made shorter and straighter than lower weight edges
          // general layout options
          fit: true, // whether to fit to viewport
          padding: 30, // fit padding
          spacingFactor: 1.2, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
          padding: 30, // fit padding
          animate: false, // whether to transition the node positions
          animationDuration: 500, // duration of animation in ms if enabled
          animationEasing: undefined, // easing of animation if enabled
          boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
          ready: function() {}, // on layoutready
          stop: function() {} // on layoutstop
        })
        .run();
      navigator(cytoscape);
      cy.navigator({
        container: '.cytoscape-navigator-overlay',
        viewLiveFramerate: 0, // set false to update graph pan only on drag end; set 0 to do it instantly; set a number (frames per second) to update not more than N times per second
        thumbnailEventFramerate: 30, // max thumbnail's updates per second triggered by graph updates
        thumbnailLiveFramerate: false, // max thumbnail's updates per second. Set false to disable
        dblClickDelay: 200, // milliseconds
        removeCustomContainer: true, // destroy the container specified by user on plugin destroy
        rerenderDelay: 100 // ms to throttle rerender updates to the panzoom for performance
      });
      cy.on('tap', 'node', function(event) {
        const node = event.target;
        // const data = node[0]._private.data;
        console.log('tapped ' + node.id(), node.data());
        cy.elements()
          .difference(node.outgoers())
          .not(node)
          .addClass('semitransp');
        node
          .addClass('highlight')
          .addClass('selected')
          .outgoers()
          .addClass('highlight');
      });
      cy.on('tap', 'edge', function(event) {
        const edge = event.target;
        // const data = edge[0]._private.data;
        console.log('selected ' + edge.id(), edge.data());
        edge.addClass('selected');
      });
      cy.on('click', function(event) {
        // const data = event.target._private
        // console.log('cy event.target', data);
        // var edges = cy.edges();
        // var nodes = cy.nodes()
        // edges.removeClass('selected')
        // edges.removeClass('semitransp');
        // nodes.removeClass('semitransp');
        cy.elements().removeClass('semitransp');
        cy.elements().removeClass('highlight');
        cy.elements().removeClass('selected');
      });
      // cy.on('click', '#reset-button', function(event) {
      //   console.log('tapped reset')
      //   cy.fit()
      // });
      panzoom(cytoscape);
      let panzoomdefaults = {
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
        panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
        zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
        fitSelector: undefined, // selector of elements to fit
        animateOnFit: function() {
          // whether to animate on fit
          return true;
        },
        fitAnimationDuration: 2000 // duration of animation on fit
      };
      cy.panzoom(panzoomdefaults);
      undoRedo(cytoscape);
      let undoRedoOptions = {
        isDebug: true, // Debug mode for console messages
        actions: {}, // actions to be added
        undoableDrag: false, // Whether dragging nodes are undoable can be a function as well
        stackSizeLimit: undefined, // Size limit of undo stack, note that the size of redo stack cannot exceed size of undo stack
        ready: function() {
          // callback when undo-redo is ready
          this.loading = false; // add spinner
        }
      };
      cy.undoRedo(undoRedoOptions);
      expandCollapse(cytoscape);
      const excoloptions = {
        // layoutBy: undefined, // to rearrange after expand/collapse. It's just layout options or whole layout function. Choose your side!
        layoutBy: {
          name: 'dagre',
          animate: 'end',
          randomize: true,
          fit: false
        },
        // recommended usage: use cose-bilkent layout with randomize: false to preserve mental map upon expand/collapse
        fisheye: false, // whether to perform fisheye view after expand/collapse you can specify a function too
        animate: true, // whether to animate on drawing changes you can specify a function too
        ready: function() {}, // callback when expand/collapse initialized
        undoable: true, // and if undoRedoExtension exists,
        cueEnabled: false, // Whether cues are enabled
        expandCollapseCuePosition: 'top-left', // default cue position is top left you can specify a function per node too
        expandCollapseCueSize: 12, // size of expand-collapse cue
        expandCollapseCueLineSize: 8, // size of lines used for drawing plus-minus icons
        expandCueImage: undefined, // image of expand icon if undefined draw regular expand cue
        collapseCueImage: undefined, // image of collapse icon if undefined draw regular collapse cue
        expandCollapseCueSensitivity: 1 // sensitivity of expand-collapse cues
      };
      const expandCollapseOptions = {
					layoutBy: {
						name: 'dagre',
						animate: 'end',
						randomize: true,
						fit: false
					},
					fisheye: false,
          animate: true,
          cueEnabled: false
      	};
      cy.expandCollapse(expandCollapseOptions)
      // cy.expandCollapse(excoloptions)
      // cy.expandCollapse({
			// 		layoutBy: {
			// 			name: 'dagre',
			// 			animate: 'end',
			// 			randomize: true,
			// 			fit: false
			// 		},
			// 		fisheye: false,
			// 		animate: true
      // 	});
      let api = cy.expandCollapse('get');
      // api.collapseAll();
      // api.collapse(cy.nodes(), excoloptions)
      // api.collapse(cy.nodes(), expandCollapseOptions)
      cy.unbind('expandcollapse.beforeexpand')
      cy.nodes().bind('expandcollapse.beforeexpand', function(event) {
        if (beforeExpand == null)
            beforeExpand = cy.elements().clone();  // save the graph before the first expand
      }); // Triggered before a node is expanded

      cy.unbind('expandcollapse.aftercollapse');
      cy.nodes().bind('expandcollapse.aftercollapse', function(event) {
        if(beforeExpand != null) {
            cy.elements().remove();
            cy.add(beforeExpand);  // set the graph to original values
            beforeExpand = null;
        }
      });
    // }
    // const popperOptions = {
    //     content: 'test data',
    //     renderedPosition: 'bottom',
    //     renderedDimensions: undefined,
    //     popper: undefined
    // }
    // ,
    //   async cyUpdate () {
    //     // new nodes and edges
    //     const { data: elements } = await axios.get(DATA_URL);
    //     const cynodes = data.nodes;
    //     const cylinks = data.edges;
    //     // update the cytoscape instance
    //     this.$cytoscape.instance.then(cy => {
    //       // remove all elements
    //       cy.remove(cy.elements())
    //       // add the new ones
    //       cy.add(cynodes)
    //       cy.add(cylinks)
    //       // inside the cytoscape callback we lose the component this, we can use `that` instead if needed
    //       const that = this
    //       // click and double click (simulated) over the nodes
    //       cy.on('tap', 'node', function (event) {
    //         const data = event.target.data()
    //         // if you are using vuex you can dispatch your events this way
    //         that.$store.dispatch('sectors/select', { data })
    //       })
    //     })
    //   }
    //------------------------------------------
      let ur = cy.undoRedo(); // external (optional) extension which enables undo/redo of expand/collapse

			// cy.expandCollapse({
			// 		layoutBy: {
			// 			name: 'dagre',
			// 			animate: 'end',
			// 			randomize: true,
			// 			fit: false
			// 		},
			// 		fisheye: false,
			// 		animate: true
      // 	});
      
      // cy.expandCollapse(excoloptions);

        // document.getElementById('collapseRecursively').addEventListener('click', function (event) {
        // // cy.on('click', '#collapseRecursively', function(event) {
        //   console.log('collapseRecursively')
				// 	ur.do('collapseRecursively', {
				// 		nodes: cy.$(':selected')
				// 	});
				// });

        // document.getElementById('expandRecursively').addEventListener('click', function (event) {
        // // cy.on('click', '#expandRecursively', function(event) {
        //   console.log('expandRecursively')
				// 	ur.do('expandRecursively', {
				// 		nodes: cy.$(':selected')
				// 	});
				// });

        document.getElementById('collapseAll').addEventListener('click', function (event) {
          console.log('collapseAll')
        // cy.on('tap', 'collapseAll', function(event) {
          // this.loading = true; // add spinner
					ur.do('collapseAll'); // cy.collapseAll(options);
				});

        document.getElementById('expandAll').addEventListener('click', function (event) {
          console.log('expandAll')
        // cy.on('tap', 'expandAll', function(event) {
					ur.do('expandAll');
        });
        
        document.addEventListener('keydown', function (e){
					if (e.ctrlKey && e.which == '90') {
						cy.undoRedo().undo();
					}
					else if (e.ctrlKey && e.which == '89') {
						cy.undoRedo().redo();
					}
				}, true )
    //-------------------------------------------------
    }
  }
};
</script>

<style>
@import '~@/styles/cytoscape/panzoom.css';
#holder {
  width: 100%;
  height: 800px;
  background-color: #222;
  z-index: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin-top: 0;
  width: 100%;
}

.cytoscape-navigator-overlay {
  position: absolute;
  border: 1px solid #fff;
  background: #222;
  z-index: 99999;
  width: 200px;
  height: 150px;
  bottom: 83px;
  right: -1px;
  overflow: hidden;
}

.cytoscape-navigatorView {
  border: 2px solid yellow;
  border-radius: 1px;
  background-color: #0c78ff;
  opacity: 0.4;
  /* cursor: move; */
}

.spinner {
  position: fixed;
  top: 50%;
  left: 54%;
}

.reset {
  position: absolute;
  bottom: 83px;
  left: 1px;
}

/* #reset-button {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: centre;
  color: #2c3e50;
} */
</style>

