<template>
  <v-footer
    id="core-footer"
    absolute
    height="82"
  >
    <v-spacer/>
    <span class="font-weight-light copyright">
      <strong v-if="env !== 'PRODUCTION'">{{ env }}</strong>
      {{ $t('App.name') }} {{ $store.getters.appVersion }} &copy; 2008-{{ (new Date()).getFullYear() }} {{ $t('App.footer') }}
    </span>
  </v-footer>
</template>

<script>
export default {
  data: () => ({
    links: [
      { name: 'Website', Link: 'https://cylc.github.io/', route: false },
      { name: 'About', Link: '/about', route: true }
    ],
    env: process.env.NODE_ENV.toUpperCase()
  })
}
</script>

<style>
#core-footer {
  z-index: 0;
}
</style>
