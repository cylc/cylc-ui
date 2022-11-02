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
    >
      <v-list>
        <v-list-item
          v-for="key in Object.keys(model)"
          :key="key"
        >
          <v-list-item-content>
            <v-list-item-title>
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
import { startCase } from 'lodash'
import { VTextarea } from 'vuetify/lib/components'
import VuetifyConfig, { getComponentProps } from '@/components/graphqlFormGenerator/components/vuetify'
import GList from '@/components/graphqlFormGenerator/components/List'
import { findByName } from '@/utils/aotf'

export default {
  name: 'EditRuntimeForm',

  props: {
    value: {
      // validity of form
      type: Boolean,
      required: true,
      default: () => false
    },
    cylcObject: {
      // { id, isFamily }
      type: Object,
      required: true
    },
    types: {
      // introspection types
      type: Array,
      required: true
    }
  },

  data () {
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
          style: 'font-family: monospace;'
        },
        GenericScalar: {
          is: GList,
          gqlType: {
            kind: 'LIST',
            ofType: {
              name: 'KeyValPair',
              kind: 'INPUT_OBJECT'
            }
          },
          addAtStart: true
        }
      },
      kinds: VuetifyConfig.kinds,
      icons: {
        help: mdiHelpCircleOutline
      }
    }
  },

  created () {
    this.reset()
  },

  computed: {
    isValid: {
      get () {
        return this.value
      },
      set (value) {
        // Update 'value' prop by notifying parent component's v-model for this component
        this.$emit('input', value)
      }
    }
  },

  methods: {
    /** Set this form to its initial conditions. */
    reset () {
      const queryName = this.cylcObject.isFamily ? 'familyProxy' : 'taskProxy'
      const queryField = 'runtime'
      this.loading = true
      this.isValid = false
      this.$workflowService.query(
        queryName,
        { id: this.cylcObject.id },
        [{ name: queryField }]
      ).then(result => {
        const model = result[queryName][queryField]
        this.type = findByName(this.types, model.__typename)
        delete model.__typename
        // Due to how broadcast works, we cannot modify/remove pre-existing keys,
        // so mark as frozen
        for (const fieldName of Object.keys(model)) {
          const typeName = findByName(this.type.fields, fieldName).type.name
          if (typeName === 'GenericScalar') {
            for (const item of model[fieldName]) {
              item.frozenKey = true
            }
          }
        }
        this.model = model
        this.loading = false
        // (this.isValid gets set by form v-model)
      })
    },

    submit () {
      if (this.callbackSubmit) {
        this.callbackSubmit(this.model)
      }
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
        ...getComponentProps(gqlType, this.namedTypes, this.kinds)
      }
    },

    startCase
  }
}
</script>
