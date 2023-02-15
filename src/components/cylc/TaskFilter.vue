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
        :clear-icon="$options.icons.mdiClose"
        density="compact"
        hide-details
        variant="outlined"
        placeholder="Filter by ID"
        v-model="localValue.id"
        ref="filterIDInput"
      />
    </v-col>
    <v-col
      cols="12"
      md="6"
      class="mb-2 mb-md-0"
    >
      <v-select
        data-cy="filter-task-states"
        :items="allStates"
        clearable
        :clear-icon="$options.icons.mdiClose"
        density="compact"
        hide-details
        multiple
        variant="outlined"
        placeholder="Filter by task state"
        v-model="localValue.states"
      >
        <template v-slot:item="{ item, props }">
          <v-list-item v-bind="props" :title="undefined">
            <Task :task="{ state: item.raw }" />
            <span class="ml-2">{{ item.raw }}</span>
          </v-list-item>
        </template>
        <template v-slot:selection="{ item, index }">
          <div class="mr-2" v-if="index >= 0 && index < maxVisibleStates">
            <Task :task="{ state: item.raw }" />
          </div>
          <span
            v-if="index === maxVisibleStates"
            class="text-grey text-caption"
          >
            (+{{ localValue.states.length - maxVisibleStates }})
          </span>
        </template>
      </v-select>
    </v-col>
  </v-row>
</template>

<script>
import Task from '@/components/cylc/Task'
import { TaskStateUserOrder } from '@/model/TaskState.model'
import { mdiClose } from '@mdi/js'

export default {
  name: 'TaskFilter',
  components: {
    Task
  },
  props: {
    modelValue: Object // { id, states }
  },
  data () {
    return {
      maxVisibleStates: 4,
      allStates: TaskStateUserOrder.map(ts => ts.name)
    }
  },
  computed: {
    localValue: {
      get () {
        return this.modelValue
      },
      set (value) {
        // Update 'modelValue' prop by notifying parent component's v-model for this component
        this.$emit('update:modelValue', value)
      }
    }
  },
  // Misc options
  icons: {
    mdiClose
  }
}
</script>
