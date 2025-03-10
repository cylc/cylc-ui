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

<template class="c-jupyter-launcher">
  <v-chip
    variant="outlined"
    class="flex-shrink-0"
    @click="open"
    v-if="user.extensions?.lab"
  >
    <v-icon style="margin-right: 0.5em">{{ $options.icons.jupyterLogo }}</v-icon>
    Open in Jupyter Lab
  </v-chip>
</template>

<script>
import axios from 'axios'
import { store } from '@/store/index'
import { Alert as AlertModel } from '@/model/Alert.model'
import { mapState } from 'vuex'
import { createUrl, getCylcHeaders } from '@/utils/urls'
import { jupyterLogo } from '@/utils/icons'

const LAB_ENDPOINT = 'lab-bridge/open/'

export default {
  name: 'JupyterLauncher',

  components: {},

  props: {
    path: {
      type: String,
      required: true,
    }
  },

  icons: {
    jupyterLogo,
  },

  computed: {
    ...mapState('user', ['user']),

    openInExistingSession () {
      return `${LAB_ENDPOINT}/${this.path}`
    },

    openInNewSession () {
      // TODO: Strip $HOME from the path and add it onto the URL like so:
      // return `${this.user.extensions?.lab}/tree/${this.path}`
      return this.user.extensions?.lab
    }
  },

  methods: {
    async open () {
      await axios.get(
        createUrl(this.openInExistingSession),
        { headers: getCylcHeaders() }
      )
      store.dispatch(
        'setAlert',
        new AlertModel(
          // `Opened file in any existing Lab session\n\n[Open a new Jupyter Lab session!](${this.openInNewSession}){:target="_blank"}`,
          'Sent request to open file in any active Jupyter Lab sessions.',
          'success',
          (
            'Sent request to open file in any active Jupyter Lab sessions.' +
            '<br /><br />' +
            `<a href="${this.openInNewSession}" target="_blank">Open a new Jupyter Lab session</a>`
          ),
          4000,
        )
      )
    },
  },
}
</script>
