<template>
  <v-app>
    <component :is="layout">
      <router-view/>
    </component>
  </v-app>
</template>

<script>
import { UserService } from 'user-service'

const defaultLayout = 'empty'

export default {
  computed: {
    layout () {
      return (this.$route.meta.layout || defaultLayout) + '-layout'
    }
  },
  mounted () {
    // Global values created when the application is mounted, such as global application settings, and
    // the user object. Values are set in Vuex stores to be accessed by other components.
    UserService.fetchSettings()
    UserService.getUserProfile()
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
