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
  <v-form
    v-if="model"
    v-model="isValid"
    ref="form"
  >
    <!-- the form inputs -->
    <v-list>
      <v-list-item
        v-for="arg in mutation.args"
        v-bind:key="arg.name"
      >
        <v-list-item-title class="d-flex align-center mb-2">
          <!-- input label - the display title for this input -->
          {{ upperFirst(lowerCase(arg.name)) }}
          <!-- help button - tooltip for more information -->
          <v-tooltip
            v-if="arg.description"
            :activator="null"
          >
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" class="mx-2">
                {{ mdiHelpCircleOutline }}
              </v-icon>
            </template>
            <div v-markdown="arg.description"></div>
          </v-tooltip>
        </v-list-item-title>
        <FormInput
          v-model="model[arg.name]"
          :gqlType="arg.type"
        />
      </v-list-item>
    </v-list>
  </v-form>
</template>

<script setup>
import { inject } from 'vue'
import { lowerCase, upperFirst } from 'lodash-es'
import { mdiHelpCircleOutline } from '@mdi/js'
import { vMarkdown } from '@/directives/markdown'
import FormInput from '@/components/graphqlFormGenerator/FormInput.vue'
import { getNullValue, mutate, getMutationArgsFromTokens } from '@/utils/aotf'

const workflowService = inject('workflowService')

// model: true if the form is valid, else False
const isValid = defineModel({
  type: Boolean,
  default: false,
})

const props = defineProps({
  // the mutation we are operating on
  mutation: {
    type: Object,
    required: true,
  },

  // the data store node we are operating on
  cylcObject: {
    type: Object,
    required: true,
  },
})

/** the live state of the form */
const model = defineModel('data', {
  type: Object,
})

if (!model.value) {
  // begin with the initial data
  reset()
}

const { types } = workflowService.loadedGraphQLSchema

/* Set this form to its initial conditions. */
function reset () {
  const newModel = getMutationArgsFromTokens(props.mutation, props.cylcObject.tokens)

  // then apply default values from the schema
  let defaultValue
  for (const arg of props.mutation.args) {
    if (arg.name in newModel) {
      // if the argument is defined in the initial data leave it unchanged
      continue
    }
    if (arg.defaultValue) {
      // if a default value is provided in the schema use it
      defaultValue = JSON.parse(
        // default values arrive as JSON strings in the introspection
        // result so need to be converted here
        arg.defaultValue
      )
      if (!defaultValue) {
        defaultValue = getNullValue(arg.type, types)
      }
    } else {
      // if no default value is provided choose a sensible null value
      // NOTE: IF we set null as the default type for a list
      //       THEN tried to change it to [] later this would break
      //       THIS would break Vue model
      defaultValue = getNullValue(arg.type, types)
    }
    newModel[arg.name] = defaultValue
  }

  model.value = newModel
}

async function submit () {
  return await mutate(
    props.mutation,
    model.value,
    workflowService.apolloClient
  )
}

defineExpose({
  reset,
  submit,
})
</script>
