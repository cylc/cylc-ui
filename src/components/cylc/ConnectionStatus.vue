<template>
  <v-snackbar
    top
    color="red"
    class="justify-center"
    :timeout=0
    :value="offline"
  >
    <v-icon
      class="mr-2"
      color="red lighten-5"
      size="large">mdi-lan-disconnect</v-icon>
    <span
      class="red--text text--lighten-5 font-weight-medium"
    >Connection to server lost. You are offline.</span>
  </v-snackbar>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ConnectionStatus',
  computed: {
    ...mapState(['offline'])
  }
}
</script>
