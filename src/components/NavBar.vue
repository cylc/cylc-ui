<!-- Source: https://bootstrapious.com/p/bootstrap-sidebar -->
<template>
    <!-- Sidebar -->
    <nav id="sidebar" v-bind:class="{ active: isMenuToggled }">
      <div class="sidebar-header">
        <img src="../assets/logo.png" alt="Cylc Logo">
        <ul class="list-unstyled components">
          <router-link tag="li" to="/">
            <a>Home</a>
          </router-link>
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
          <li>
            <a href="#managementSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">Management</a>
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
            <router-link tag="li" to="/help">
              <a>Help</a>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    isMenuToggled: Boolean
  }
}
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
    background: #6a89cc;
    color: #fff;
    transition: all 0.3s;
  }

  #sidebar.active {
    margin-left: -250px;
  }

  #sidebar .sidebar-header {
    padding: 20px;
    background: #4a69bd;
  }

  #sidebar ul.components {
    padding: 20px 0;
    border-bottom: 1px solid #47748b;
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
    color: #7386D5;
    background: #fff;
  }

  #sidebar ul li.active>a,
  a[aria-expanded="true"] {
    color: #fff;
    background: #1e3799;
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
    background-color: #1e3799;
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
