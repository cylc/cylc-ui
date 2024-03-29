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
  <v-form
    v-model="isValid"
    ref="form"
  >
    <!-- the form inputs -->
    <v-list>
      <v-list-item
        v-for="input in inputs"
        v-bind:key="input.label"
      >
          <v-list-item-title class="d-flex align-center mb-2">
            <!-- input label - the display title for this input -->
            {{ upperFirst(lowerCase(input.label)) }}
            <!-- help button - tooltip for more information -->
            <v-tooltip
              v-if="input.description"
              :activator="null"
            >
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props" class="mx-2">
                  {{ $options.icons.mdiHelpCircleOutline }}
                </v-icon>
              </template>
              <Markdown
                :markdown="input.description"
              />
            </v-tooltip>
          </v-list-item-title>
          <FormInput
            v-model="model[input.label]"
            :gqlType="input.gqlType"
            :types="types"
          />
      </v-list-item>
    </v-list>
  </v-form>
</template>

<script>
import { cloneDeep, lowerCase, upperFirst } from 'lodash'
import { mdiHelpCircleOutline } from '@mdi/js'

import Markdown from '@/components/Markdown.vue'
import FormInput from '@/components/graphqlFormGenerator/FormInput.vue'
import { getNullValue, mutate } from '@/utils/aotf'

export default {
  name: 'form-generator',

  components: {
    Markdown,
    FormInput
  },

  props: {
    modelValue: {
      // validity of form
      type: Boolean,
      required: false,
      default: () => false
    },
    mutation: {
      type: Object,
      required: true
    },
    types: {
      type: Array,
      default: () => []
    },
    initialData: {
      type: Object
    }
  },

  emits: ['update:modelValue'],

  data: () => ({
    model: {},
  }),

  created () {
    this.reset()
  },

  computed: {
    /* Provide a list of all form inputs for this mutation. */
    inputs () {
      const ret = []
      for (const arg of this.mutation.args) {
        ret.push({
          gqlType: arg.type,
          label: arg.name,
          description: arg.description
        })
      }
      return ret
    },
    isValid: {
      get () {
        return this.modelValue
      },
      set (value) {
        // Update 'value' prop by notifying parent component's v-model for this component
        this.$emit('update:modelValue', value)
      }
    }
  },

  methods: {
    /* Set this form to its initial conditions. */
    reset () {
      // begin with the initial data
      const model = cloneDeep(this.initialData || {})

      // then apply default values from the schema
      let defaultValue
      for (const arg of this.mutation.args) {
        if (arg.name in model) {
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
            defaultValue = getNullValue(arg.type, this.types)
          }
        } else {
          // if no default value is provided choose a sensible null value
          // NOTE: IF we set null as the default type for a list
          //       THEN tried to change it to [] later this would break
          //       THIS would break Vue model
          defaultValue = getNullValue(arg.type, this.types)
        }
        model[arg.name] = defaultValue
      }

      // done
      this.model = model
    },

    async submit () {
      return await mutate(
        this.mutation,
        this.model,
        this.$workflowService.apolloClient
      )
    },

    lowerCase,
    upperFirst,
  },

  icons: {
    mdiHelpCircleOutline,
  },
}
</script>
