<template>
  <v-container
    fill-height
    fluid
    grid-list-xl>
    <v-layout
      justify-left
      wrap
    >
      <v-flex
        md6
      >
        <p>Cylc UI version: {{ $store.getters.appVersion }}</p>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  metaInfo () {
    return {
      title: 'Cylc UI | About'
    }
  }
}
</script>
