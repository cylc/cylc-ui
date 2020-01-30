<template>
  <div>
    <ConnectionStatus />
    <toolbar />
    <drawer />

    <v-content>
      <alert />
      <div id="core-view">
        <v-fade-transition mode="out-in">
          <slot/>
        </v-fade-transition>
      </div>
    </v-content>
  </div>
</template>

<script>
import Alert from '@/components/core/Alert'
import Drawer from '@/components/cylc/Drawer'
import Toolbar from '@/components/cylc/Toolbar'
import ConnectionStatus from '@/components/cylc/ConnectionStatus'

export default {
  name: 'Default',
  components: {
    ConnectionStatus,
    Alert,
    Drawer,
    Toolbar
  }
}
</script>
