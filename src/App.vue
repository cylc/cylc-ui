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
  <v-app :class="`job_theme--${jobTheme}`">
    <component :is="layout">
      <router-view/>
    </component>
  </v-app>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { injectDefaults } from 'vuetify/lib/composables/defaults'
import { mergeDeep } from 'vuetify/lib/util'
import { useJobTheme, useReducedAnimation } from '@/composables/localStorage'

const DEFAULT_LAYOUT = 'empty'
const route = useRoute()

const layout = computed(() => `${route.meta.layout || DEFAULT_LAYOUT}-layout`)

const jobTheme = useJobTheme()

const reducedAnimation = useReducedAnimation()

// Reactively update Vuetify global defaults to respect reduced animation setting
// (https://github.com/vuetifyjs/vuetify/issues/19645#issuecomment-5242189108):
const vuetifyDefaults = injectDefaults()
watch(
  reducedAnimation,
  (value) => {
    vuetifyDefaults.value = mergeDeep(
      vuetifyDefaults.value,
      {
        global: {
          transition: value ? 'no' : undefined,
          ripple: value ? false : undefined,
        },
      },
    )
  },
  { immediate: true }
)

onMounted(() => {
  // apply stored application font-size
  if (localStorage.fontSize) {
    document.documentElement.style.fontSize = localStorage.fontSize
  }
})
</script>
