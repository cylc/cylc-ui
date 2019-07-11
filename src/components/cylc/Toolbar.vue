<template>
  <v-toolbar
    flat
    dense
    class="c-toolbar"
  >
    <div class="v-toolbar-title">
      <v-toolbar-title
        class="tertiary--text font-weight-light"
      >
        <!-- burger button for mobile -->
        <v-btn
          v-if="responsive"
          class="default v-btn--simple"
          dark
          icon
          @click.stop="onClickBtn"
        >
          <v-icon>mdi-view-list</v-icon>
        </v-btn>
        <!-- title -->
        <span class="c-toolbar-title">{{ title }}</span>
      </v-toolbar-title>
    </div>

    <!-- control bar elements displayed only when a suite has been positioned -->
    <template v-if="tree && tree.length > 0">
      <a @click="onClickPause">
        <v-icon color="#5E5E5E">mdi-pause</v-icon>
      </a>

      <a @click="onClickStop">
        <v-icon color="#5E5E5E">mdi-stop</v-icon>
      </a>

      <a>
        <v-chip color="#E7E7E7" @click="toggleExtended">Control</v-chip>
      </a>

      <span>Running, will stop at 30000101T0000 cycle</span>

      <v-spacer />

      <a class="add-view" @click="onClickAddView">
        Add View <v-icon color="#5995EB">mdi-plus-circle</v-icon>
      </a>
    </template>

    <!-- displayed only when extended===true -->
    <template v-slot:extension v-if="extended">
      <span style="margin-left: 260px;">
        <a @click="onClickPause">
          <v-icon color="#5E5E5E">mdi-pause</v-icon>
        </a>

        <a @click="onClickStop">
          <v-icon color="#5E5E5E">mdi-stop</v-icon>
        </a>

        <span>Other controls added in the future</span>
      </span>
    </template>

  </v-toolbar>
</template>

<script>

  import { mapMutations, mapState } from 'vuex'

  export default {
  data: () => ({
    responsive: false,
    responsiveInput: false,
    extended: false
  }),

  computed: {
    ...mapState('app', ['title']),
    ...mapState('suites', ['tree'])
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
    onClickBtn () {
      this.setDrawer(!this.$store.state.app.drawer)
    },
    onResponsiveInverted () {
      if (window.innerWidth < 991) {
        this.responsive = true
        this.responsiveInput = false
      } else {
        this.responsive = false
        this.responsiveInput = true
      }
    },
    onClickPause () {
      console.log("Pausing workflows has not been implemented yet")
    },
    onClickStop () {
      console.log("Stopping workflows has not been implemented yet")
    },
    toggleExtended () {
      this.extended = !this.extended
    },
    onClickAddView () {
      console.log("Adding views has not been implemented yet")
    }
  }
}
</script>

<style lang="scss">
  .v-toolbar {
    min-height: inherit !important;
    .v-toolbar__content {
      min-height: inherit !important;
    }
  }

  .c-toolbar {
    background-color: #E7E7E7;
    border-bottom: 3px solid #ccc;

    .c-toolbar-title, .add-view {
      font-size: 22px;
      color: #5995EB;
      font-weight: 500;
    }

    .c-toolbar-title {
      padding-right: 13px;
    }

    span {
      color: #7D878F;
    }

    .add-view {
    }
  }
</style>
