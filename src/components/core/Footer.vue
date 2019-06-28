<template>
  <v-footer
    id="core-footer"
    absolute
    height="82"
  >
    <div class="footer-items">
      <span
        v-for="link in links"
        :key="link.name"
      >
        <template
          v-if="link.route">
          <router-link
            :to="link.Link"
            class="tertiary--text footer-links">About</router-link>
        </template>
        <template
          v-else>
          <a
            :href="link.Link"
            class="tertiary--text footer-links">{{ link.name }}</a>
        </template>
      </span>
    </div>
    <v-spacer/>
    <span class="font-weight-light copyright">
      <strong v-if="env !== 'PRODUCTION'">{{ env }}</strong>
      Cylc UI {{ $store.getters.appVersion }} &copy; 2008-{{ (new Date()).getFullYear() }} NIWA &amp; British Crown (Met Office) &amp; contributors
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
