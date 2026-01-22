<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<!-- Cylc UI Toolbar. Used to display the type of view in responsive mode
(narrow viewports), and to display a burger button to hide the drawer
component. Note: this is not used for the workflow view, see
./workflow/Toolbar.vue instead. -->

<template>
  <v-toolbar
    id="core-app-bar"
    absolute
    :height="toolbarHeight"
    flat
    class="c-toolbar"
  >
    <!-- TODO: duplicated in workflow/Toolbar.vue and cylc/Toolbar.vue -->
    <!-- burger button for mobile -->
    <v-btn
      icon
      @click.stop="toggleDrawer"
      id="toggle-drawer"
    >
      <v-icon>{{ $options.icons.mdiViewList }}</v-icon>
    </v-btn>
    <v-toolbar-title>
      {{ title }}
    </v-toolbar-title>
  </v-toolbar>
</template>

<script>
import { mapState } from 'vuex'
import { useDrawer, toolbarHeight } from '@/utils/toolbar'
import {
  mdiViewList,
} from '@mdi/js'

export default {
  setup () {
    const { toggleDrawer } = useDrawer()
    return { toggleDrawer, toolbarHeight }
  },

  computed: {
    ...mapState('app', ['title']),
  },

  icons: {
    mdiViewList,
  },
}
</script>
