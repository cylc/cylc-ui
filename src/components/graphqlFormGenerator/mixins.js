/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import FormInput from '@/components/graphqlFormGenerator/FormInput'

export const formElement = {
  components: {
    'form-input': FormInput
  },

  props: {
    // the GraphQL type this input represents
    gqlType: {
      type: Object,
      required: true
    },
    // array of all GraphQL types in the schema
    types: {
      type: Array,
      default: () => []
    },
    // the value (v-model is actually syntactic sugar for this)
    value: {
      required: true
    }
  },

  data: () => ({
    FormInput
  }),

  computed: {
    /* The model we pass to the form input.
     *
     * Note the v-model approach does not work with nesting out of the box,
     * you need to capture and propagate "input" events up the component tree
     * to enable this nested structure of components to share the same model
     * and be managed by Vue correctly.
     */
    model: {
      get () {
        return this.value
      },

      set (val) {
        this.$emit('input', val)
      }
    },

    type () {
      for (const type of this.types) {
        if (type.name === this.gqlType.name && type.kind === this.gqlType.kind) {
          return type
        }
      }
      return null
    },

    help () {
      // TODO: provide argument help then default to type help if not found
      if (this.type && this.type.description) {
        return this.type.description.trim()
      }
      return null
    }
  }
}
