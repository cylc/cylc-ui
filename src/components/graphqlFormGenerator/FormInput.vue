<template>
  <!-- NOTE: the is field domes from `props` -->
  <!-- eslint-disable-next-line vue/require-component-is -->
  <component
   v-model="model"
   v-bind="props"
   :label="label"
   :gqlType="gqlType"
  />
</template>

<script>
import Vue from 'vue'

import { VTextField } from 'vuetify/lib/components/VTextField'
import GList from '@/components/graphqlFormGenerator/components/List'
import GNonNull from '@/components/graphqlFormGenerator/components/NonNull'

/* Vuetify number input component.
 *
 * Note: Vuetify doesn't supply a dedicated number field, instead you
 *       specialise the text field using `type='number'`, this, however,
 *       does not cast values to `Number` for you so this extension parses
 *       values to `Number` so they can be used directly in the data model.
 */
const VNumberField = Vue.component(
  'v-number-field',
  {
    extends: VTextField,
    computed: {
      internalValue: {
        get () {
          return this.lazyValue
        },
        set (val) {
          // cast values on `set` operations, note this does not get
          // called on creation
          this.lazyValue = Number(val)
          this.$emit('input', this.lazyValue)
        }
      }
    }
  })

// default props for all form inputs
const DEFAULT_PROPS = {
  filled: true,
  rounded: true
}

// registry of GraphQL "named types" (e.g. String)
// {namedType: {is: ComponentClass, prop1: value, ...}}
const NAMED_TYPES = {
  String: {
    is: VTextField
  },
  Int: {
    is: VNumberField,
    type: 'number',
    rules: [
      // TODO: this should work but doesn't seem to be doing anything
      x => Number.isInteger(x) || 'Integer'
    ]
  }
}

// registry of GraphQL "kinds" (e.g. LIST)
// {namedType: {is: ComponentClass, prop1: value, ...}}
const KINDS = {
  LIST: {
    is: GList
  },
  NON_NULL: {
    is: GNonNull
  }
}

export default {
  name: 'form-input',

  props: {
    // the GraphQL type this input represents
    gqlType: {
      type: Object,
      required: true
    },
    // the form label for this input
    label: {
      type: String,
      required: true
    },
    // the value (v-model is actually syntactic sugar for this)
    value: {
      required: true
    },
    // dictionary of props for overriding default values
    propOverrides: {
      type: Object,
      default: () => {}
    }
  },

  data: () => ({
    defaultProps: DEFAULT_PROPS
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

    /* The props to pass to the form input.
     *
     * Note, this includes the "is" prop which tells Vue which component class
     * to use.
     *
     * TODO: move to rule based system to allow changing
     *       of parent components based on child types
     */
    props () {
      // get the default props for this graphQL type
      const name = this.gqlType.name
      const kind = this.gqlType.kind
      // const ofType = this.gqlType.ofType

      var componentProps
      if (NAMED_TYPES[name]) {
        componentProps = NAMED_TYPES[name]
      } else if (KINDS[kind]) {
        componentProps = KINDS[kind]
      } else {
        componentProps = NAMED_TYPES['String']
        console.log(
          'Warning: falling back to string for ' +
          `type: ${this.gqlType.name}, kind: ${this.gqlType.kind}`
        )
      }

      // merge this in with default and override props
      const props = [DEFAULT_PROPS, componentProps, this.propOverrides]
      const ret = Object.assign({}, ...props)

      // rules is a list so needs special treatment
      ret.rules = []
      for (let prop in props) {
        if (prop.rules) {
          ret.rules.push(...prop.rules)
        }
      }

      return ret
    }
  }
}
</script>
