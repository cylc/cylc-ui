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
  <v-snackbar
    v-if="alert"
    :model-value="Boolean(alert)"
    :color="alert.color"
    location="top"
    timeout="-1"
    data-cy="alert-snack"
    content-class="text-pre-wrap"
  >
    <template v-slot:actions>
      <v-btn
        :icon="mdiClose"
        @click="closeAlert"
        data-cy="snack-close"
      />
    </template>
    <p>
      {{ alert.text }}
    </p>
    <p
      v-if="alert.detail"
      class="mt-2 opacity-80"
    >
      {{ alert.detail }}
    </p>
  </v-snackbar>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { mdiClose } from '@mdi/js'

const store = useStore()
const alert = computed(() => store.state.alert)

/**
 * Dismisses the alert from the UI, also removing it from the Vuex store.
 */
function closeAlert () {
  store.dispatch('setAlert', null)
}
</script>
