<!--
Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.

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

<!-- Unified Cylc UI Toolbar. Shows burger button and title on all pages.
     Shows workflow controls when a workflowName prop is provided. -->

<template>
  <v-toolbar
    id="core-app-bar"
    :height="toolbarHeight"
    flat
    class="c-toolbar"
    color="grey-lighten-4"
  >
    <!-- burger button -->
    <v-btn
      v-if="drawerEnabled"
      :icon="drawer ? icons.mdiMenuOpen : icons.mdiMenuClose"
      @click.stop="toggleDrawer"
      id="toggle-drawer"
    />
    <!-- title -->
    <v-toolbar-title
      class="c-toolbar-title font-weight-medium text-primary"
      :class="{
        'ml-0': drawerEnabled,
        'shrink': mdAndDown, // TODO: use title.length as well
      }"
    >
      {{ title }}
    </v-toolbar-title>

    <!-- control bar elements displayed only when there is a current workflow in the store -->
    <template v-if="currentWorkflow">
      <div class="c-workflow-controls d-flex align-center flex-shrink-0">
        <WarningIcon
          :workflow="currentWorkflow"
          style="font-size: 120%; padding-right: 0.3em;"
        />

        <v-defaults-provider
          :defaults="{
            VBtn: {
              size: 'small',
              density: 'comfortable',
              rounded: 'lg',
              class: 'mr-1',
            },
          }"
        >
          <v-btn
            id="workflow-mutate-button"
            v-command-menu="currentWorkflow"
            :icon="icons.mdiMicrosoftXboxControllerMenu"
          />

          <v-btn
            v-if="isStopped"
            id="workflow-play-button"
            :icon="icons.run"
            :disabled="!permissions.play"
            :loading="playRequested"
            @click="playWorkflow()"
          />

          <v-btn
            v-else
            id="workflow-play-pause-button"
            :icon="isPaused ? icons.run : icons.pause"
            :disabled="isPaused ? !permissions.resume : !permissions.pause"
            :loading="pauseOrResumeRequested"
            @click="pauseOrResumeWorkflow()"
          />
        </v-defaults-provider>

        <v-btn-group
          size="small"
          variant="outlined"
          divided
          rounded="lg"
        >
          <v-btn
            id="workflow-stop-button"
            :icon="icons.stop"
            :disabled="!permissions.stop || isStopped || isStopping"
            :loading="stopRequested"
            @click="stopWorkflow()"
          />
          <v-btn
            id="workflow-stop-dropdown-button"
            :icon="icons.mdiChevronDown"
            :disabled="!permissions.stop || isStopped"
          />
          <v-menu
            activator="#workflow-stop-dropdown-button"
            target="#workflow-stop-button"
          >
            <v-card>
              <v-list density="compact">
                <v-list-subheader>Choose stop mode</v-list-subheader>
                <v-skeleton-loader
                  v-if="!stopModes"
                  type="list-item-two-line@3"
                />
                <template v-else>
                  <v-list-item
                    v-for="mode in stopModes"
                    :key="mode.name"
                    :title="mode.name"
                    @click="stopWorkflow(mode.name)"
                  >
                    <template #append>
                      <v-tooltip
                        :activator="null"
                        location="end"
                      >
                        <template #activator="{ props }">
                          <v-icon
                            v-bind="props"
                            :icon="icons.mdiHelpCircleOutline"
                          />
                        </template>
                        <div v-markdown="mode.description"></div>
                      </v-tooltip>
                    </template>
                  </v-list-item>
                </template>
              </v-list>
              <v-divider/>
              <v-card-actions>
                <v-btn
                  :prepend-icon="icons.mdiPencil"
                  text="More options"
                  class="flex-grow-1"
                  @click="openStopDialog()"
                />
              </v-card-actions>
            </v-card>
          </v-menu>
          <CommandDialog ref="stopDialog"/>
        </v-btn-group>
      </div>

      <!-- n-window selector -->
      <v-btn
        :disabled="isStopped"
        variant="tonal"
        rounded="lg"
        size="small"
        data-cy="n-win-selector"
      >
        N={{ nWindow }}
        <template #append>
          <v-icon
            :icon="icons.mdiChevronDown"
            class="mx-n1"
          />
        </template>
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
      </v-btn>

      <!-- workflow info icon -->
      <template v-if="!isStopped">
        <v-icon
          :icon="icons.info"
          id="info-icon"
        />
        <v-tooltip
          activator="#info-icon"
          :eager="false"
        >
          <dl>
            <dt><strong>Owner:</strong> {{ currentWorkflow.node.owner }}</dt>
            <dt><strong>Host:</strong> {{ currentWorkflow.node.host }}</dt>
            <dt><strong>Cylc version:</strong> {{ currentWorkflow.node.cylcVersion }}</dt>
            <dt><strong>Run mode:</strong> {{ currentWorkflow.node.runMode }}</dt>
          </dl>
        </v-tooltip>
      </template>

      <!-- workflow status message -->
      <span class="status-msg text-body-medium">
        {{ statusMessage }}
        <span v-if="currentWorkflow.node.cylcVersion !== versionInfo['cylc-flow']">
          {{ versionPopup }}
        </span>
      </span>

    </template>

    <v-spacer class="mx-0" />

    <v-btn
      v-if="currentWorkflow && $route.name === 'Workspace'"
      class="add-view"
      color="primary"
      data-cy="add-view-btn"
    >
      <v-icon class="icon">
        {{ icons.add }}
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
            v-for="[name, view] in workflowViews"
            :id="`toolbar-add-${name}-view`"
            :key="name"
            @click="eventBus.emit('add-view', { name })"
          >
            <template #prepend>
              <v-icon>{{ view.icon }}</v-icon>
            </template>
            <v-list-item-title>{{ startCase(name) }}</v-list-item-title>
          </v-list-item>
          <v-divider/>
          <v-card-actions class="mb-n2">
            <v-btn
              @click="eventBus.emit('reset-workspace-layout')"
              :prepend-icon="icons.mdiArrowULeftTop"
              class="flex-grow-1"
              data-cy="reset-layout-btn"
            >
              Reset layout
            </v-btn>
          </v-card-actions>
        </v-list>
      </v-menu>
    </v-btn>

    <v-btn
      icon
      size="small"
      data-cy="user-avatar-btn"
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
          :icon="icons.mdiAccount"
        />
      </v-avatar>
      <v-menu activator="parent">
        <v-card :title="user.username">
          <v-card-text>
            <div class="d-flex flex-column row-gap-2">
              <v-defaults-provider
                :defaults="{
                  VBtn: { variant: 'tonal', spaced: true },
                }"
              >
                <v-btn
                  to="/user-profile"
                  :prepend-icon="icons.mdiCog"
                >
                  Settings
                </v-btn>
              </v-defaults-provider>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-btn>
  </v-toolbar>
