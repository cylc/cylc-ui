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

<!-- A button that copies the specified text to the clipboard -->

<template>
  <v-btn
    v-if="isSupported"
    @click="copy(text)"
    icon
    variant="plain"
    size="small"
    density="comfortable"
    data-cy="copy-to-clipboard"
  >
    <v-icon>{{ copied ? mdiClipboardCheck : mdiContentCopy }}</v-icon>
    <v-tooltip :open-delay="1e3">{{ copied ? 'Copied' : tooltip }}</v-tooltip>
  </v-btn>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'
import {
  mdiClipboardCheck,
  mdiContentCopy,
} from '@mdi/js'

defineProps({
  /** Text that the button will copy */
  text: {
    type: String,
    required: true,
  },
  /** Text to show in tooltip */
  tooltip: {
    type: String,
    default: 'Copy',
  },
})

const { isSupported, copy, copied } = useClipboard()
</script>
