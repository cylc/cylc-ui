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

<!-- Component which is displayed in a lumino tab. -->

<template>
  <!-- Teleport to the div for the widget (which gets created & attached to dock panel separately) -->
  <Teleport :to="`#${id}`">
    <slot />
  </Teleport>
</template>

<script setup>
import { provide, readonly, ref } from 'vue'
import { eventBus } from '@/services/eventBus'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

/**
 * Ref used to indicate to children that the widget has become unhidden, and
 * that any task progress CSS animations should be given a new delay value
 * to maintain their state.
 *
 * This is because when an element goes from display:none to visible, CSS
 * animations start from scratch.
 * @see https://stackoverflow.com/a/37671302/3217306
 */
const animResetTime = ref(Date.now())
provide('animResetTime', readonly(animResetTime))

eventBus.on(`lumino:show:${props.id}`, () => {
  animResetTime.value = Date.now()
})
</script>
