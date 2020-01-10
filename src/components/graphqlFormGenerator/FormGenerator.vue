<template>
  <v-form validate>
    <h3>{{ mutation.name }}</h3>
    <p>{{ mutation.description }}</p>
    <form-input
     v-for="input in inputs"
     v-bind:key="input.label"
     v-model="model[input.label]"
     :gqlType="input.gqlType"
     :label="input.label"
    />
    <v-btn
      @click="reset"
    >
      Reset
    </v-btn>
    <pre ref="output">{{ model }}</pre>
  </v-form>
</template>

<script>
import FormInput from '@/components/graphqlFormGenerator/FormInput'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'form-generator',

  components: {
    'form-input': FormInput
  },

  props: {
    mutation: {
      type: Object,
      required: true
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
          defaultValue = arg.defaultValue
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
    },

    /* Return a null value of a JS type corresponding to the GraphQL type. */
    getNullValue (type) {
      let ret = null
      let pointer = type
      while (pointer) {
        if (pointer.kind === 'LIST') {
          ret = []
          break
        }
        if (pointer.kind === 'OBJECT') {
          ret = {}
          break
        }
        pointer = pointer.ofType
      }
      return ret
    }
  }
}
</script>
