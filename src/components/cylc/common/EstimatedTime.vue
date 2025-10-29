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

<!-- Simple component to show an actual time or fall back to an estimate if present. -->

<template>
  <template v-if="isTruthyOrZero(actual)">
    {{ formatter(actual) }}
  </template>
  <span
    v-else-if="isTruthyOrZero(estimate)"
    v-tooltip="{ text: tooltip, openDelay: 200 }"
    class="d-inline-flex align-center text-blue-grey"
  >
    {{ formatter(estimate) }}
    <v-icon
      :icon="mdiTimerSand"
      size="small"
      class="ml-1"
    />
  </span>
</template>

<script setup>
import { mdiTimerSand } from '@mdi/js'
import { isTruthyOrZero } from '@/utils/tasks'

defineProps({
  actual: {
    type: [String, Number],
  },
  estimate: {
    type: [String, Number],
  },
  formatter: {
    type: Function,
    default: (x) => x,
  },
  tooltip: {
    type: String,
    default: 'Estimate',
  },
})
</script>
