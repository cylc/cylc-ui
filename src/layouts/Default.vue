<template>
  <div>
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
import Alert from '@/components/core/Alert'
import Drawer from '@/components/cylc/Drawer'
import Footer from '@/components/core/Footer'

export default {
  name: 'Default',
  components: {
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
