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

<template>
  <v-snackbar
    :model-value="isOffline"
    :timeout=-1
    class="justify-center"
    color="red"
    location="top"
  >
    <v-icon
      size="large"
      class="mr-2"
      color="red-lighten-5"
    >{{ $options.icons.mdiLanDisconnect }}</v-icon>
    <span
      class="text-red-lighten-5 font-weight-medium"
    >Connection to server lost. You are offline.</span>
  </v-snackbar>
</template>

<script>
import { mdiLanDisconnect } from '@mdi/js'

export default {
  name: 'ConnectionStatus',

  props: {
    /**
     * Controls whether the connection status alert is visible or not.
     */
    isOffline: {
      type: Boolean,
      required: true,
    },
  },

  icons: {
    mdiLanDisconnect,
  },
}
</script>
