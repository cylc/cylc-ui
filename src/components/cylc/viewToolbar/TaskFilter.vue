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
  <div class="group d-flex align-center">
    <v-text-field
      v-model="model.id"
      class="expandable-input"
      clearable
      :prepend-inner-icon="mdiMagnify"
      @focus="autoResizeInput"
      @blur="autoResizeInput"
      placeholder="Search     (globs supported)"
      data-cy="control-taskIDFilter"
    />
    <ViewToolbarBtn
      :active="taskStates?.length"
      :icon="mdiFilter"
      data-cy="control-taskStateFilter"
    >
      <v-menu
        activator="parent"
        :close-on-content-click="false"
      >
        <v-card>
          <v-btn
            :prepend-icon="mdiUndo"
            variant="plain"
            @click="resetTaskStates()"
            block
            spaced="end"
            :data-cy="`control-taskStateFilter-reset`"
          >
            Reset
          </v-btn>
          <v-divider></v-divider>

          <v-treeview
            :items="taskStateItems"
            v-model:activated="taskStates"
            activatable
            active-strategy="independent"
            item-value="value"
            color="blue"
            indent-lines
            density="compact"
            class="pt-0"
          >
            <!-- task icons (for task state filters -->
            <template #prepend="{ item }">
              <Task :task="item.taskProps" class="mr-2"/>
            </template>
          </v-treeview>
        </v-card>
      </v-menu>
    </ViewToolbarBtn>
  </div>
</template>

<script setup>
import { mdiFilter, mdiMagnify, mdiUndo } from '@mdi/js'
import { TaskState, WaitingStateModifierNames } from '@/model/TaskState.model'
import Task from '@/components/cylc/Task.vue'
import { computed } from 'vue'
import { taskStateItems } from '@/components/cylc/viewToolbar/util'
import ViewToolbarBtn from '@/components/cylc/viewToolbar/ViewToolbarBtn.vue'

/** @type {import('vue').Ref<{ id: string?, states: string[]? }>} */
const model = defineModel({
  type: Object,
  required: true,
})

function autoResizeInput (e) {
  // enlarge a text input when focused or containing text
  if (e.type === 'focus') {
    e.target.classList.add('expanded')
  } else {
    if (e.target.value) {
      e.target.classList.add('expanded')
    } else {
      e.target.classList.remove('expanded')
    }
  }
}

function resetTaskStates () {
  model.value.states = []
}

const taskStates = computed({
  get: () => model.value.states,
  set: (value) => {
    if (
    // if a waiting state modifier is selected
      value.some((modifier) => WaitingStateModifierNames.includes(modifier)) &&
      // but the waiting state is not
      !value.includes(TaskState.WAITING.name)
    ) {
      // then add the waiting state (i.e, don't allow the user to de-select
      // waiting whilst a modifier is in play)
      value.push(TaskState.WAITING.name)
    }
    model.value.states = value
  },
})

</script>

<style lang="scss" scoped>
// auto expand/collapse the search bar
.expandable-input {
  width: 8em;
  &:has(.expanded) {
    width: 20em;
  }
}
</style>
