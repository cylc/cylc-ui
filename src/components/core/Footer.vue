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
        <a
          :href="link.Link"
          class="tertiary--text footer-links">{{ link.name }}</a>
      </span>
    </div>
    <v-spacer/>
    <span class="font-weight-light copyright">
      &copy; 2008-{{ (new Date()).getFullYear() }} NIWA &amp; British Crown (Met Office) &amp; contributors
    </span>
  </v-footer>
</template>

<script>
export default {
  data: () => ({
    links: [
      { name: 'Website', Link: 'https://cylc.github.io/cylc/' },
      { name: 'About', Link: '/about' }
    ]
  })
}
</script>

<style>
#core-footer {
  z-index: 0;
}
</style>
