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
  <div
    data-cy="workspace-view"
    class="workflow-panel h-100"
  >
    <Lumino
      :key="$route.params.workflowName"
      @emptied="onEmptied"
      :workflow-name="$route.params.workflowName"
    />
  </div>
</template>

<script>
import subscriptionMixin from '@/mixins/subscription'
import ViewState from '@/model/ViewState.model'
import Lumino from '@/components/cylc/workspace/Lumino.vue'

export default {
  name: 'Workspace',

  mixins: [
    subscriptionMixin
  ],

  components: {
    Lumino,
  },

  methods: {
    onEmptied () {
      // If we have no more widgets in the view, then we are not loading, not complete, not error,
      // but back to beginning. When a widget is added, if it uses a query, then the mixins will
      // take care to set the state to LOADING and then COMPLETE (and hopefully not ERROR).
      this.viewState = ViewState.NO_STATE
    }
  },
}
</script>
