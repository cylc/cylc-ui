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

<!-- Command/mutation view displayed in a workspace tab -->

<template>
  <MutationComponent
    v-bind="{ ...$attrs, mutation, cylcObject, types }"
    v-model="data"
    @success="showSuccessSnack = true"
  />
  <v-snackbar
    v-model="showSuccessSnack"
    :text="`Command succeeded: ${mutation._title}`"
    :prepend-icon="mdiCheck"
    color="green"
    location="top"
    :timeout="2e3"
  />
</template>

<script setup>
import { onMounted, toRefs, ref } from 'vue'
import { eventBus } from '@/services/eventBus'
import MutationComponent from '@/components/cylc/Mutation.vue'
import {
  initialOptions as initialOptionsProp,
  updateInitialOptionsEvent,
  useInitialOptions,
} from '@/utils/initialOptions'
import { mdiCheck } from '@mdi/js'

const emit = defineEmits([updateInitialOptionsEvent])

const props = defineProps({
  initialOptions: initialOptionsProp,
  /** ID of Lumino widget. */
  widgetID: {
    type: String,
  },
})

const { mutation, cylcObject, types } = toRefs(props.initialOptions)

const data = useInitialOptions('data', { props, emit })

onMounted(() => {
  // set the tab title to something informative
  eventBus.emit(
    `lumino:update-tab:${props.widgetID}`,
    { title: `Command: ${mutation.value._title}` },
  )
})

const showSuccessSnack = ref(false)
</script>
