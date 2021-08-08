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
    app
    absolute
    floating
    mobile-breakpoint="991"
    width="260"
    class="fill-height"
  >
    <!--
       color is #eee copying the drawer top-part color. Needs to be applied here since applying in the
       scss files does not work. The v-btn Vuetify component appears to calculate the hover color based
       on the given color="" value. Using the scss/css, the hover is not activated.
    -->
    <v-btn
      absolute
      right
      x-small
      fab
      depressed
      color="#eeeeee"
      id="drawer-toggle-btn"
      @click="drawer = !drawer"
    >
      <v-icon
        v-if="drawer"
        color="#999999"
      >
        {{ svgPaths.left }}
      </v-icon>
      <v-icon
        v-else
        color="#999999"
      >
        {{ svgPaths.right }}
      </v-icon>
    </v-btn>
    <v-list
      class="pa-0 ma-0"
    >
      <c-header :user="user.username" />
      <v-list-item
        v-if="responsive"
      >
        <v-text-field
          class="purple-input search-input"
          label="Search..."
          color="purple"
        />
      </v-list-item>

      <v-list-item
        to="/"
        active-class="primary grey--text text--darken-3"
        class="v-list-item"
      >
        <v-list-item-action>
          <v-icon>{{ svgPaths.home }}</v-icon>
        </v-list-item-action>
        <v-list-item-title>Dashboard</v-list-item-title>
      </v-list-item>
      <v-list-item
        to="/graphiql"
        active-class="primary grey--text text--darken-3"
        class="v-list-item"
      >
        <v-list-item-action>
          <v-icon>{{ svgPaths.graphql }}</v-icon>
        </v-list-item-action>
        <v-list-item-title>GraphiQL</v-list-item-title>
      </v-list-item>
      <v-divider />
      <v-subheader>Workflows</v-subheader>
      <g-scan />
    </v-list>
    <template v-slot:append>
      <div class="px-4 py-2 d-flex justify-center">
        <span class="grey--text text--darken-2">
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
import { mdiHome, mdiGraphql, mdiChevronDoubleLeft, mdiChevronDoubleRight } from '@mdi/js'
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
        graphql: mdiGraphql,
        left: mdiChevronDoubleLeft,
        right: mdiChevronDoubleRight
      },
      environment: process.env.VUE_APP_SERVICES === 'offline' ? 'OFFLINE' : process.env.NODE_ENV.toUpperCase(),
      version: version
    }
  },
  computed: {
    ...mapState('user', ['user']),
    drawer: {
      get: function () {
        return this.$store.state.app.drawer
      },
      set: function (val) {
        this.$store.commit('app/setDrawer', val)
      }
    }
  }
}
</script>
