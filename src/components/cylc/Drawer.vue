<template>
  <v-navigation-drawer
    id="app-drawer"
    v-model="displayDrawer"
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
      style="padding: 0"
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
      <v-subheader>Views</v-subheader>
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
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
// Utilities
import {
  mapMutations
} from 'vuex'
// because we use `tag=v-list` and not `v-list`
// eslint-disable-next-line no-unused-vars
import { VList } from 'vuetify/lib/components/VList'
import Header from '@/components/cylc/Header'
import i18n from '@/i18n'

export default {
  components: {
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
      },
      {
        to: '/workflows',
        icon: 'mdi-vector-circle',
        text: i18n.t('App.workflows'),
        view: true
      }
    ],
    responsive: false,
    displayDrawer: true
  }),
  computed: {
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
    ...mapMutations('app', ['setDrawer', 'toggleDrawer']),
    isView (bool) {
      // return links to views for true argument, non-views for false argument
      return this.links.filter(function (u) {
        return u.view === bool
      })
    }
  }
}
</script>
