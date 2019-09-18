<template>
  <v-navigation-drawer
    id="app-drawer"
    v-model="inputValue"
    app
    persistent
    floating
    mobile-break-point="991"
    width="260"
    clipped
  >
    <v-layout
      class="fill-height"
      tag="v-list"
      column
    >
      <c-header />
      <v-list-tile
        v-if="responsive"
      >
        <v-text-field
          class="purple-input search-input"
          label="Search..."
          color="purple"
        />
      </v-list-tile>

      <v-list-tile
          to="/"
          :active-class="color"
          avatar
          class="v-list-item"
      >
        <v-list-tile-action>
          <v-icon>mdi-home</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>Dashboard</v-list-tile-title>
      </v-list-tile>
      <v-subheader>Views</v-subheader>
      <v-list-tile
        v-for="(link, index) in viewLinks"
        :key="index+link.text"
        :to="link.to"
        :active-class="color"
        avatar
        class="v-list-item"
      >
        <v-list-tile-action>
          <v-icon>{{ link.icon }}</v-icon>
        </v-list-tile-action>
        <v-list-tile-title
          v-text="link.text"
        />
      </v-list-tile>
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
// Utilities
import {
  mapMutations,
  mapState
} from 'vuex'
import Header from '@/components/cylc/Header'
import i18n from '@/i18n'

export default {
  components: {
    'c-header': Header
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
    responsive: false
  }),
  computed: {
    ...mapState('app', ['color']),
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
  mounted () {
    this.onResponsiveInverted()
    window.addEventListener('resize', this.onResponsiveInverted)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.onResponsiveInverted)
  },
  methods: {
    ...mapMutations('app', ['setDrawer', 'toggleDrawer']),
    onResponsiveInverted () {
      if (window.innerWidth < 991) {
        this.responsive = true
      } else {
        this.responsive = false
      }
    },
    isView (bool) {
      // return links to views for true argument, non-views for false argument
      return this.links.filter(function (u) {
        return u.view === bool
      })
    }
  }
}
</script>

<style lang="scss">
  @import "../../styles/material-dashboard/colors";

  #app-drawer {
    .v-list__tile {
      border-radius: 4px;
      margin-top: 5px;

      &--buy {
        margin-top: auto;
        margin-bottom: auto;
      }
    }

    .v-image__image--contain {
      top: 30px;
      bottom: 30px;
      height: 60%;
    }

    .search-input {
      margin-bottom: 30px !important;
      padding-left: 15px;
      padding-right: 15px;
    }
  }

  /* this is not in our styles/material-dashboard, so we need to force-override */
  .v-navigation-drawer {
    -webkit-box-shadow: none !important;
    box-shadow: none !important;
  }
</style>
