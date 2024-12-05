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
  <v-defaults-provider :defaults="vuetifyDefaults">
    <v-app :class="`job_theme--${jobTheme}`">
      <component :is="layout" :showSidebar="showSidebar">
        <router-view/>
      </component>
    </v-app>
  </v-defaults-provider>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useJobTheme } from '@/composables/localStorage'
import { useDynamicVuetifyDefaults } from '@/plugins/vuetify'

const DEFAULT_LAYOUT = 'empty'
const route = useRoute()

const layout = computed(() => `${route.meta.layout || DEFAULT_LAYOUT}-layout`)

const showSidebar = computed(() => route.meta.showSidebar ?? true)

const jobTheme = useJobTheme()

const vuetifyDefaults = useDynamicVuetifyDefaults()

onMounted(() => {
  // apply stored application font-size
  if (localStorage.fontSize) {
    document.documentElement.style.fontSize = localStorage.fontSize
  }
})
</script>
