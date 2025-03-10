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
    :model-value="Boolean(alert)"
    :color="alert.color"
    location="top"
    timeout="-1"
    data-cy="alert-snack"
    content-class="text-pre-wrap"
  >
    <template v-slot:actions>
      <v-btn
        icon
        @click="closeAlert"
        data-cy="snack-close"
      >
        <v-icon>{{ $options.icons.mdiClose }}</v-icon>
      </v-btn>
    </template>
    <Markdown v-if="alert.text" :markdown="String(alert.text)" />
  </v-snackbar>
</template>

<script>
import { mdiClose } from '@mdi/js'
import { mapActions, mapState } from 'vuex'
import Markdown from '@/components/Markdown.vue'

export default {
  name: 'Alert',

  components: {
    Markdown,
  },

  computed: {
    ...mapState(['alert'])
  },

  watch: {
    async alert (val, old) {
      if (val && val !== old) {
        await new Promise(resolve => setTimeout(resolve, val.timeout))
        this.closeAlert()
      }
    }
  },

  methods: {
    ...mapActions(['setAlert']),
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
