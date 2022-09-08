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
    ref="drawerRef"
    app
    floating
    hide-overlay
    mobile-breakpoint="991"
    :width="navigation.width"
    persistent
    class="fill-height"
  >
    <div class="d-flex flex-column h-100">
      <v-list
        class="pa-0 ma-0 flex-grow-0 d-flex flex-column"
      >
        <c-header class="pb-5" :user="user.username" />
        <v-list-item
          v-if="responsive"
        >
          <v-text-field
            class="search-input"
            label="Search..."
          />
        </v-list-item>

        <v-list-item
          to="/"
        >
          <v-list-item-action>
            <v-icon>{{ svgPaths.home }}</v-icon>
          </v-list-item-action>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>

        <v-list-item
          to="/graphiql"
          class="v-list-item"
        >
          <v-list-item-action>
            <v-icon>{{ svgPaths.graphql }}</v-icon>
          </v-list-item-action>
          <v-list-item-title>GraphiQL</v-list-item-title>
        </v-list-item>
        <v-divider class="" />
        <v-subheader class="py-3">Workflows</v-subheader>
      </v-list>

      <v-list
        class="pa-0 ma-0 flex-grow-1 d-flex flex-column"
      >
        <g-scan class="h-100" />
      </v-list>
    </div>
    <template v-slot:append>
      <div class="px-4 py-2 d-flex justify-center">
        <span class="text--secondary">
          <strong v-if="environment !== 'PRODUCTION'">{{ environment }}</strong> {{ $t('App.name') }} {{ version }}
        </span>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
// because we use `tag=v-list` and not `v-list`
// eslint-disable-next-line no-unused-vars
import Header from '@/components/cylc/Header'
import { mapState } from 'vuex'
import GScan from '@/components/cylc/gscan/GScan'
import { mdiHome, mdiGraphql } from '@mdi/js'
import { version } from '@/../package.json'

export default {
  components: {
    GScan,
    'c-header': Header
  },
  data: function () {
    return {
      responsive: false,
      svgPaths: {
        home: mdiHome,
        graphql: mdiGraphql
      },
      environment: process.env.VUE_APP_SERVICES === 'offline' ? 'OFFLINE' : process.env.NODE_ENV.toUpperCase(),
      version,
      navigation: {
        width: 260,
        borderSize: 3
      }
    }
  },
  computed: {
    ...mapState('user', ['user']),
    drawer: {
      get () {
        return this.$store.state.app.drawer
      },
      set (val) {
        if (val) {
          const newWidth = typeof this.navigation.width === 'string' ? Number(this.navigation.width.replace('px', '')) : this.navigation.width
          this.navigation.width = newWidth < 260 ? 260 : newWidth
        }
        this.$store.commit('app/setDrawer', val)
      }
    }
  },
  methods: {
    getDrawerElement () {
      return this.$refs.drawerRef.$el
    },
    setBorderWidth () {
      const i = this.getDrawerElement().querySelector(
        '.v-navigation-drawer__border'
      )
      i.style.width = this.navigation.borderSize + 'px'
      i.style.cursor = 'ew-resize'
    },
    resize (e) {
      document.body.style.cursor = 'ew-resize'
      const el = this.getDrawerElement()
      const direction = el.classList.contains('v-navigation-drawer--right')
        ? 'right'
        : 'left'
      const f = direction === 'right' ? document.body.scrollWidth - e.clientX : e.clientX
      el.style.width = f + 'px'
    },
    setEvents () {
      const minSize = this.navigation.borderSize
      const el = this.getDrawerElement()
      const drawerBorder = el.querySelector('.v-navigation-drawer__border')
      drawerBorder.addEventListener(
        'mousedown',
        (e) => {
          if (e.offsetX < minSize) {
            el.style.transition = 'initial'
            document.addEventListener('mousemove', this.resize, false)
            if (e.stopPropagation) e.stopPropagation()
            if (e.preventDefault) e.preventDefault()
            return false
          }
        },
        false
      )
      document.addEventListener(
        'mouseup',
        () => {
          el.style.transition = ''
          this.navigation.width = el.style.width
          document.body.style.cursor = ''
          document.removeEventListener('mousemove', this.resize, false)
          // this slightly hacky timeout is used to ensure a browser redraw forced the lumino tabs to be resized when the drag event has finished
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'))
          }, 600)
        },
        false
      )
    }
  },
  mounted () {
    this.setBorderWidth()
    this.setEvents()
  }
}
</script>
