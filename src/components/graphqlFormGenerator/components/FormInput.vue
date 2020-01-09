<template>
  <component
   v-model="model"
   v-bind="Object.assign({}, defaultProps, props, propOverrides)"
   :label="label"
   :gqlType="gqlType"
  />
</template>

<script>
import { VTextField } from 'vuetify/lib/components/VTextField'
import GList from '@/components/graphqlFormGenerator/components/List'
import GNonNull from '@/components/graphqlFormGenerator/components/NonNull'

// default props for all form inputs
const DEFAULT_PROPS = {
  filled: true,
  rounded: true,
}

// registry of GraphQL "named types" (e.g. String)
// {namedType: {is: ComponentClass, prop1: value, ...}}
const NAMED_TYPES = {
  String: {
    is: VTextField,
  },
  Int: {
    is: VTextField,
    type: 'number',
    rules: [
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
      default: () => {{}}
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
      }
      else if (KINDS[kind]) {
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
