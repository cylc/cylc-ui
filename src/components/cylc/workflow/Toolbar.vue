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
  <v-app-bar
    app
    id="core-app-bar"
    dense
    flat
    class="c-toolbar"
  >
    <!-- TODO: duplicated in workflow/Toolbar.vue and cylc/Toolbar.vue -->
    <!-- burger button for mobile -->
    <v-btn
      v-if="responsive"
      dark
      icon
      @click.stop="onClickBtn"
      class="default v-btn--simple"
      id="toggle-drawer"
    >
      <v-icon>{{ svgPaths.list }}</v-icon>
    </v-btn>
    <!-- title -->
    <v-toolbar-title
      class="tertiary--text font-weight-light"
    >
      <span class="c-toolbar-title">{{ title }}</span>
    </v-toolbar-title>

    <!-- control bar elements displayed only when there is a current workflow in the store -->
    <template v-if="currentWorkflow">
      <a
        id="workflow-release-hold-button"
        @click="onClickReleaseHold">
        <v-icon color="#5E5E5E" :disabled="isStopped">{{ isHeld ? svgPaths.run : svgPaths.hold }}</v-icon>
      </a>

      <a
        id="workflow-stop-button"
        @click="onClickStop">
        <v-icon color="#5E5E5E" :disabled="isHeld">{{ svgPaths.stop }}</v-icon>
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
            {{ $t('Toolbar.addView') }} <v-icon color="#5995EB">{{ svgPaths.add }}</v-icon>
          </a>
        </template>
        <v-list class="pa-0">
          <v-list-item
            class="py-0 px-8 ma-0"
            @click="$listeners['add-tree']"
            id="toolbar-add-tree-view"
          >
            <v-list-item-title><v-icon>{{ svgPaths.tree }}</v-icon> Tree</v-list-item-title>
          </v-list-item>
          <v-list-item
            class="py-0 px-8 ma-0"
            @click="$listeners['add-mutations']"
            id="toolbar-add-mutations-view"
          >
            <v-list-item-title><v-icon>{{ svgPaths.mutations }}</v-icon> Mutations</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <!-- displayed only when extended===true -->
    <template v-slot:extension v-if="extended">
      <span style="margin-left: 260px;">
        <a @click="onClickPause">
          <v-icon color="#5E5E5E">{{ svgPaths.hold }}</v-icon>
        </a>

        <a @click="onClickStop">
          <v-icon color="#5E5E5E">{{ svgPaths.stop }}</v-icon>
        </a>

        <span>Other controls added in the future</span>
      </span>
    </template>
  </v-app-bar>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import toolbar from '@/mixins/toolbar'
import {
  mdiViewList,
  mdiPlay,
  mdiPause,
  mdiStop,
  mdiPlusCircle,
  mdiFileTree,
  mdiAppleKeyboardCommand
} from '@mdi/js'

export default {
  name: 'Toolbar',

  mixins: [
    toolbar
  ],

  data: () => ({
    extended: false,
    // FIXME: remove local state once we have this data in the workflow - https://github.com/cylc/cylc-ui/issues/221
    isStopped: false,
    svgPaths: {
      list: mdiViewList,
      hold: mdiPause,
      run: mdiPlay,
      stop: mdiStop,
      tree: mdiFileTree,
      mutations: mdiAppleKeyboardCommand,
      add: mdiPlusCircle
    }
  }),

  computed: {
    ...mapState('app', ['title']),
    ...mapGetters('workflows', ['currentWorkflow']),
    isHeld: function () {
      return this.currentWorkflow.status === 'held'
    }
  },

  methods: {
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
    }
  }
}
</script>
