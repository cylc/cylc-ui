<template>
  <!-- NOTE: the is field comes from `props` -->
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

import { formElement } from '@/components/graphqlFormGenerator/mixins'
import GNonNull from '@/components/graphqlFormGenerator/components/NonNull'
import GList from '@/components/graphqlFormGenerator/components/List'

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
  NON_NULL: {
    is: GNonNull
  },
  LIST: {
    is: GList
  }
}

export default {
  name: 'g-form-input',

  mixins: [formElement],

  props: {
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
        componentProps = NAMED_TYPES.String
        // eslint-disable-next-line no-console
        console.error(
          'Warning: falling back to string for ' +
          `type: ${this.gqlType.name}, kind: ${this.gqlType.kind}`
        )
      }

      // merge this in with default and override props
      const props = [DEFAULT_PROPS, componentProps, this.propOverrides]
      const ret = Object.assign({}, ...props)

      // rules is a list so needs special treatment
      ret.rules = []
      for (const prop in props) {
        if (prop.rules) {
          ret.rules.push(...prop.rules)
        }
      }

      return ret
    }
  }
}
</script>
