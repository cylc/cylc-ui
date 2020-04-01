<template>
  <v-app>
    <component :is="layout">
      <router-view/>
    </component>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'

const DEFAULT_LAYOUT = 'empty'
const DEFAULT_URL = '/'

export default {
  props: {
    /**
     * This is the application baseUrl, given by the Python backend or by the mocked
     * offline mode.
     */
    baseUrl: {
      type: String,
      default: DEFAULT_URL
    }
  },
  computed: {
    layout () {
      return (this.$route.meta.layout || DEFAULT_LAYOUT) + '-layout'
    }
  },
  methods: {
    ...mapActions(['setBaseUrl'])
  },
  created () {
    let baseUrl = DEFAULT_URL
    if (process.env.NODE_ENV !== 'offline') {
      baseUrl = this.baseUrl !== '' ? this.baseUrl : DEFAULT_URL
    }
    this.setBaseUrl(baseUrl)
  }
}
</script>

<style lang="scss">
  @import '~@/styles/index.scss';

  /* Remove in 1.2 */
  .v-datatable thead th.column.sortable i {
    vertical-align: unset;
  }
</style>
