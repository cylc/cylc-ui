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

<template>
  <div>
    <ConnectionStatus :is-offline="offline" />
    <Drawer v-if="drawerEnabled" />
    <CommandMenu/>

    <v-main>
      <Toolbar />
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

<script setup>
import { computed, onErrorCaptured } from 'vue'
import { store } from '@/store/index'
import { Alert as AlertModel } from '@/model/Alert.model'
import Alert from '@/components/core/Alert.vue'
import Drawer from '@/components/cylc/Drawer.vue'
import Toolbar from '@/components/cylc/Toolbar.vue'
import { toolbarHeight, useDrawer } from '@/utils/toolbar'
import ConnectionStatus from '@/components/cylc/ConnectionStatus.vue'
import CommandMenu from '@/components/cylc/commandMenu/Menu.vue'

const { drawerEnabled } = useDrawer()

const coreViewStyle = {
  height: `calc(100vh - ${toolbarHeight}px)`
}

const offline = computed(() => store.state.offline)

onErrorCaptured((error, vm, info) => {
  store.dispatch('setAlert', new AlertModel(error, 'error', 'An unexpected error has occurred. You may need to refresh the page.', error.message))
  // Stop error propagating further:
  return false
})
</script>
