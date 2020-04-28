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
  <div>
    <v-app-bar
      app
      id="core-app-bar"
      dense
      flat
      class="c-toolbar"
      v-if="currentWorkflow || responsive"
    >
      <v-toolbar-title
        class="tertiary--text font-weight-light"
      >
        <!-- burger button for mobile -->
        <v-btn
          v-if="responsive"
          dark
          icon
          @click.stop="onClickBtn"
          class="default v-btn--simple"
          id="toggle-drawer"
        >
          <v-icon>mdi-view-list</v-icon>
        </v-btn>
        <!-- title -->
        <span class="c-toolbar-title">{{ title }}</span>
      </v-toolbar-title>

      <!-- control bar elements displayed only when there is a current workflow in the store -->
      <template v-if="currentWorkflow">
        <a id="workflow-release-hold-button" @click="onClickReleaseHold">
          <v-icon color="#5E5E5E" :disabled="isStopped">{{ isHeld ? 'mdi-play' : 'mdi-pause' }}</v-icon>
        </a>

        <a id="workflow-stop-button" @click="onClickStop">
          <v-icon color="#5E5E5E" :disabled="isHeld">mdi-stop</v-icon>
        </a>

        <!-- TODO: add control options and call mutations -->
        <!--
        <a>
          <v-chip color="#E7E7E7" @click="toggleExtended">{{ $t('Toolbar.control') }}</v-chip>
        </a>
        -->

        <!-- TODO: add workflow latest message -->
        <span></span>

        <v-spacer />

        <v-menu
          offset-y
          v-if="$route.name === 'workflow'"
        >
          <template v-slot:activator="{ on }">
            <a class="add-view" v-on="on">
              {{ $t('Toolbar.addView') }} <v-icon color="#5995EB">mdi-plus-circle</v-icon>
            </a>
          </template>
          <v-list class="pa-0">
            <v-list-item
              class="py-0 px-8 ma-0"
              @click="onClickAddTreeView"
            >
              <v-list-item-title><v-icon>mdi-file-tree</v-icon> Tree</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-list class="pa-0">
            <v-list-item
                class="py-0 px-8 ma-0"
                @click="onClickAddGraphView"
            >
              <v-list-item-title><v-icon>mdi-graph</v-icon> Graph</v-list-item-title>
            </v-list-item>
            <v-list-item
                class="py-0 px-8 ma-0"
                @click="onClickAddMutationsView"
            >
              <v-list-item-title><v-icon>mdi-apple-keyboard-command</v-icon> Mutations</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
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

    </v-app-bar>
  </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex'
import TaskState from '@/model/TaskState.model'
import { EventBus } from '@/components/cylc/workflow/index'

export default {
  data: () => ({
    responsive: false,
    responsiveInput: false,
    extended: false,
    // FIXME: remove local state once we have this data in the workflow - https://github.com/cylc/cylc-ui/issues/221
    isStopped: false
  }),

  computed: {
    ...mapState('app', ['title']),
    ...mapGetters('workflows', ['currentWorkflow']),
    isHeld: function () {
      return this.currentWorkflow.status === TaskState.HELD.name.toLowerCase()
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
    async onClickReleaseHold () {
      const vm = this
      if (this.isHeld) {
        // release
        await this.$workflowService.releaseWorkflow(this.currentWorkflow.id)
        vm.isStopped = false
      } else {
        // hold
        await this.$workflowService.holdWorkflow(this.currentWorkflow.id)
        vm.isStopped = false
      }
    },
    async onClickStop () {
      const vm = this
      await this.$workflowService.stopWorkflow(this.currentWorkflow.id)
      vm.isStopped = true
    },
    toggleExtended () {
      this.extended = !this.extended
    },
    onClickAddTreeView () {
      EventBus.$emit('add:tree')
    },
    onClickAddGraphView () {
      EventBus.$emit('add:graph')
    },
    onClickAddMutationsView () {
      EventBus.$emit('add:mutations')
    }
  }
}
</script>

<style>
#core-app-bar a {
  text-decoration: none;
}
</style>
