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
    <component :is="layout">
      <router-view/>
    </component>
  </v-app>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'

const DEFAULT_LAYOUT = 'empty'
const DEFAULT_URL = '/'

export default {
  props: {
    /**
     * This is the application baseUrl, given by the Python backend or by the mocked
     * offline mode.
     */
    baseUrl: {
      type: String,
      default: DEFAULT_URL
    }
  },
  computed: {
    ...mapState('app', ['jobTheme']),
    layout () {
      return (this.$route.meta.layout || DEFAULT_LAYOUT) + '-layout'
    },
    jobThemeClass () {
      return `job_theme--${this.jobTheme}`
    }
  },
  methods: {
    ...mapActions(['setBaseUrl']),
    ...mapMutations('app', ['setJobTheme'])
  },
  created () {
    let baseUrl = DEFAULT_URL
    if (process.env.VUE_APP_SERVICES !== 'offline') {
      baseUrl = this.baseUrl !== '' ? this.baseUrl : DEFAULT_URL
    }
    this.setBaseUrl(baseUrl)
  },
  mounted () {
    // set application font-size in HTML top-level element
    if (localStorage.fontSize) {
      document.getElementsByTagName('html')[0].style.fontSize = localStorage.fontSize
    }
    // set Job icons theme found in LocalStorage in Vuex
    this.setJobTheme(localStorage.jobTheme || 'default')
  }
}
</script>

<style lang="scss">
  @import '~@/styles/index.scss';

  /* Remove in 1.2 */
  .v-datatable thead th.column.sortable i {
    vertical-align: unset;
  }
</style>
