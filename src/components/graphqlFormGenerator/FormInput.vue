<template>
  <v-tooltip
    bottom
    v-model="showHelp"
  >
    <template v-slot:activator="{ on }">

      <!-- TODO: try wrapping everyhing in v-input? -->

      <!-- TODO: fix the inputType form alignment thinggy -->

      <!-- NOTE: the is field comes from `props` -->
      <!-- eslint-disable-next-line vue/require-component-is -->
      <component
       v-model="model"
       v-bind="props"
       v-mask="props.mask"
       :label="label"
       :gqlType="gqlType"
       :types="types"
       @blur="showHelp = false"
      >
        <template v-slot:append>
          <v-icon
           @click="showHelp = !showHelp"
          >
            mdi-help-circle-outline
          </v-icon>
        </template>

        <template v-slot:append-outer>
          <!-- pass the "append-outer" slot onto the child component -->
          <slot name="append-outer"></slot>
        </template>

      </component>
    </template>
    <vue-markdown>{{ help }}</vue-markdown>
  </v-tooltip>
</template>

<script>
import { mask } from 'vue-the-mask'
import VueMarkdown from 'vue-markdown'

import { formElement } from '@/components/graphqlFormGenerator/mixins'
import VuetifyConfig from '@/components/graphqlFormGenerator/components/vuetify'

export default {
  name: 'g-form-input',

  mixins: [formElement],

  components: {
    'vue-markdown': VueMarkdown
  },

  directives: {
    mask: (el, binding) => {
      // only use the mask if one is provided, this allows us to use the
      // mask directive on elements which it doesn't support
      if (binding.value) {
        mask(el, binding)
      }
    }
  },

  props: {
    // dictionary of props for overriding default values
    propOverrides: {
      type: Object,
      default: () => { Object() }
    }
  },

  data: () => ({
    defaultProps: VuetifyConfig.defaultProps,
    namedTypes: VuetifyConfig.namedTypes,
    kinds: VuetifyConfig.kinds,
    showHelp: false
  }),

  computed: {
    help () {
      // TODO: provide argument help then default to type help if not found
      if (this.type && this.type.description) {
        return this.type.description.trim()
      }
      return null
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
      if (this.namedTypes[name]) {
        componentProps = this.namedTypes[name]
      } else if (this.kinds[kind]) {
        componentProps = this.kinds[kind]
      } else {
        componentProps = this.namedTypes.String
        // eslint-disable-next-line no-console
        console.error(
          'Warning: falling back to string for ' +
          `type: ${this.gqlType.name}, kind: ${this.gqlType.kind}`
        )
      }

      // merge this in with default and override props
      const propGroups = [
        this.defaultProps,
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
