<!--
Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.

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
  <v-snackbar
    :model-value="offline"
    :timeout=-1
    color="red"
    location="top"
    :prepend-icon="mdiLanDisconnect"
    :text="message"
  >
    <template #header>
      <v-progress-linear
        v-if="connecting"
        color="red-lighten-3"
        indeterminate
        class="mb-n1"
      />
    </template>
  </v-snackbar>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { mdiLanDisconnect } from '@mdi/js'

const store = useStore()

const offline = computed(() => Boolean(store.state.offline))

const connecting = computed(() => store.state.offline === -1)

const message = computed((prev) => {
  if (!store.state.offline) return prev
  return connecting.value ? 'Connecting...' : 'Connection lost'
})
</script>
