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
  <v-navigation-drawer
    v-model="drawer"
    id="c-sidebar"
    ref="drawerRef"
    floating
    :width="drawerWidth"
    class="fill-height"
  >
    <div class="d-flex flex-column">
      <v-list
        class="pa-0 d-flex flex-column"
      >
        <c-header />

        <v-list-item
          to="/"
        >
          <template v-slot:prepend>
            <v-icon style="opacity: 1;">{{ $options.icons.mdiHome }}</v-icon>
          </template>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>

        <v-list-item
          to="/graphiql"
          class="v-list-item"
        >
          <template v-slot:prepend>
            <v-icon style="opacity: 1;">{{ $options.icons.mdiGraphql }}</v-icon>
          </template>
          <v-list-item-title>GraphiQL</v-list-item-title>
        </v-list-item>
        <v-divider class="" />
        <v-list-item>
          <v-list-item-title>Workflows</v-list-item-title>
        </v-list-item>
      </v-list>

      <Workflows />
    </div>
    <div class="resize-bar" ref="resizeBar"></div>
    <template v-slot:append>
      <div class="px-4 py-2 d-flex justify-center">
        <span class="text--secondary">
          <strong v-if="$options.mode !== 'production'">{{ $options.mode.toUpperCase() }}</strong> {{ $t('App.name') }} {{ $options.version }}
        </span>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import Header from '@/components/cylc/Header.vue'
import { mapMutations } from 'vuex'
import Workflows from '@/views/Workflows.vue'
import { mdiHome, mdiGraphql } from '@mdi/js'
import pkg from '@/../package.json'

export const initialWidth = 260
export const minWidth = 150

export default {
  components: {
    Workflows,
    'c-header': Header
  },

  data: function () {
    return {
      drawerWidth: initialWidth
    }
  },

  mounted () {
    this.setEvents()
  },

  computed: {
    drawer: {
      get () {
        return this.$store.state.app.drawer
      },
      set (val) {
        this.setDrawer(val)
      }
    }
  },

  methods: {
    ...mapMutations('app', ['setDrawer']),
    getDrawerElement () {
      // Cannot use $refs.drawerRef.$el due to https://github.com/vuetifyjs/vuetify/issues/16766
      return document.getElementById('c-sidebar')
    },
    resize (e) {
      // If less than min width, will collapse (to 4px because that's the
      // resize-bar width)
      this.drawerWidth = e.clientX > minWidth ? e.clientX : 4
    },
    setEvents () {
      const el = this.getDrawerElement()
      const drawerBorder = this.$refs.resizeBar
      drawerBorder.addEventListener(
        'mousedown',
        (mdEvent) => {
          // Prevent Vuetify-provided transitions to ensure responsiveness
          el.style.transition = 'none'
          document.body.classList.add('resizing-drawer')
          document.addEventListener('mousemove', this.resize, { passive: true })
          mdEvent.stopPropagation?.()
          mdEvent.preventDefault?.()

          document.addEventListener(
            'mouseup',
            (muEvent) => {
              if (muEvent.clientX < minWidth) {
                this.drawer = false
                // Reset to width at time of mousedown
                // (using a timeout as a hack to prevent drawer briefly
                // reappearing (nextTick doesn't work))
                setTimeout(() => {
                  this.drawerWidth = mdEvent.clientX
                }, 200)
              }
              el.style.transition = null
              document.body.classList.remove('resizing-drawer')
              document.removeEventListener('mousemove', this.resize)
            },
            { once: true }
          )
        }
      )
    }
  },

  icons: {
    mdiHome,
    mdiGraphql,
  },
  mode: import.meta.env.MODE,
  version: pkg.version,
}
</script>
