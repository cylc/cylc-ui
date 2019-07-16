<template>
  <div>
    <toolbar />

    <drawer />

    <v-content>
      <alert />
      <div id="core-view">
        <v-fade-transition mode="out-in">
          <slot/>
        </v-fade-transition>
      </div>
      <Footer/>
    </v-content>
  </div>
</template>

<script>
import Toolbar from '@/components/cylc/Toolbar'
import Alert from '@/components/core/Alert'
import Drawer from '@/components/core/Drawer'
import Footer from '@/components/core/Footer'

export default {
  name: 'Default',
  components: {
    Toolbar,
    Alert,
    Drawer,
    Footer
  }
}
</script>

<style scoped>
#core-footer {
  position: relative;
}
</style>