</template>

<script>
import { computed, inject, useTemplateRef } from 'vue'
import { computedAsync } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useDisplay } from 'vuetify'
import {
  mdiCog,
  mdiMicrosoftXboxControllerMenu,
  mdiPause,
  mdiPlay,
  mdiPlusBoxMultiple,
  mdiStop,
  mdiAccount,
  mdiChevronDown,
  mdiArrowULeftTop,
  mdiInformationOutline,
  mdiMenuOpen,
  mdiMenuClose,
  mdiHelpCircleOutline,
  mdiPencil,
} from '@mdi/js'
import { startCase } from 'lodash'
import { until, useAsyncAction } from '@/utils/reactivity'
import { useDrawer, toolbarHeight } from '@/utils/toolbar'
import WorkflowState from '@/model/WorkflowState.model'
import { useGraphQL } from '@/mixins/graphql'
import {
  findByName,
  mutationStatus,
} from '@/utils/aotf'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import gql from 'graphql-tag'
import { eventBus } from '@/services/eventBus'
import { upperFirst } from 'lodash-es'
import WarningIcon from '@/components/cylc/WarningIcon.vue'
import CommandDialog from '@/components/cylc/commandMenu/CommandDialog.vue'
import { useUserService } from '@/services/user.service'
import { workflowViews } from '@/views/views'
import { vMarkdown } from '@/directives/markdown'

