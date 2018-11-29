<template>
  <div id="app">
    <NavBar :is-menu-toggled="isMenuToggled"></NavBar>
    <div id="content">
      <router-view/>
    </div>
  </div>
</template>

<script lang="ts">
  import NavBar from '@/components/NavBar.vue';
  import 'bootstrap';
  import 'jquery';
  import {Component, Vue} from 'vue-property-decorator';

  @Component({
    components: {
      NavBar,
    },
  })

  export default class App extends Vue {

  }
</script>

<style lang="scss">
  @import '../node_modules/bootstrap/scss/bootstrap.scss';

  #app {
    display: flex;
    width: 100%;
    align-items: stretch;
  }

  #content {
    width: 100%;
    padding: 20px;
    min-height: 100vh;
    transition: all 0.3s;
  }
</style>
