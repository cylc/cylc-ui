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
      <v-icon>{{ $options.icons.list }}</v-icon>
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
          v-command-menu="currentWorkflow"
          :icon="$options.icons.menu"
          size="small"
          density="comfortable"
        />

        <v-btn
          id="workflow-play-button"
          :icon="$options.icons.run"
          :disabled="!enabled.playToggle"
          v-if="!isRunning"
          @click="onClickPlay"
          size="small"
          density="comfortable"
        />

        <v-btn
          id="workflow-play-pause-button"
          :icon="isPaused ? $options.icons.run : $options.icons.hold"
          :disabled="!enabled.pauseToggle"
          v-if="isRunning"
          @click="onClickReleaseHold"
          size="small"
          density="comfortable"
        />

        <v-btn
          id="workflow-stop-button"
          :icon="$options.icons.stop"
          :disabled="!enabled.stopToggle"
          @click="onClickStop"
          size="small"
          density="comfortable"
        />
      </div>

      <!-- n-window selector -->
      <v-chip
        :disabled="isStopped"
        link
        size="small"
        data-cy="n-win-selector"
      >
        N={{ nWindow }}
        <v-menu
          activator="parent"
          :close-on-content-click="false"
          max-width="400"
          data-cy="n-win-popup"
        >
          <v-card title="Graph Window Depth">
            <v-card-text>
              This changes the number of tasks which are displayed.

              Higher values may impact performance.
            </v-card-text>
            <v-card-text>
              <v-select
                v-model="nWindow"
                :items="[0,1,2,3]"
                :disabled="!user.permissions?.includes('setGraphWindowExtent')"
              >
                <template #append-inner>
                  <v-progress-circular
                    v-if="changingNWindow"
                    indeterminate
                    size="20"
                    width="2"
                  />
                </template>
              </v-select>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-chip>

      <!-- workflow status message -->
      <span class="status-msg text-md-body-1 text-body-2">
        {{ statusMsg }}
      </span>

      <v-spacer class="mx-0" />

      <v-btn
        v-if="$route.name === 'Workspace'"
        class="add-view"
        color="primary"
        data-cy="add-view-btn"
      >
        <v-icon class="icon">
          {{ $options.icons.add }}
        </v-icon>
        <span class="label">
          {{ $t('Toolbar.addView') }}
        </span>

        <v-menu
          activator="parent"
          location="bottom"
        >
          <v-list>
            <v-list-item
              v-for="[name, view] in views"
              :id="`toolbar-add-${name}-view`"
              :key="name"
              @click="eventBus.emit('add-view', { name })"
            >
              <template #prepend>
                <v-icon>{{ view.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ startCase(name) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
      <v-btn
        icon
        size="small"
      >
        <v-avatar
          color="primary"
          size="small"
        >
          <div v-if="user.initials">
            {{ user.initials }}
          </div>
          <v-icon
            v-else
            :icon="$options.icons.mdiAccount"
          />
        </v-avatar>
        <v-menu activator="parent">
          <v-card :title="user.username">
            <v-card-text>
              <v-btn
                to="/user-profile"
                variant="tonal"
                :prepend-icon="$options.icons.mdiCog"
              >
                Settings
              </v-btn>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-btn>
    </template>
  </v-toolbar>
</template>

<script>
import { mapState } from 'vuex'
import {
  mdiCog,
  mdiMicrosoftXboxControllerMenu,
  mdiPause,
  mdiPlay,
  mdiPlusBoxMultiple,
  mdiStop,
  mdiViewList,
  mdiAccount
} from '@mdi/js'
import { startCase } from 'lodash'
import { until } from '@/utils/reactivity'
import { useDrawer, useNavBtn, toolbarHeight } from '@/utils/toolbar'
import WorkflowState from '@/model/WorkflowState.model'
import graphql from '@/mixins/graphql'
import {
  mutationStatus
} from '@/utils/aotf'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import gql from 'graphql-tag'
import { eventBus } from '@/services/eventBus'

const QUERY = gql(`
subscription Workflow ($workflowId: ID) {
  deltas(workflows: [$workflowId]) {
    added {
      ...AddedDelta
    }
    updated (stripNull: true) {
      ...UpdatedDelta
    }
    pruned {
      ...PrunedDelta
    }
  }
}

fragment WorkflowData on Workflow {
  id
  status
  statusMsg
  nEdgeDistance
}

fragment AddedDelta on Added {
  workflow {
    ...WorkflowData
  }
}

fragment UpdatedDelta on Updated {
  workflow {
    ...WorkflowData
  }
}

fragment PrunedDelta on Pruned {
  workflow
}
`)

export default {
  name: 'Toolbar',

  setup () {
    const { showNavBtn } = useNavBtn()
    const { toggleDrawer } = useDrawer()
    return {
      eventBus,
      showNavBtn,
      toggleDrawer,
      toolbarHeight
    }
  },

  mixins: [
    graphql,
    subscriptionComponentMixin
  ],

  props: {
    /**
     * All possible view component classes that can be rendered
     *
     * @type {Map<string, import('@/views/views.js').CylcView>}
     */
    views: {
      type: Map,
      required: true
    }
  },

  data: () => ({
    expecting: {
      // store state from mutations in order to compute the "enabled" attrs
      play: null,
      paused: null,
      stop: null
    },
    changingNWindow: false,
  }),

  computed: {
    ...mapState('app', ['title']),
    ...mapState('user', ['user']),
    ...mapState('workflows', ['cylcTree']),
    query () {
      return new SubscriptionQuery(
        QUERY,
        this.variables,
        'workflow',
        [],
        /* isDelta */ true,
        /* isGlobalCallback */ true
      )
    },
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
    },
    nWindow: {
      get () {
        // the graph window distance reported by the scheduler
        return this.currentWorkflow?.node?.nEdgeDistance ?? 1
      },
      async set (val) {
        if (val == null || this.isStopped) return

        this.changingNWindow = true
        if (await this.setGraphWindow(val)) {
          await until(() => this.currentWorkflow?.node?.nEdgeDistance === val)
        }
        this.changingNWindow = false
      },
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
    },
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
    async setGraphWindow (nWindow) {
      const { status } = await this.$workflowService.mutate(
        'setGraphWindowExtent',
        this.currentWorkflow.id,
        { nEdgeDistance: nWindow }
      )
      return status === mutationStatus.SUCCEEDED
    },
    startCase,
  },

  icons: {
    add: mdiPlusBoxMultiple,
    hold: mdiPause,
    list: mdiViewList,
    menu: mdiMicrosoftXboxControllerMenu,
    run: mdiPlay,
    stop: mdiStop,
    mdiCog,
    mdiAccount
  },
}
</script>
