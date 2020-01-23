<template>
  <v-form validate>
    <!-- the mutation title -->
    <h3
     style="text-transform: capitalize;"
    >
      {{ mutation.name }}
    </h3>

    <!-- the mutation description -->
    <v-expansion-panels
     accordion
     flat
     hover
     v-if="longDescription"
    >
      <v-expansion-panel>
        <v-expansion-panel-header>
          <vue-markdown
           :source="shortDescription"
          />
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <vue-markdown
           :source="longDescription"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <vue-markdown
     v-else
     :source="shortDescription"
    />

    <!-- the form inputs -->
    <form-input
     v-for="input in inputs"
     v-bind:key="input.label"
     v-model="model[input.label]"
     :gqlType="input.gqlType"
     :types="types"
     :label="input.label"
    />

    <!-- the form controls -->
    <v-btn
      @click="reset"
    >
      Reset
    </v-btn>

    <!-- temporary visualisation of the data model -->
    <pre ref="output">{{ model }}</pre>
  </v-form>
</template>

<script>
import VueMarkdown from 'vue-markdown'

import FormInput from '@/components/graphqlFormGenerator/FormInput'
import cloneDeep from 'lodash/cloneDeep'

import { formModel } from '@/components/graphqlFormGenerator/mixins'

export default {
  name: 'form-generator',

  mixins: [
    formModel
  ],

  components: {
    'vue-markdown': VueMarkdown,
    'form-input': FormInput
  },

  props: {
    mutation: {
      type: Object,
      required: true
    },
    types: {
      type: Array,
      default: () => []
    },
    initialData: {
      type: Object
    }
  },

  data: () => ({
    model: {}
  }),

  created () {
    this.reset()
  },

  computed: {
    /* Provide a list of all form inputs for this mutation. */
    inputs () {
      const ret = []
      for (const arg of this.mutation.args) {
        ret.push({
          gqlType: arg.type,
          label: arg.name
        })
      }
      return ret
    },

    /* Return the first line of the description. */
    shortDescription () {
      return (this.mutation.description || '').split('\n', 1)[0] || ''
    },

    /* Return the subsequent lines of the description */
    longDescription () {
      return (this.mutation.description || '').split('\n').slice(1).join('\n')
    }
  },

  watch: {
    mutation: function () {
      // reset the form if the mutation changes
      // (i.e. this component is being re-used)
      this.reset()
    }
  },

  methods: {
    /* Set this form to its initial conditions. */
    reset () {
      // begin with the initial data
      const model = cloneDeep(this.initialData || {})

      // then apply default values from the schema
      let defaultValue
      for (const arg of this.mutation.args) {
        if (arg.name in model) {
          // if the argument is defined in the initial data leave it unchanged
          continue
        }
        if (arg.defaultValue) {
          // if a default value is provided in the schema use it
          defaultValue = JSON.parse(
            // default values arrive as JSON strings in the introspection
            // result so need to be converted here
            arg.defaultValue
          )
          if (!defaultValue) {
            defaultValue = this.getNullValue(arg.type)
          }
        } else {
          // if no default value is provided choose a sensible null value
          // NOTE: IF we set null as the default type for a list
          //       THEN tried to change it to [] later this would break
          //       THIS would break Vue model
          defaultValue = this.getNullValue(arg.type)
        }
        model[arg.name] = defaultValue
      }

      // done
      this.model = model
    }
  }
}
</script>
