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

<!--
  Subgraph - Used to render graphviz subgraphs as svg.
-->
<template>
  <g class="c-graph-subgraph">
    <rect
      :width="subgraph.width"
      :height="subgraph.height"
      :x="subgraph.x"
      :y="subgraph.y"
      rx="50"
      ry="50"
      fill="none"
      stroke-width="8px"
      stroke="grey"
      stroke-dasharray="50 50"
      />
    <text
      :x="labelXPosition"
      :y="labelYPosition"
      font-family="Roboto"
      alignment-baseline="middle" text-anchor="middle"
      font-size="60px"
      fill="black"
      stroke-width=5
      paint-order="stroke"
      stroke="white"
    >
      {{ subgraph.label }}
    </text>
  </g>
</template>

<script>
export default {
  name: 'GraphSubgraph',
  props: {
    subgraph: {
      type: Object,
      required: true,
    },
  },
  computed: {
    labelXPosition () {
      return (parseInt(this.subgraph.x) + (parseInt(this.subgraph.width) / 2))
    },
    labelYPosition () {
      // Graphviz puts labels inside the subgraph
      // SVG rect text is put outside the rect
      // Adding 90pt to the y position brings the label inside the rect
      return (parseInt(this.subgraph.y) + 90)
    },
  },
}
</script>
