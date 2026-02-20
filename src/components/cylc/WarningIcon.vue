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

    states:
    * no warnings: grey + translucent
    * new warnings: yellow
    * warnings dismissed: grey
-->

<template>
  <span
    class="c-warn d-inline-flex"
    :class="{'active': workflow.node.warningActive}"
  >
    <v-tooltip
      :activator="null"
      location="bottom"
      :disabled="!workflow.node.logRecords?.length"
    >
      <template
        v-slot:activator="{ props }"
      >
        <!-- NOTE: the click.prevent suppresses router navigation -->
        <svg
          viewBox="0 0 100 100"
          v-bind="props"
          @click="deactivate"
          @click.prevent
          style="
            cursor: pointer;
          "
          :style="[workflow.node.logRecords?.length ? {opacity: 1} : {opacity: 0.3}]"
        >
          <path
            :d="$options.path"
            :stroke-width="$options.strokeWidth"
            v-bind:class="{'active': workflow.node.warningActive}"
          />
        </svg>
      </template>
      Recent warnings (click to dismiss):
      <table>
        <tr
          v-for="(event, index) in (workflow.node.logRecords || []).slice().reverse()"
          :key="index"
        >
          <td style="padding-right: 0.5em; vertical-align: top;">
            <EventChip :level="event.level" />
          </td><td>
            <span class="truncated-message">{{ event.message }}</span>
          </td>
        </tr>
      </table>
    </v-tooltip>
  </span>
</template>

<script>
import EventChip from '@/components/cylc/EventChip.vue'
import { store } from '@/store/index'

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
  name: 'WarningIcon',

  components: {
    EventChip,
  },

  props: {
    workflow: {
      required: true,
    }
  },

  methods: {
    deactivate () {
      store.commit('workflows/UPDATE', { id: this.workflow.id, warningActive: false })
    },
  },

  strokeWidth: sw,
  path: PATH,
}
</script>

<style lang="scss" scoped>
@use "/src/styles/util";

.truncated-message {
  @include util.line-clamp(2);
}
</style>
