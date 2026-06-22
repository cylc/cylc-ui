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

<!-- Form for editing the runtime section of a task/family, using broadcast  -->

<template>
  <div>
    <v-card-subtitle class="text-subtitle-1 font-weight-medium mt-4">
      {{ tokens.id }}
    </v-card-subtitle>
    <v-skeleton-loader
      v-if="loading"
      type="list-item-two-line@6"
      class="mt-6"
    />
    <v-form
      v-else
      v-model="isValid"
      ref="form"
      class="c-edit-runtime-form ma-4"
    >
      <div
        v-for="key in Object.keys(model)"
        :key="key"
      >
        <v-list-item-title class="c-input-label">
          <!-- input label - the display title for this input -->
          {{ startCase(key) }}
        </v-list-item-title>
        <component
          :is="getInputProps(key).is"
          v-bind="getInputProps(key)"
          v-model="model[key]"
          :types="types"
        />
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed, inject, onBeforeMount } from 'vue'
import { cloneDeep, isArray, isEqual, snakeCase, startCase } from 'lodash'
import { VTextarea } from 'vuetify/components/VTextarea'
import VuetifyConfig, { getComponentProps, RUNTIME_SETTING } from '@/components/graphqlFormGenerator/components/vuetify'
import { findByName, mutate, mutationStatus } from '@/utils/aotf'
import GEnum from '@/components/graphqlFormGenerator/components/Enum.vue'

const workflowService = inject('workflowService')

const NamedTypes = {
  ...VuetifyConfig.namedTypes,
  String: {
    is: VTextarea,
    rows: '1',
    autoGrow: true,
    style: 'font-family: monospace;'
  },
  TaskRunMode: {
    is: GEnum,
    // Workaround https://github.com/cylc/cylc-flow/pull/6554#discussion_r1922563421
    allowedValues: ['Live', 'Skip'],
  },
}

/** validity of form */
const isValid = defineModel({
  type: Boolean,
  default: false
})

const props = defineProps({
  cylcObject: {
    // data store node
    type: Object,
    required: true
  },
  types: {
    // introspection types
    type: Array,
    required: true
  },
})

const runtimeType = findByName(props.types, 'Runtime')
const loading = ref(true)
const model = ref({})
/** Initial data immediately after each time the form is reset (does not need to be reactive). */
let initialData

onBeforeMount(() => {
  reset()
})

const tokens = computed(
  () => props.cylcObject.type === 'cycle'
    ? props.cylcObject.tokens.clone({ task: 'root' })
    : props.cylcObject.tokens
)

/** Set this form to its initial conditions. */
async function reset () {
  // initialise view from query
  const queryName = (
    ['cycle', 'family'].includes(props.cylcObject.type) ? 'familyProxy' : 'taskProxy'
  )
  const queryField = 'runtime'
  loading.value = true
  isValid.value = false
  const result = await workflowService.query(
    queryName,
    { id: tokens.value.id },
    [{ name: queryField }]
  )
  const newModel = cloneDeep(result[queryName][queryField])
  // Do not want GQL internal '__typename' field to show up in the form
  delete newModel.__typename
  // Due to how broadcast works, we cannot rename the keys of/remove
  // pre-existing key-val settings, so mark as frozen
  for (const fieldName of Object.keys(newModel)) {
    if (findByName(runtimeType.fields, fieldName).type.ofType?.name === RUNTIME_SETTING) {
      for (const item of newModel[fieldName]) {
        item.frozenKey = true
      }
    }
  }
  model.value = newModel
  initialData = cloneDeep(newModel)
  loading.value = false
  // (isValid gets set by form v-model)
}

async function submit () {
  const settings = getBroadcastData()
  if (!settings.length) {
    return {
      message: 'No changes were made',
      status: mutationStatus.WARN
    }
  }
  const args = {
    cutoff: null,
    cyclePoints: [tokens.value.cycle],
    mode: 'Set',
    namespaces: [tokens.value.task],
    settings,
    workflows: [tokens.value.workflowID]
  }
  const mutation = await workflowService.getMutation('broadcast')
  return await mutate(
    mutation,
    args,
    workflowService.apolloClient
  )
}

/**
 * Return the changed items in the form in a format suitable for cylc broadcast.
 *
 * Converts the camel case field names to snake case.
 *
 * @return {Object[]}
 */
function getBroadcastData () {
  const ret = []
  for (let [field, val] of Object.entries(model.value)) {
    const initialVal = initialData[field]
    if (!isEqual(val, initialVal)) {
      field = snakeCase(field)
      if (isArray(val)) {
        for (const obj of val) {
          // Expect this to be { key?, value?, frozenKey? } object
          if (obj.key != null && (
            // new item:
            !obj.frozenKey ||
            // altered existing item:
            obj.value !== initialVal.find(({ key }) => key === obj.key).value
          )) {
            // Convert { key: x, value: y } to { x: y }
            ret.push({
              [field]: { [obj.key]: obj.value }
            })
          }
        }
      } else {
        ret.push({ [field]: val })
      }
    }
  }
  return ret
}

/**
 * Return props for creating an input component, given the name of the
 * field in the GQL Runtime type.
 *
 * @param {string} fieldName
 * @return {Object}
 */
function getInputProps (fieldName) {
  const gqlType = findByName(runtimeType.fields, fieldName).type
  return {
    gqlType,
    ...getComponentProps(gqlType, NamedTypes, VuetifyConfig.kinds)
  }
}

defineExpose({
  reset,
  submit,
})
</script>
