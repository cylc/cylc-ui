<template>
  <v-navigation-drawer
    id="app-drawer"
    v-model="inputValue"
    app
    light
    floating
    persistent
    mobile-break-point="991"
    width="260"
    clipped
  >
    <v-layout
      class="fill-height"
      tag="v-list"
      column
    >
      <v-divider inset></v-divider>
      <v-list-tile>
          <v-img
            :src="logo"
            height="160"
            contain
          />
      </v-list-tile>
      <v-list-tile
        v-if="responsive"
      >
        <v-text-field
          class="purple-input search-input"
          label="Search..."
          color="purple"
        />
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

      <v-subheader>Other Links</v-subheader>
      <v-list-tile
        v-for="(link, index) in nonViewLinks"
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
      <!-- Add Hub route separately as it lives under root not /user/USER/ -->
      </v-list-tile>
      <v-list-tile
              href="/hub/home"
              :active-class="color"
              avatar
              class="v-list-item"
      >
        <v-list-tile-action>
          <v-icon>mdi-server-network</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>Hub</v-list-tile-title>
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

export default {
  data: () => ({
    logo: './img/logo.png',
    links: [
      {
        to: '/dashboard',
        icon: 'mdi-view-dashboard',
        text: 'Dashboard',
        view: false
      },
      {
        to: '/suites',
        icon: 'mdi-vector-circle',
        text: 'Suites',
        view: true
      },
      {
        to: '/graph',
        icon: 'mdi-vector-polyline',
        text: 'Graph',
        view: true
      },
      {
        to: '/user-profile',
        icon: 'mdi-account',
        text: 'User Profile',
        view: false
      },
      {
        to: '/login',
        icon: 'mdi-account',
        text: 'Log in',
        view: false
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
    viewLinks: function() {
       return this.isView(true)
    },
    nonViewLinks: function() {
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
    // return links to views for true argument and non-views for false argument
      if (bool) {
        return this.links.filter(function(u) {
          return u.view;
      })} else {
        return this.links.filter(function(u) {
          return !u.view;
      })}
    },
  }
}
</script>

<style lang="scss">
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
</style>
