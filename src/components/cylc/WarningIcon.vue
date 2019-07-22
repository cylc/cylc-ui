<!--
    WarningIcon - A dismiss-able warning icon
-->

<template>
  <span
    class="c-warn"
    style="display:inline-block; vertical-align:middle"
  >
    <v-tooltip
      bottom
      :disabled="!message"
    >
      <template
        v-slot:activator="{ on }"
      >
        <svg
          viewBox="0 0 100 100"
          v-on="on"
          @click="deactivate"
        >
          <path
            :d="path()"
            :stroke-width="strokeWidth()"
          v-bind:class="{'active': active}"
          />
        </svg>
      </template>
      <span>{{ message }}</span>
    </v-tooltip>
  </span>
</template>

<script>
/* stuff we want to do once, when the component is loaded, rather than
 * every time it is used. */
// stroke
const sw = 10 // stroke width
const hsw = sw / 2 // half stroke width

// bounding box
const x1 = 2
const x2 = 98
const y1 = 8
const y2 = 92

// path commands
const PATH = pathJoin([
  ['M', x1 + sw, y1 + hsw],
  ['L', x2 - sw, y1 + hsw],
  ['L', ((x2 - x1) / 2) + x1, y2 - sw],
  ['L', x1 + sw, y1 + hsw],
  ['Z', '', '']
])

function nodeJoin (item) {
  return `${item[0]}${item.slice(1).join(' ')}`
}

function pathJoin (list) {
  return list.reduce((ret, item, ind) => {
    if (ind === 1) {
      ret = nodeJoin(ret)
    }
    return `${ret} ${nodeJoin(item)}`
  })
}

export default {
  name: 'Warning',
  data: function () {
    return {
      active: this.startActive
    }
  },
  props: {
    message: {
      type: String,
      required: false
    },
    startActive: {
      type: Boolean,
      required: false
    }
  },
  methods: {
    path () {
      return PATH
    },

    strokeWidth () {
      return sw
    },

    deactivate () {
      this.active = false
    }
  }
}
</script>

<style lang="scss">
.c-warn {
  svg {
    width: 1em;
    height: 1em;

    path {
      /* TODO - move colours to job or app theme */
      stroke: rgb(170,170,170);
      fill: rgb(150,150,150);
    }

    path.active {
      stroke: rgb(255,122,122);
      fill: rgb(248,197,102);
    }
  }
}
</style>
