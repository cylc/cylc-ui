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

<!-- Form for editing the runtime section of a task/family, using broadcast  -->

<template>
  <div>
    <v-card-subtitle class="text-subtitle-1 font-weight-medium mt-4">
      {{ this.tokens.id }}
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

<script>
import { cloneDeep, isArray, isEqual, snakeCase, startCase } from 'lodash'
import { VTextarea } from 'vuetify/components/VTextarea'
import VuetifyConfig, { getComponentProps, RUNTIME_SETTING } from '@/components/graphqlFormGenerator/components/vuetify'
import { findByName, mutate, mutationStatus } from '@/utils/aotf'
import GEnum from '@/components/graphqlFormGenerator/components/Enum.vue'

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

export default {
  name: 'EditRuntimeForm',

  props: {
    modelValue: {
      // validity of form
      type: Boolean,
      default: () => false
    },
    cylcObject: {
      // data store node
      type: Object,
      required: true
    },
    types: {
      // introspection types
      type: Array,
      required: true
    }
  },

  emits: ['update:modelValue'],

  data () {
    return {
      type: undefined,
      loading: true,
      model: {},
    }
  },

  created () {
    this.reset()
  },

  computed: {
    tokens () {
      return this.cylcObject.type === 'cycle'
        ? this.cylcObject.tokens.clone({ task: 'root' })
        : this.cylcObject.tokens
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
    /** Set this form to its initial conditions. */
    async reset () {
      const queryName = (
        ['cycle', 'family'].includes(this.cylcObject.type) ? 'familyProxy' : 'taskProxy'
      )
      const queryField = 'runtime'
      this.loading = true
      this.isValid = false
      const result = await this.$workflowService.query(
        queryName,
        { id: this.tokens.id },
        [{ name: queryField }]
      )
      const model = cloneDeep(result[queryName][queryField])
      this.type = findByName(this.types, model.__typename)
      // Do not want GQL internal '__typename' field to show up in the form
      delete model.__typename
      // Due to how broadcast works, we cannot rename the keys of/remove
      // pre-existing key-val settings, so mark as frozen
      for (const fieldName of Object.keys(model)) {
        if (findByName(this.type.fields, fieldName).type.ofType?.name === RUNTIME_SETTING) {
          for (const item of model[fieldName]) {
            item.frozenKey = true
          }
        }
      }
      this.model = model
      this.initialData = cloneDeep(model)
      this.loading = false
      // (this.isValid gets set by form v-model)
    },

    async submit () {
      const settings = this.getBroadcastData()
      if (!settings.length) {
        return {
          message: 'No changes were made',
          status: mutationStatus.WARN
        }
      }
      const args = {
        cutoff: null,
        cyclePoints: [this.tokens.cycle],
        mode: 'Set',
        namespaces: [this.tokens.task],
        settings,
        workflows: [this.tokens.workflowID]
      }
      const mutation = await this.$workflowService.getMutation('broadcast')
      return await mutate(
        mutation,
        args,
        this.$workflowService.apolloClient
      )
    },

    /**
     * Return the changed items in the form in a format suitable for cylc broadcast.
     *
     * Converts the camel case field names to snake case.
     *
     * @return {Object[]}
     */
    getBroadcastData () {
      const ret = []
      for (let [field, val] of Object.entries(this.model)) {
        const initialVal = this.initialData[field]
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
    },

    /**
     * Return props for creating an input component, given the name of the
     * field in the GQL Runtime type.
     *
     * @param {string} fieldName
     * @return {Object}
     */
    getInputProps (fieldName) {
      const gqlType = findByName(this.type.fields, fieldName).type
      return {
        gqlType,
        ...getComponentProps(gqlType, NamedTypes, VuetifyConfig.kinds)
      }
    },

    startCase
  }
}
</script>
