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
    <v-card-subtitle class="text-subtitle-1 font-weight-medium">
      {{ cylcObject.id }}
    </v-card-subtitle>
    <v-skeleton-loader
      v-if="loading"
      type="list-item-two-line@6"
    />
    <v-form
      v-else
      v-model="isValid"
      class="c-edit-runtime-form"
    >
      <v-list>
        <v-list-item
          v-for="key in Object.keys(model)"
          :key="key"
        >
          <v-list-item-content>
            <v-list-item-title class="c-input-label">
              <!-- input label - the display title for this input -->
              {{ startCase(key) }}
            </v-list-item-title>
            <!-- NOTE: the `is` field comes from `props` v-bind -->
            <!-- eslint-disable-next-line vue/require-component-is -->
            <component
              v-bind="getInputProps(key)"
              v-model="model[key]"
              :types="types"
              filled
              dense
            />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-form>
  </div>
</template>

<script>
import { mdiHelpCircleOutline } from '@mdi/js'
import { cloneDeep, isArray, isEqual, snakeCase, startCase } from 'lodash'
import { VTextarea } from 'vuetify/lib/components'
import VuetifyConfig, {
  getComponentProps,
  RUNTIME_SETTING,
} from '@/components/graphqlFormGenerator/components/vuetify'
import { findByName, mutate } from '@/utils/aotf'

export default {
  name: 'EditRuntimeForm',

  props: {
    value: {
      // validity of form
      type: Boolean,
      required: true,
      default: () => false,
    },
    cylcObject: {
      // data store node
      type: Object,
      required: true,
    },
    types: {
      // introspection types
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      type: undefined,
      loading: true,
      model: {},
      namedTypes: {
        ...VuetifyConfig.namedTypes,
        String: {
          is: VTextarea,
          rows: '1',
          autoGrow: true,
          style: 'font-family: monospace;',
        },
      },
      icons: {
        help: mdiHelpCircleOutline,
      },
    }
  },

  created() {
    this.reset()
  },

  computed: {
    isValid: {
      get() {
        return this.value
      },
      set(value) {
        // Update 'value' prop by notifying parent component's v-model for this component
        this.$emit('input', value)
      },
    },
  },

  methods: {
    /** Set this form to its initial conditions. */
    async reset() {
      const queryName =
        this.cylcObject.type === 'family' ? 'familyProxy' : 'taskProxy'
      const queryField = 'runtime'
      this.loading = true
      this.isValid = false
      const result = await this.$workflowService.query(
        queryName,
        { id: this.cylcObject.id },
        [{ name: queryField }]
      )
      const model = cloneDeep(result[queryName][queryField])
      this.type = findByName(this.types, model.__typename)
      // Do not want GQL internal '__typename' field to show up in the form
      delete model.__typename
      // Due to how broadcast works, we cannot rename the keys of/remove
      // pre-existing key-val settings, so mark as frozen
      for (const fieldName of Object.keys(model)) {
        if (
          findByName(this.type.fields, fieldName).type.ofType?.name ===
          RUNTIME_SETTING
        ) {
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

    async submit() {
      const tokens = this.cylcObject.tokens
      const settings = this.getBroadcastData()
      if (!settings.length) {
        return {
          message: 'No changes were made',
          status: {
            name: 'warn',
          },
        }
      }
      const args = {
        cutoff: null,
        cyclePoints: [tokens.cycle],
        mode: 'Set',
        namespaces: [tokens.task],
        settings,
        workflows: [tokens.workflow_id],
      }
      const mutation = await this.$workflowService.getMutation('broadcast')
      return await mutate(mutation, args, this.$workflowService.apolloClient)
    },

    /**
     * Return the changed items in the form in a format suitable for cylc broadcast.
     *
     * Converts the camel case field names to snake case.
     *
     * @return {Object[]}
     */
    getBroadcastData() {
      const ret = []
      for (let [field, val] of Object.entries(this.model)) {
        const initialVal = this.initialData[field]
        if (!isEqual(val, initialVal)) {
          field = snakeCase(field)
          if (isArray(val)) {
            for (const obj of val) {
              // Expect this to be { key?, value?, frozenKey? } object
              if (
                obj.key != null &&
                // new item:
                (!obj.frozenKey ||
                  // altered existing item:
                  obj.value !==
                    initialVal.find(({ key }) => key === obj.key).value)
              ) {
                // Convert { key: x, value: y } to { x: y }
                ret.push({
                  [field]: { [obj.key]: obj.value },
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
    getInputProps(fieldName) {
      const gqlType = findByName(this.type.fields, fieldName).type
      return {
        gqlType,
        ...getComponentProps(gqlType, this.namedTypes, VuetifyConfig.kinds),
      }
    },

    startCase,
  },
}
</script>
