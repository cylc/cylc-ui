<template>
  <v-app>
    <core-toolbar v-if="$route.name !== 'Login'" />

    <core-drawer v-if="$route.name !== 'Login'" />

    <core-view />
  </v-app>
</template>

<style lang="scss">
@import '@/styles/index.scss';

/* Remove in 1.2 */
.v-datatable thead th.column.sortable i {
  vertical-align: unset;
}
</style>
