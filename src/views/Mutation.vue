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
    v-bind="{ mutation, cylcObject }"
    v-model="data"
    @success="onSuccess()"
  />
</template>

<script setup>
import { inject, onMounted, toRefs, triggerRef } from 'vue'
import { useStore } from 'vuex'
import { eventBus } from '@/services/eventBus'
import MutationComponent from '@/components/cylc/Mutation.vue'
import {
  initialOptions as initialOptionsProp,
  updateInitialOptionsEvent,
  useInitialOptions,
} from '@/utils/initialOptions'
import Alert from '@/components/core/Alert.vue'
import { nonCryptoHash } from '@/utils/general'

const store = useStore()
const workflowService = inject('workflowService')

const emit = defineEmits([updateInitialOptionsEvent])

const props = defineProps({
  initialOptions: initialOptionsProp,
  /** ID of Lumino widget. */
  widgetID: {
    type: String,
  },
})

const { mutation, cylcObject } = toRefs(props.initialOptions)

const data = useInitialOptions('data', { props, emit })

// Calculate a hash of the current GraphQL schema and store it
const schemaHash = nonCryptoHash(JSON.stringify(workflowService.loadedGraphQLSchema))
const storedHash = useInitialOptions('schemaHash', { props, emit }, schemaHash)
triggerRef(storedHash)

if (storedHash.value !== schemaHash) {
  // The form must have been saved in a previous version of Cylc, and is no longer valid, so clear the data
  data.value = undefined
  storedHash.value = schemaHash
}

onMounted(() => {
  // set the tab title to something informative
  const title = `Command: ${mutation.value._title}`
  eventBus.emit(
    `lumino:update-tab:${props.widgetID}`,
    { title, caption: title },
  )
})

async function onSuccess () {
  // form is open in a tab -> provide an alert to let the user know
  // the command succeeded
  await store.dispatch(
    'setAlert',
    new Alert('Command succeeded', 'green')
  )
}
</script>
