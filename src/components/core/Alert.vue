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
  <div v-if="alert">
    <v-alert
      :value="true"
      :type="alert.getColor()"
      :icon="alert.getIcon()"
      :class="getColor(alert.getColor())"
      dismissible
      tile
      light
      colored-border
    >
      {{ alert.getText() }}
    </v-alert>
  </div>
</template>

<script>
import {
  mapState
} from 'vuex'

export default {
  name: 'Alert',

  data () {
    return {
      // TODO: remove later when https://github.com/vuetifyjs/vuetify/issues/11021 is fixed
      colors: new Map([
        ['error', 'red'],
        ['success', 'green'],
        ['warning', 'amber']
      ])
    }
  },

  computed: {
    ...mapState(['alert'])
  },

  methods: {
    getColor (type) {
      return this.colors.get(type) || ''
    }
  }
}
</script>
