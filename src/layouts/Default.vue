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
    <ConnectionStatus :is-offline="offline" />
    <Toolbar v-if="showToolbar" />
    <Drawer v-if="showSidebar" />
    <CommandMenu/>

    <v-main>
      <alert />
      <div
        id="core-view"
        class="overflow-auto"
        :style="coreViewStyle"
      >
        <slot/>
      </div>
    </v-main>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { mapState } from 'vuex'
import { store } from '@/store/index'
import { allViews } from '@/views/views'
import { Alert as AlertModel } from '@/model/Alert.model'
import Alert from '@/components/core/Alert.vue'
import Drawer from '@/components/cylc/Drawer.vue'
import Toolbar from '@/components/cylc/Toolbar.vue'
import { useNavBtn, toolbarHeight } from '@/utils/toolbar'
import ConnectionStatus from '@/components/cylc/ConnectionStatus.vue'
import CommandMenu from '@/components/cylc/commandMenu/Menu.vue'

export default {
  name: 'Default',

  setup () {
    const route = useRoute()
    /**
     * Views that display workflows. For these views, we do not
     * want to display the default Toolbar—the Workspace view
     * has its own Toolbar that communicates with the Workflow
     * component (e.g. the Workflow Toolbar owns a button that
     * triggers the action to add a new Tree or Table View, so the events
     * are passed down from the parent Workflow View).
     */
    const workflowViews = [
      ...allViews.keys(),
      'Workspace',
    ]
    const { showNavBtn } = useNavBtn()

    /** Whether to show app toolbar (not the workspace view toolbar). */
    const showToolbar = computed(
      () => showNavBtn.value && !workflowViews.includes(route.name)
    )
    const coreViewStyle = computed(() => ({
      marginTop: showToolbar.value ? `${toolbarHeight}px` : 0,
      height: showToolbar.value ? `calc(100vh - ${toolbarHeight}px)` : '100vh',
    }))

    return {
      showToolbar,
      coreViewStyle,
    }
  },

  components: {
    ConnectionStatus,
    CommandMenu,
    Alert,
    Drawer,
    Toolbar,
  },

  props: {
    showSidebar: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  computed: {
    ...mapState(['offline']),
  },

  errorCaptured (error, vm, info) {
    if (import.meta.env.MODE !== 'production') {
      store.dispatch('setAlert', new AlertModel(error, 'error'))
    }
    // Stop error propagating further:
    return false
  },
}
</script>
