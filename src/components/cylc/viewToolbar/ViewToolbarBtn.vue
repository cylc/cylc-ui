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
  <v-btn
    size="40"
    variant="text"
    density="compact"
    rounded="lg"
    icon
    v-bind="{ ...$attrs, ...btnProps }"
    :color="active ? activeColor : undefined"
  >
    <slot name="icon">
      <!-- Separate named slot to ensure icon is still rendered when parent overrides default slot -->
      <v-icon :icon="displayIcon"/>
    </slot>
    <slot/>
  </v-btn>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  /** Color to use when active. */
  activeColor: {
    type: String,
    default: 'blue',
  },
  /** Icon to show when active. */
  activeIcon: {
    type: String,
  },
})

const [active, { toggle }] = defineModel('active', {
  type: [Boolean, Number],
  default: false,
})

// When `v-model:active.toggle="boundValue"` is provided, the button automatically toggles the bound value.
const btnProps = computed(
  () => toggle
    ? {
        onClick () {
          active.value = !active.value
        },
        role: 'switch',
        ariaChecked: active.value,
      }
    : {}
)

const displayIcon = computed(
  () => (active.value && props.activeIcon) || props.icon
)

</script>
