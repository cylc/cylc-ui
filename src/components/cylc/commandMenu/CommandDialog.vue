<!--
Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.

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
  <v-dialog
    v-model="visible"
    v-bind="{ width }"
    max-width="100%"
    content-class="c-mutation-dialog mx-0"
  >
    <MutationComponent
      v-if="item.mutation"
      v-model="formState"
      v-bind="{ ...item, types }"
      @cancel="close()"
      @success="closeAll()"
    >
      <template #append>
        <v-icon
          v-if="!['editRuntime', 'broadcast'].includes(item.mutation.name)"
          @click="openInTab()"
          v-tooltip="'Open in new tab'"
          data-cy="open-in-new-tab"
        >
          {{ mdiOpenInNew }}
        </v-icon>
      </template>
    </MutationComponent>
  </v-dialog>
</template>

<script setup>
import { ref, computed, shallowReactive } from 'vue'
import { eventBus } from '@/services/eventBus'
import MutationComponent from '@/components/cylc/Mutation.vue'
import { useRouter } from 'vue-router'
import { mdiOpenInNew } from '@mdi/js'
import { cloneDeep } from 'lodash-es'

const router = useRouter()

const emit = defineEmits(['closeMenu'])

const props = defineProps({
  types: {
    type: Array,
  },
})

/** @type {import('vue').ShallowReactive<{ cylcObject: any, mutation: any }>} */
const item = shallowReactive({})

/** User-inputted state of the form. */
const formState = ref()

const width = computed(
  () => item.mutation?.name === 'editRuntime' ? '1200px' : '700px'
)

const visible = ref(false)

/**
 * Open the dialog with new data.
 *
 * Note this exposed function is how new data is passed in, rather than via props.
 * This avoids the need for a parent component to manage refs representing the mutation and form state.
 *
 * @param {{ cylcObject: any, mutation: any }} newItem
 */
function open (newItem) {
  formState.value = undefined
  Object.assign(item, newItem)
  visible.value = true
}

function close () {
  visible.value = false
}

function closeAll () {
  close()
  emit('closeMenu')
}

async function openInTab () {
  const data = cloneDeep(formState.value)
  closeAll()
  // Navigate to the corresponding workflow then open the log view
  // (no nav occurs if already on the correct workflow page)
  await router.push({
    name: 'Workspace',
    params: {
      workflowName: item.cylcObject.tokens.workflow
    }
  })
  // open the command editor in a new tab
  eventBus.emit(
    'add-view',
    {
      name: 'Command',
      initialOptions: {
        data,
        ...item,
        types: props.types,
      }
    }
  )
}

defineExpose({
  open,
})
</script>
