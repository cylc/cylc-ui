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

<!-- Controls for filtering tasks in views. -->

<template>
  <v-row no-gutters>
    <v-col
      cols="12"
      md="6"
      class="pr-md-2 mb-2 mb-md-0"
    >
      <v-text-field
        data-cy="filter-id"
        clearable
        placeholder="Filter by ID"
        v-model="model.id"
        ref="filterIDInput"
      />
    </v-col>
    <v-col
      cols="12"
      md="6"
      class="mb-2 mb-md-0"
    >
      <TaskFilterSelect
        v-model="model.states"
        type="task state"
        :items="TaskStateNames"
        data-cy="filter task state"
        placeholder="Filter by task state"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { TaskStateNames } from '@/model/TaskState.model'
import TaskFilterSelect from '@/components/cylc/TaskFilterSelect.vue'

/** @type {import('vue').Ref<{ id: string?, states: string[]? }>} */
const model = defineModel({
  type: Object,
  required: true,
})

</script>
