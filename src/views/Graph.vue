<template>
  <div id='holder'>
    <!-- <div class='reset'>
      <v-btn align-center justify-center color='#333' class='v-btn' id='reset-button'>
        <v-icon id='reset-icon' name='reset-icon' color='white'>mdi-backup-restore</v-icon>
      </v-btn>
    </div> -->
    <div class='cytoscape-navigator'>
      <canvas></canvas>
      <div class='cytoscape-navigatorView'></div>
      <div class='cytoscape-navigatorOverlay'></div>
    </div>
    <cytoscape :config='config' :preConfig='preConfig' :afterCreated='afterCreated'>
      <cy-element v-for='def in elements.nodes' :key='`${def.data.id}`' :definition='def'/>
      <cy-element v-for='def in elements.edges' :key='`${def.data.id}`' :definition='def'/>
    </cytoscape>
  </div>
</template>

<script>
import cytoscape from 'cytoscape';
import klay from 'cytoscape-klay';
import navigator from 'cytoscape-navigator';
import axios from 'axios';

// const DATA_URL = 'http://localhost:8080/test-data.json';
const DATA_URL = 'http://localhost:8080/complex-cytoscape-dot.json';

const elements = [];

const config = {
  autounselectify: true,
  boxSelectionEnabled: false,
  layout: {
    name: 'klay',
    textureOnViewport: false,
    hideEdgesOnViewport: true
  },
  style: [
    {
      selector: 'node',
      css: {
        'background-color': '#bdfffc',
        content: 'data(name)',
        'font-family': 'Avenir, Helvetica, Arial, sans-serif',
        color: '#fff',
        'text-max-width': '.5em',
        'text-wrap': 'wrap',
        'text-valign': 'top',
        'text-halign': 'right',
        'line-height': 1.1,
        'text-margin-x': 5,
        'font-size': '.8em',
        'min-zoomed-font-size': '.6em',
        shape: 'rectangle'
      }
    },
    {
      selector: 'edge',
      css: {
        width: 5,
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'line-color': '#fff',
        'target-arrow-color': '#fff',
        opacity: 0.8,
        'target-distance-from-node': 3
      }
    }
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
      i: 1
    };
  },
  methods: {
    async preConfig(cytoscape) {
      // cytoscape: this is the cytoscape constructor
      cytoscape.use(klay);
    },
    async afterCreated() {
      const cy = await this.$cytoscape.instance;
      const { data: elements } = await axios.get(DATA_URL);
      elements.nodes.forEach(n => cy.add(n));
      elements.edges.forEach(n => cy.add(n));
      console.log('after created');
      console.log('loaded elements: ', elements, cy);
      cy.elements()
        .layout({
          name: 'klay',
          fit: true,
          padding: 30, // Padding on fit
          animate: false,
          spacing: 50,
          styleEnabled: true,
          // zoom: 1,
          // pan: { x: 0, y: 0 },
          minZoom: 1e-50,
          maxZoom: 1e50,
          //  Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
          animateFilter: function(node, i) {
            return true;
          },
          animationDuration: 3000, // Duration of animation in ms if enabled
          animationEasing: 'ease-out',
          transform: function(node, pos) {
            return pos;
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
            INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
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
            nodeLayering: 'NETWORK_SIMPLEX', // Strades": [tegy for node layering.
            /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
            LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
            INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
            nodePlacement: 'INTERACTIVE', // Strategy for Node Placement
            /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
            LINEAR_SEGMENTS Computes a balanced placement.
            INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
            SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
            randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
            routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
            separateConnectedComponents: true, // Whether each connected component should be processed separately
            spacing: 24, // Overall setting for the minimal amount of space to be left between objects
            thoroughness: 7 // How much effort should be spent to produce a nice layout..
          }
          // priority: function( edge ){ return null; }, // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
        })
        .run();
      navigator(cytoscape);
      cy.navigator({
        // container: '.cytoscape-navigator',
        viewLiveFramerate: 0, // set false to update graph pan only on drag end; set 0 to do it instantly; set a number (frames per second) to update not more than N times per second
        thumbnailEventFramerate: 30, // max thumbnail's updates per second triggered by graph updates
        thumbnailLiveFramerate: false, // max thumbnail's updates per second. Set false to disable
        dblClickDelay: 200, // milliseconds
        removeCustomContainer: true, // destroy the container specified by user on plugin destroy
        rerenderDelay: 100 // ms to throttle rerender updates to the panzoom for performance
      });
      // ------
      // // color predecessor lines red on click
      // cy.unbind('click');
      // cy.bind('click', 'node', function(node) {
      //   // console.log(node.target.predecessors().edges());
      //   node.target
      //     .predecessors()
      //     .edges()
      //     .animate({
      //       style: {
      //         lineColor: 'yellow'
      //       }
      //     });
      // });
      // // ----------------------
      cy.on('tap', 'node', function(event) {
        let node = event.target;
        console.log('selected ' + node.id(), node.data());
      });
      cy.on('tap', 'edge', function(event) {
        let edge = event.target;
        console.log('tapped edge ' + edge.id());
      });
      cy.on('click', '#reset-button', function(event) {
        console.log('tapped reset');
        cy.fit();
      });
      cy.on('tap', function(event) {
        console.log('reset');
        if (event.target == cy) {
          console.log('cy tapped');
        }
        if (event.target == cy.cytoscape-navigator) {
          console.log('reset tapped');
        }
        if (undefined === event.target.id) {
          cy.fit();
          // cy.json({
          //   zoom: 1,
          //   pan: { x: 0, y: 0 }
        }
      });
    }
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
  }
};
</script>

<style>
#holder {
  width: 100%;
  height: 800px;
  background-color: #222;
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

.cytoscape-navigator {
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
    background-color: blue;
    opacity: .2;
    cursor: move;
  }


/* .cytoscape-navigator:hover .cytoscape-navigatorOverlay{background: purple;} */
/* .cytoscape-navigator .cytoscape-navigatorView{border: 2px solid yellow; border-radius: 1px; background-color: blueviolet; opacity: .2; cursor: move;} */
/* .cytoscape-navigator.mouseover-view .cytoscape-navigatorView{background: rgba(0,255,0,0.5);} */

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