const QUERY = gql(`
subscription Workflow ($workflowID: ID) {
  deltas(workflows: [$workflowID]) {
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
  host
  owner
  status
  statusMsg
  nEdgeDistance
  cylcVersion
  runMode
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

  setup (props) {
    const route = useRoute()
    const store = useStore()

    const workflowService = inject('workflowService')

    const { user, versionInfo } = useUserService()

    /** Convenience object for checking user permissions */
    const permissions = Object.freeze(
      Object.fromEntries(user.permissions.map(p => [p, true]))
    )

    const { variables, workflowName, workflowID } = useGraphQL()

    const currentWorkflow = computed(
      () => workflowID.value ? store.state.workflows.cylcTree.$index[workflowID.value] : undefined
    )

    /** Show workflow name as title if we are navigated to one, otherwise the generic route title. */
    const title = computed(
      () => workflowName.value || route.meta?.title || route.name
    )

    const { mdAndDown } = useDisplay()
    const { drawer, drawerEnabled, toggleDrawer } = useDrawer()

    const isRunning = computed(
      () => currentWorkflow.value?.node?.status === WorkflowState.RUNNING.name
    )
    const isPaused = computed(
      () => currentWorkflow.value?.node?.status === WorkflowState.PAUSED.name
    )
    const isStopping = computed(
      () => currentWorkflow.value?.node?.status === WorkflowState.STOPPING.name
    )
    const isStopped = computed(
      () => !currentWorkflow.value || !(
        isRunning.value || isPaused.value || isStopping.value
      )
    )

    const [playRequested, playWorkflow] = useAsyncAction(async () => {
      const response = await workflowService.mutate('play', currentWorkflow.value.id)
      if (response[0] === mutationStatus.SUCCEEDED) {
        await until(isRunning)
      }
    })

    const [pauseOrResumeRequested, pauseOrResumeWorkflow] = useAsyncAction(async () => {
      const initiallyPaused = isPaused.value
      const { status } = await workflowService.mutate(
        initiallyPaused ? 'resume' : 'pause', currentWorkflow.value.id
      )
      if (status === mutationStatus.SUCCEEDED) {
        await until(() => initiallyPaused ? isRunning.value : isPaused.value)
      }
    })

    const [stopRequested, stopWorkflow] = useAsyncAction(async (mode) => {
      const { status } = await workflowService.mutate('stop', currentWorkflow.value.id, { mode })
      if (status === mutationStatus.SUCCEEDED) {
        await until(() => isStopping.value || isStopped.value)
      }
    })

    const stopModes = computedAsync(async () => {
      const { types } = await workflowService.getGraphQLSchema()
      return findByName(types, 'WorkflowStopMode').enumValues
    })

    const stopDialog = useTemplateRef('stopDialog')

    async function openStopDialog () {
      const { mutations } = await workflowService.getGraphQLSchema()
      const mutation = findByName(mutations, 'stop')
      stopDialog.value.open({ cylcObject: currentWorkflow.value, mutation })
    }

    return {
      user,
      permissions,
      mdAndDown,
      eventBus,
      drawer,
      drawerEnabled,
      toggleDrawer,
      toolbarHeight,
      variables,
      title,
      workflowName,
      workflowID,
      currentWorkflow,
      versionInfo,
      workflowViews,
      isPaused,
      isStopping,
      isStopped,
      playRequested,
      playWorkflow,
      pauseOrResumeRequested,
      pauseOrResumeWorkflow,
      stopWorkflow,
      stopRequested,
      stopModes,
      openStopDialog,
      icons: {
        add: mdiPlusBoxMultiple,
        pause: mdiPause,
        info: mdiInformationOutline,
        mdiMenuOpen,
        mdiMenuClose,
        mdiMicrosoftXboxControllerMenu,
        run: mdiPlay,
        stop: mdiStop,
        mdiCog,
        mdiAccount,
        mdiChevronDown,
        mdiArrowULeftTop,
        mdiHelpCircleOutline,
        mdiPencil,
      },
    }
  },

  components: {
    CommandDialog,
    WarningIcon,
  },

  directives: {
    markdown: vMarkdown,
  },

  mixins: [
    subscriptionComponentMixin,
  ],

  data: () => ({
    changingNWindow: false,
  }),

  computed: {
    query () {
      if (!this.workflowName) return null
      return new SubscriptionQuery(
        QUERY,
        this.variables,
        'workflow',
        [],
        /* isDelta */ true,
        /* isGlobalCallback */ true
      )
    },

    statusMessage () {
      return upperFirst(this.currentWorkflow?.node?.statusMsg || '')
    },
    versionPopup () {
      let ret = ''
      if (this.currentWorkflow?.node?.cylcVersion) {
        ret += ` • Cylc ${this.currentWorkflow.node.cylcVersion}`
      }
      return ret
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
    },
  },

  methods: {
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
}
</script>

<style>
.c-toolbar-title.shrink {
  font-size: 1rem;
}
</style>
