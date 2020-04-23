<template>
  <div v-if="alert">
    <v-alert
      :value="true"
      :color="alert.getColor()"
      :icon="alert.getIcon()"
      class="ma-0"
      dismissible
    >
      <p class="body-1">{{ alert.getText() }}</p>
    </v-alert>
  </div>
</template>

<script>
import {
  mapState
} from 'vuex'
export default {
  name: 'Alert',

  computed: {
    ...mapState(['alert'])
  }
}
</script>
