<template>
  <div>
    <v-alert
      :value="true"
      :color="alert.getColor()"
      :icon="alert.getIcon()"
      class="ma-0"
      dismissible
    >
      {{ alert.getText() }}
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
