<template>
  <div>
    <toolbar />

    <drawer />

    <v-content>
      <div id="core-view">
        <v-fade-transition mode="out-in">
          <slot/>
        </v-fade-transition>
      </div>
      <footer/>
    </v-content>
  </div>
</template>

<script>
import Toolbar from '@/components/core/Toolbar'
import Drawer from '@/components/core/Drawer'
import Footer from '@/components/core/Footer'

export default {
  name: 'Default',
  components: {
    Toolbar,
    Drawer,
    Footer
  }
}
</script>

<style scoped>

</style>
