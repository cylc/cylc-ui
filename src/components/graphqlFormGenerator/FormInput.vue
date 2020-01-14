<template>
  <!-- NOTE: the is field comes from `props` -->
  <!-- eslint-disable-next-line vue/require-component-is -->
  <component
   v-model="model"
   v-bind="props"
   :label="label"
   :gqlType="gqlType"
   :types="types"
  />
</template>

<script>
import Vue from 'vue'

import { VTextField } from 'vuetify/lib/components/VTextField'
import { VSwitch } from 'vuetify/lib/components/VSwitch'

import { formElement } from '@/components/graphqlFormGenerator/mixins'
import GEnum from '@/components/graphqlFormGenerator/components/Enum'
import GNonNull from '@/components/graphqlFormGenerator/components/NonNull'
import GList from '@/components/graphqlFormGenerator/components/List'
import GObject from '@/components/graphqlFormGenerator/components/Object'

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

const RULES = {
  integer:
    x => (!x || Number.isInteger(x)) || 'Integer',
  noSpaces:
    x => (!x || !x.includes(' ')) || 'Cannot contain spaces',
  ISO8601:
    // ensure only white-listed chars are present
    x => Boolean(!x || x.match(/^[\dT.,:-]+$/)) || 'Date-time in ISO8601 format',
  cylcConfigItem:
    // PERMIT [a][b]c, a, [a] PROHIBIT a[b], [b]a, a], ]a
    x => Boolean(!x || x.match(/^((\[[^=\]]+\])+)?([^[=\]-]+)?$/)) || 'Invalid',
  taskID:
    // PERMIT A.1 PROHIBIT a
    x => Boolean(!x || x.match(/^(.){1,}\.(.){1,}$/)) || 'Invalid'
}

// registry of GraphQL "named types" (e.g. String)
// {namedType: {is: ComponentClass, prop1: value, ...}}
const NAMED_TYPES = {
  // GraphQL types
  String: {
    is: VTextField
  },
  Int: {
    is: VNumberField,
    type: 'number',
    rules: [
      RULES.integer
    ]
  },
  Float: {
    is: VNumberField,
    type: 'number'
  },
  Boolean: {
    is: VSwitch,
    color: 'blue darken-3'
  },
  // Cylc types
  WorkflowName: {
    is: VTextField,
    rules: [
      RULES.noSpaces
    ]
  },
  User: {
    is: VTextField,
    rules: [
      RULES.noSpaces
    ]
  },
  // WorkflowID
  CyclePoint: {
    is: VTextField,
    rules: [
      RULES.noSpaces,
      // character whitelist
      x => Boolean(!x || x.match(/^[\dT]+$/)) || 'Invalid Cycle Point'
    ]
  },
  CyclePointGlob: {
    is: VTextField,
    rules: [
      RULES.noSpaces,
      // character whitelist
      x => Boolean(!x || x.match(/^[\dT*]+$/)) || 'Invalid Cycle Point Glob'
    ]
  },
  // BroadcastSetting
  // TaskStatus
  // TaskState
  TaskName: {
    is: VTextField,
    rules: [
      RULES.noSpaces
    ]
  },
  TaskID: {
    is: VTextField,
    rules: [
      RULES.noSpaces,
      RULES.taskID
    ]
  },
  NamespaceName: {
    is: VTextField,
    rules: [
      RULES.noSpaces
    ]
  },
  NamespaceIDGlob: {
    is: VTextField,
    rules: [
      RULES.noSpaces
    ]
  },
  TimePoint: {
    is: VTextField,
    rules: [
      RULES.noSpaces,
      RULES.ISO8601
    ]
  },
  RuntimeConfiguration: {
    is: VTextField,
    rules: [
      RULES.cylcConfigItem
    ]
  }
}

// registry of GraphQL "kinds" (e.g. LIST)
// {namedType: {is: ComponentClass, prop1: value, ...}}
const KINDS = {
  // GraphQL types
  ENUM: {
    is: GEnum
  },
  NON_NULL: {
    is: GNonNull
  },
  LIST: {
    is: GList
  },
  INPUT_OBJECT: {
    is: GObject // happy naming coincidence
  }
  // Cylc types
}

export default {
  name: 'g-form-input',

  mixins: [formElement],

  props: {
    // dictionary of props for overriding default values
    propOverrides: {
      type: Object,
      default: () => { Object() }
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
      const propGroups = [
        DEFAULT_PROPS,
        componentProps,
        this.propOverrides || {}
      ]
      const ret = Object.assign({}, ...propGroups)

      // rules is a list so needs special treatment
      ret.rules = []
      for (const prop of propGroups) {
        if (prop.rules) {
          ret.rules.push(...prop.rules)
        }
      }

      return ret
    }
  }
}
</script>
