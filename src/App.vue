<template>
  <div id="app">
    <NavBar :is-menu-toggled="isMenuToggled"></NavBar>
    <div id="content">
      <!--
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
          <button type="button" id="sidebarCollapse" class="btn btn-info" v-on:click="toggleSidebar">
            <i class="fas fa-align-left"></i>
            <span>Toggle Sidebar</span>
          </button>
          <button type="button" id="sidebarCollapse" class="btn btn-info">
            <i class="fas fa-align-left"></i>
            <span>Toggle Sidebar</span>
          </button>
          <button class="btn btn-dark d-inline-block d-lg-none ml-auto" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <i class="fas fa-align-justify"></i>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="nav navbar-nav ml-auto">
              <li class="nav-item active">
                <a class="nav-link" href="#">Page</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Page</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Page</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Page</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      -->
      <router-view/>
    </div>
  </div>
</template>

<script>
import 'jquery'
import 'bootstrap'
import NavBar from './components/NavBar'

export default {
  name: 'App',
  components: {
    NavBar
  },
  data () {
    return {
      'isMenuToggled': false
    }
  },
  methods: {
    toggleSidebar () {
      this.isMenuToggled = !this.isMenuToggled
    }
  }
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
