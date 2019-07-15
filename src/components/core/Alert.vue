<template>
  <div>
    <v-container v-if="alert !== null" :key="alert.text">
      <v-alert :value="true" :color="alert.getColor()" :icon="alert.getIcon()" dismissible>
        {{ alert.getText() }}
      </v-alert>
    </v-container>
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
