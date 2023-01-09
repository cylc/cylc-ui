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
    v-if="alert"
    v-model="snackbar"
    :color="getColor(alert.color)"
    :top="true"
    timeout="-1"
    :icon="alert.icon"
  >

    <template v-slot:action="{ attrs }">
      <v-btn
        color="black"
        text
        v-bind="attrs"
        @click="closeAlert"
      >
      <v-icon>{{ svgPaths.close }}</v-icon>
      </v-btn>
    </template>
    {{ alert.text }}
  </v-snackbar>
</template>

<script>
import { mdiClose } from '@mdi/js'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Alert',

  data () {
    return {
      // TODO: remove later when https://github.com/vuetifyjs/vuetify/issues/11021 is fixed
      colors: new Map([
        ['error', 'red'],
        ['success', 'green'],
        ['warning', 'amber']
      ]),
      svgPaths: {
        close: mdiClose
      },
      snackbar: alert
    }
  },

  computed: {
    ...mapState(['alert'])
  },

  methods: {
    ...mapActions(['setAlert']),
    getColor (type) {
      return this.colors.get(type) || ''
    },
    /**
     * Dismisses the alert from the UI, also removing it from the Vuex store.
     *
     * @param {Function} toggleFunction - the original Vuetify toggle function
     * @see https://vuetifyjs.com/en/api/v-alert/
     */
    closeAlert () {
      this.snackbar = false
      this.setAlert(null)
    }
  }
}
</script>
