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
    v-tooltip="{ text: tooltip, openDelay: 400, location: 'top' }"
  >
    {{ value }}
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
})

const tooltip = computed(
  () => `${props.value} ${props.state} task${props.value > 1 ? 's' : ''}`
)
</script>
