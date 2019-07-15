<template>
  <v-list-tile-action-text class="pt-3 pb-3 c-header">
    <v-layout align-center justify-center row wrap fill-height>
      <div class="mb-2">
        <v-img :src="logo" width="220" />
      </div>
      <div class="c-environment-info">
        <v-chip outline color="grey lighten-1" text-color="grey darken-4">{{ user }}</v-chip>
        <span class="at">@</span>
        <v-chip outline color="grey lighten-1" text-color="grey darken-4">{{ environment }}</v-chip>
      </div>
    </v-layout>
  </v-list-tile-action-text>
</template>

<script>
export default {
  name: 'Header',
  props: {
    user: {
      type: String,
      default: 'guest'
    },
    environment: {
      type: String,
      default: 'development'
    }
  },
  data: () => ({
    logo: './img/logo.png'
  })
}
</script>
