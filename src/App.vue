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
  <v-app :class="jobThemeClass">
    <component :is="layout" :showSidebar="showSidebar">
      <router-view/>
    </component>
  </v-app>
</template>

<script>
import appSettings from '@/mixins/appSettings'
import { useJobTheme, useReducedAnimation } from '@/composables/localStorage'

const DEFAULT_LAYOUT = 'empty'

export default {
  mixins: [
    appSettings,
  ],

  computed: {
    layout () {
      return `${this.$route.meta.layout || DEFAULT_LAYOUT}-layout`
    },
    showSidebar () {
      return this.$route.meta.showSidebar ?? true
    },
    jobThemeClass () {
      return `job_theme--${useJobTheme().value}`
    },
  },

  mounted () {
    // apply stored application font-size
    if (localStorage.fontSize) {
      document.documentElement.style.fontSize = localStorage.fontSize
    }
    // apply stored reduced animation mode on/off
    this.setReducedAnimation(useReducedAnimation().value)
  }
}
</script>

<style lang="scss">
  @import '@/styles/index.scss';
</style>
