<template>
  <v-container
    fill-height
    fluid
    grid-list-xl
  >
  </v-container>
</template>

<script>
import { mixin } from '@/mixins/index'

export default {
  mixins: [mixin],
  metaInfo () {
    return {
      title: this.getPageTitle('App.dashboard')
    }
  }
}
</script>
