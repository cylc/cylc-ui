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

<template>
  <div
    class="task-state-badge d-flex justify-center align-center px-1 font-weight-medium"
    :class="state"
  >
    {{ value }}
    <v-tooltip
      location="top"
      :open-delay="400"
    >
      {{ value }} {{ displayName }} task{{ value > 1 ? 's': '' }}.
      <template v-if="latestTasks.length">
        Latest:
        <span
          v-for="(task, index) in latestTasks.slice(0, maxLatestTasks)"
          :key="index"
          class="text-grey-lighten-1"
        >
          <br/>{{ task }}
        </span>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  state: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true,
  },
  latestTasks: {
    type: Array,
    default: () => [],
  },
  maxLatestTasks: {
    type: Number,
    default: 5,
  },
})

const displayName = computed(
  () => props.state === 'submitted' ? 'preparing/submitted' : props.state
)
</script>
