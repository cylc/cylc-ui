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

<!-- Toolbar for the workspace view -->

<template>
  <v-toolbar
    id="core-app-bar"
    :height="toolbarHeight"
    flat
    class="c-toolbar"
    color="grey-lighten-4"
  >
    <!-- TODO: duplicated in workflow/Toolbar.vue and cylc/Toolbar.vue -->
    <!-- burger button for mobile -->
    <v-btn
      v-if="showNavBtn"
      icon
      @click.stop="toggleDrawer"
      id="toggle-drawer"
    >
      <v-icon>{{ svgPaths.list }}</v-icon>
    </v-btn>
    <!-- title -->
    <v-toolbar-title
      class="c-toolbar-title text-md-h6 text-subtitle-1 font-weight-medium text-primary"
      :class="showNavBtn ? 'ml-0' : null"
    >
      {{ title }}
    </v-toolbar-title>

    <!-- control bar elements displayed only when there is a current workflow in the store -->
    <template v-if="currentWorkflow">
      <div class="c-workflow-controls flex-shrink-0">
        <v-btn
          id="workflow-mutate-button"
          v-cylc-object="currentWorkflow"
          :icon="svgPaths.menu"
          size="small"
        />

        <v-btn
          id="workflow-play-button"
          :icon="svgPaths.run"
          :disabled="!enabled.playToggle"
          v-if="!isRunning"
          @click="onClickPlay"
          size="small"
        />

        <v-btn
          id="workflow-play-pause-button"
          :icon="isPaused ? svgPaths.run : svgPaths.hold"
          :disabled="!enabled.pauseToggle"
          v-if="isRunning"
          @click="onClickReleaseHold"
          size="small"
        />

        <v-btn
          id="workflow-stop-button"
          :icon="svgPaths.stop"
          :disabled="!enabled.stopToggle"
          @click="onClickStop"
          size="small"
        />
      </div>

      <!-- workflow status message -->
      <span class="status-msg text-md-body-1 text-body-2">
        {{ statusMsg }}
      </span>

      <v-spacer class="mx-0" />

      <v-btn
        v-if="$route.name === 'workspace'"
        class="add-view"
        color="primary"
        data-cy="add-view-btn"
      >
        <v-icon class="icon">{{ svgPaths.add }}</v-icon>
        <span class="label">
          {{ $t('Toolbar.addView') }}
        </span>

        <v-menu
          activator="parent"
          location="bottom"
          >
          <v-list>
            <v-list-item
              v-for="view in views"
              :id="`toolbar-add-${ view.name }-view`"
              :key="view.name"
              @click="$emit('add', { viewName: view.name })"
            >
              <template v-slot:prepend>
                <v-icon>{{ view.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ startCase(view.name) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
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
  </v-toolbar>
</template>

<script>
import { mapState } from 'vuex'
import {
  mdiMicrosoftXboxControllerMenu,
  mdiPause,
  mdiPlay,
  mdiPlusBoxMultiple,
  mdiStop,
  mdiViewList
} from '@mdi/js'
import { startCase } from 'lodash'
import { useToolbar, toolbarHeight } from '@/utils/toolbar'
import WorkflowState from '@/model/WorkflowState.model'
import graphql from '@/mixins/graphql'
import {
  mutationStatus
} from '@/utils/aotf'

export default {
  name: 'Toolbar',

  setup () {
    const { showNavBtn, toggleDrawer } = useToolbar()
    return { showNavBtn, toggleDrawer, toolbarHeight }
  },

  mixins: [
    graphql
  ],

  props: {
    views: {
      type: Array,
      required: true
    }
  },

  emits: ['add'],

  data: () => ({
    extended: false,
    svgPaths: {
      add: mdiPlusBoxMultiple,
      hold: mdiPause,
      list: mdiViewList,
      menu: mdiMicrosoftXboxControllerMenu,
      run: mdiPlay,
      stop: mdiStop
    },
    expecting: {
      // store state from mutations in order to compute the "enabled" attrs
      play: null,
      paused: null,
      stop: null
    }
  }),

  computed: {
    ...mapState('app', ['title']),
    ...mapState('user', ['user']),
    ...mapState('workflows', ['cylcTree']),
    currentWorkflow () {
      return this.cylcTree.$index[this.workflowId]
    },
    isRunning () {
      return (
        this.currentWorkflow &&
        (
          this.currentWorkflow.node.status === WorkflowState.RUNNING.name ||
          this.currentWorkflow.node.status === WorkflowState.PAUSED.name ||
          this.currentWorkflow.node.status === WorkflowState.STOPPING.name
        )
      )
    },
    isPaused () {
      return (
        this.currentWorkflow &&
        this.currentWorkflow.node.status === WorkflowState.PAUSED.name
      )
    },
    isStopped () {
      return (
        !this.currentWorkflow ||
        this.currentWorkflow.node.status === WorkflowState.STOPPED.name
      )
    },
    statusMsg () {
      return this.currentWorkflow.node.statusMsg || ''
    },
    enabled () {
      // object holding the states of controls that are supposed to be enabled
      // NOTE: this is a temporary solution until we are able to subscribe to
      // mutations to tell when they have completed
      return {
        playToggle: (
          // the play button (for the play from stopped scenario)
          this.isStopped &&
          (
            this.expecting.play === null ||
            this.expecting.play === this.isRunning
          )
        ),
        pauseToggle: (
          // the play/pause button
          !this.isStopped &&
          !this.expecting.stop &&
          this.currentWorkflow.node.status !== WorkflowState.STOPPING.name &&
          (
            this.expecting.paused === null ||
            this.expecting.paused === this.isPaused
          )
        ),
        stopToggle: (
          // the stop button
          !this.isStopped &&
          (
            this.expecting.stop === null ||
            this.expecting.stop === this.isStopped
          )
        )
      }
    }
  },

  watch: {
    isRunning () {
      this.expecting.play = null
    },
    isPaused () {
      this.expecting.paused = null
    },
    isStopped () {
      this.expecting.stop = null
    }
  },

  methods: {
    onClickPlay () {
      this.$workflowService.mutate(
        'play',
        this.currentWorkflow.id
      ).then(ret => {
        if (ret[0] === mutationStatus.SUCCEEDED) {
          this.expecting.play = !this.isRunning
        }
      })
    },
    onClickReleaseHold () {
      this.$workflowService.mutate(
        this.isPaused ? 'resume' : 'pause',
        this.currentWorkflow.id
      ).then(response => {
        if (response.status === mutationStatus.SUCCEEDED) {
          this.expecting.paused = !this.isPaused
        }
      })
    },
    onClickStop () {
      this.$workflowService.mutate(
        'stop',
        this.currentWorkflow.id
      ).then(response => {
        if (response.status === mutationStatus.SUCCEEDED) {
          this.expecting.stop = WorkflowState.STOPPING
        }
      })
    },
    toggleExtended () {
      this.extended = !this.extended
    },
    startCase,
  }
}
</script>
