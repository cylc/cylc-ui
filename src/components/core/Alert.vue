<template>
  <div>
    <v-container v-for="alert in alerts" :key="alert.text">
      <v-alert :value="true" :color="alert.getColor()" dismissible>
        {{ alert.getText() }}
      </v-alert>
    </v-container>
  </div>
</template>

<script>
  import {
    mapGetters,
    mapState
  } from 'vuex'
  export default {
    name: "Alert",

    computed: {
      ...mapState(['alerts']),
      ...mapGetters(['alert'])
    },
  }
</script>

<style scoped>

</style>
