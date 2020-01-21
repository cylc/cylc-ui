<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    floating
    mobile-break-point="991"
    width="260"
    persistent
    class="fill-height"
  >
    <v-layout
      tag="v-list"
      column
      class="pa-0"
    >
      <c-header />
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
          <v-icon>mdi-home</v-icon>
        </v-list-item-action>
        <v-list-item-title>Dashboard</v-list-item-title>
      </v-list-item>
      <v-divider />
      <v-subheader>Workflows</v-subheader>
      <v-list-item
        v-for="(link, index) in viewLinks"
        :key="index+link.text"
        :to="link.to"
        active-class="primary grey--text text--darken-3"
        class="v-list-item"
      >
        <v-list-item-action>
          <v-icon>{{ link.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-title
          v-text="link.text"
        />
      </v-list-item>
      <g-scan
        :workflows="workflows"
      />
    </v-layout>
    <template v-slot:append>
      <div class="px-4 py-2 d-flex justify-center">
        <span class="grey--text text--darken-2">
            <strong v-if="environment !== 'PRODUCTION'">{{ environment }}</strong> {{ $t('App.name') }} {{ packageJson.version }}
          </span>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
// because we use `tag=v-list` and not `v-list`
// eslint-disable-next-line no-unused-vars
import { VList } from 'vuetify/lib/components/VList'
import Header from '@/components/cylc/Header'
import i18n from '@/i18n'
import { mapState } from 'vuex'
import GScan from '@/components/cylc/gscan/GScan'

export default {
  components: {
    GScan,
    'c-header': Header,
    // eslint-disable-next-line vue/no-unused-components
    'v-list': VList
  },
  data: () => ({
    links: [
      {
        to: '/',
        icon: 'mdi-view-dashboard',
        text: i18n.t('App.dashboard'),
        view: false
      }
    ],
    responsive: false
  }),
  computed: {
    ...mapState('workflows', ['workflows']),
    ...mapState(['packageJson', 'environment']),
    drawer: {
      get: function () {
        return this.$store.state.app.drawer
      },
      set: function (val) {
        this.$store.commit('app/setDrawer', val)
      }
    },
    inputValue: {
      get () {
        return this.$store.state.app.drawer
      },
      set (val) {
        this.setDrawer(val)
      }
    },
    viewLinks: function () {
      return this.isView(true)
    },
    nonViewLinks: function () {
      return this.isView(false)
    },
    items () {
      return this.$t('Layout.View.items')
    }
  },
  methods: {
    isView (bool) {
      // return links to views for true argument, non-views for false argument
      return this.links.filter(function (u) {
        return u.view === bool
      })
    }
  }
}
</script>
