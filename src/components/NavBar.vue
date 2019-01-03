<!-- Source: https://bootstrapious.com/p/bootstrap-sidebar -->
<template>
  <!-- Sidebar -->
  <nav id="sidebar" v-bind:class="{ active: isMenuToggled }">
    <div class="sidebar-header">
      <img src="../assets/logo.png" alt="Cylc Logo" width="150px">
      <ul class="list-unstyled components">
        <router-link tag="li" to="/">
          <a>Home</a>
        </router-link>
      </ul>
      <ul class="list-unstyled components">
        <li>
          <a href="#homeSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">Suites</a>
          <ul class="collapse list-unstyled" id="homeSubmenu">
            <li>
              <a href="#">
                Running
              </a>
            </li>
            <li>
              <a href="#">
                Stalled
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#">
            Jobs
          </a>
        </li>
      </ul>
      <ul class="list-unstyled components">
        <li>
          <a href="#managementSubmenu" data-toggle="collapse" aria-expanded="false"
             class="dropdown-toggle">Management</a>
          <ul class="collapse list-unstyled" id="managementSubmenu">
            <li>
              <a href="#">
                Users
              </a>
            </li>
            <li>
              <a href="#">
                Logs
              </a>
            </li>
          </ul>
        </li>
        <li>
          <router-link tag="li" to="/about">
            <a>About</a>
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
class NavBar extends Vue {
  /**
   * Define whether the navigation bar menu is toggled or not. Defaults to false.
   */
  isMenuToggled: boolean = false;
}

export default NavBar
</script>

<style scoped>
  a, a:hover, a:focus {
    color: inherit;
    text-decoration: none;
    transition: all 0.3s;
  }

  #sidebar {
    min-width: 250px;
    max-width: 250px;
    background: #393939;
    color: #fff;
    transition: all 0.3s;
  }

  #sidebar.active {
    margin-left: -250px;
  }

  #sidebar .sidebar-header {
    padding: 20px;
    background: #333333;
  }

  #sidebar ul.components {
    padding: 0 0 10px 0;
    border-bottom: 1px solid #555555;
  }

  #sidebar ul p {
    color: #fff;
    padding: 10px;
  }

  #sidebar ul li a {
    padding: 10px;
    font-size: 1.1em;
    display: block;
  }

  #sidebar ul li a:hover {
    color: #EEEEEE;
    background: #888888;
  }

  #sidebar ul li.active > a,
  a[aria-expanded="true"] {
    color: #fff;
    background: #393939;
  }

  a[data-toggle="collapse"] {
    position: relative;
  }

  .dropdown-toggle::after {
    display: block;
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  /* ---------------------------------------------------
    MEDIAQUERIES
  ----------------------------------------------------- */

  @media (max-width: 768px) {
    #sidebar {
      margin-left: -250px;
    }

    #sidebar.active {
      margin-left: 0;
    }

    #sidebarCollapse span {
      display: none;
    }
  }

  ul ul a {
    font-size: 0.9em !important;
    padding-left: 30px !important;
    background-color: #393939;
  }

  ul.CTAs {
    padding: 20px;
  }

  ul.CTAs a {
    text-align: center;
    font-size: 0.9em !important;
    display: block;
    border-radius: 5px;
    margin-bottom: 5px;
  }
</style>
