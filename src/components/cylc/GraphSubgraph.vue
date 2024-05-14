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
      required: true
    }
  },
  computed: {
    labelXPosition () {
      return (parseInt(this.subgraph.x) + (parseInt(this.subgraph.width) / 2))
    },
    labelYPosition () {
      return (parseInt(this.subgraph.y) + 90)
    },
  }
}
</script>
