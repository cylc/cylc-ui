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
    v-model="alert"
    :color="getColor(alert.color)"
    location="top"
    timeout="-1"
    data-cy="alert-snack"
  >
    <template v-slot:action="{ attrs }">
      <v-btn
        icon
        v-bind="attrs"
        @click="closeAlert"
        data-cy="snack-close"
      >
        <v-icon>{{ $options.icons.mdiClose }}</v-icon>
      </v-btn>
    </template>
    {{ alert.text }}
  </v-snackbar>
</template>

<script>
import { mdiClose } from '@mdi/js'
import { mapActions, mapState } from 'vuex'

// TODO: remove later when https://github.com/vuetifyjs/vuetify/issues/11021 is fixed
const colors = new Map([
  ['error', 'red'],
  ['success', 'green'],
  ['warning', 'amber']
])

export default {
  name: 'Alert',

  computed: {
    ...mapState(['alert'])
  },

  methods: {
    ...mapActions(['setAlert']),
    getColor (type) {
      return colors.get(type) || ''
    },
    /**
     * Dismisses the alert from the UI, also removing it from the Vuex store.
     */
    closeAlert () {
      this.setAlert(null)
    }
  },

  icons: {
    mdiClose
  }
}
</script>
