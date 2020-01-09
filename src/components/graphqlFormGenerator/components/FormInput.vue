<template>
  <!-- TODO: merge props in a method so rules are preserved -->
  <component
   v-model="componentValue"
   v-bind="Object.assign({}, defaultProps, props, propOverrides)"
   :label="label"
   :gqlType="gqlType"
  />
</template>

<script>
import { VTextField } from 'vuetify/lib/components/VTextField'
import GList from '@/components/graphqlFormGenerator/components/List'
import GNonNull from '@/components/graphqlFormGenerator/components/NonNull'

const DEFAULT_PROPS = {
  filled: true,
  rounded: true,
}

const TYPE_COMPONENTS = {
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

const KIND_COMPONENTS = {
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
    gqlType: {
      type: Object,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    value: {
      required: true
    },
    propOverrides: {
      type: Object,
      default: () => {{}}
    }
  },

  data: () => ({
    defaultProps: DEFAULT_PROPS
  }),

  computed: {
    componentValue: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    },

    // TODO: move to rule based system to allow changing
    //       of parent components based on child types
    props () {
      // get the default props for this graphQL type
      const name = this.gqlType.name
      const kind = this.gqlType.kind
      // const ofType = this.gqlType.ofType

      var componentProps
      if (TYPE_COMPONENTS[name]) {
        componentProps = TYPE_COMPONENTS[name]
      }
      else if (KIND_COMPONENTS[kind]) {
        componentProps = KIND_COMPONENTS[kind]
      } else {
        componentProps = TYPE_COMPONENTS['String']
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
