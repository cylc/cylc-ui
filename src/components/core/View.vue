<template>
  <v-content>
    <div id="core-view">
      <v-fade-transition mode="out-in">
        <slot/>
      </v-fade-transition>
    </div>
    <core-footer/>
  </v-content>
</template>

<script>
export default {}
</script>

<style>
  #core-view {
    padding-bottom: 100px;
  }
</style>
