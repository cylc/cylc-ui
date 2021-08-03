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
