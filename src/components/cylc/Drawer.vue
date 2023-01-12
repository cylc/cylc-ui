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
    floating
    mobile-breakpoint="991"
    :width="navigation.width"
    class="fill-height"
  >
    <div class="d-flex flex-column h-100">
      <v-list
        class="pa-0 ma-0 flex-grow-0 d-flex flex-column"
      >
        <c-header :user="user.username" />

        <v-list-item
          to="/"
        >
          <template v-slot:prepend>
            <v-icon>{{ svgPaths.home }}</v-icon>
          </template>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>

        <v-list-item
          to="/graphiql"
          class="v-list-item"
        >
          <template v-slot:prepend>
            <v-icon>{{ svgPaths.graphql }}</v-icon>
          </template>
          <v-list-item-title>GraphiQL</v-list-item-title>
        </v-list-item>
        <v-divider class="" />
        <v-list-item>
          <v-list-item-title>Workflows</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-list
        class="pa-0 ma-0 flex-grow-1 d-flex flex-column"
      >
        <Workflows class="h-100" />
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
import Header from '@/components/cylc/Header'
import { mapState } from 'vuex'
import Workflows from '@/views/Workflows'
import { mdiHome, mdiGraphql } from '@mdi/js'
import pkg from '@/../package.json'

export default {
  components: {
    Workflows,
    'c-header': Header
  },

  data: function () {
    return {
      svgPaths: {
        home: mdiHome,
        graphql: mdiGraphql
      },
      environment: process.env.VUE_APP_SERVICES === 'offline' ? 'OFFLINE' : process.env.NODE_ENV.toUpperCase(),
      version: pkg.version,
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
  }
}
</script>
