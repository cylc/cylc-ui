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
  <v-icon>
    {{ getIcon() }}
  </v-icon>
</template>

<script>
import WorkflowState from '@/model/WorkflowState.model'
import { mdiHelpCircle } from '@mdi/js'

/**
 * GScan workflow icon.
 */
export default {
  name: 'WorkflowIcon',

  props: {
    status: {
      required: true,
      type: String,
    },
  },

  methods: {
    /**
     * Return the workflow icon, based on the status prop. If the state is
     * not valid, we return an unknown state icon.
     * @returns {string} icon
     */
    getIcon () {
      const state = WorkflowState.enumValues.find(({ name }) => name === this.status)
      return state?.icon || mdiHelpCircle
    },
  },
}
</script>
