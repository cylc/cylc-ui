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
    class="task-state-badge d-flex justify-center align-center font-weight-medium"
    :class="state"
  >
    <v-icon v-if="isModifier" >{{ icon }}</v-icon>
    {{ isModifier ? '' : value }}
    <v-tooltip
      location="top"
      :open-delay="400"
    >
      {{ displayText }}
      <template v-if="latestTasks?.length">
        Latest:
        <span
          v-for="task in latestTasks"
          :key="task"
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
import { taskHeld, taskRetry } from '@/utils/icons'

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
})

const icons = {
  held: taskHeld,
  retry: taskRetry,
}

const isModifier = computed(
  () => ['held', 'retry'].includes(props.state)
)

const displayName = computed(
  () => props.state === 'submitted' ? 'preparing/submitted' : props.state
)

const displayText = computed(
  () => isModifier.value
    ? `One or more ${props.state} task(s).`
    : `${props.value} ${displayName.value} task${props.value > 1 ? 's' : ''}`
)

const icon = computed(
  () => isModifier.value
    ? icons[props.state]
    : null
)
</script>
