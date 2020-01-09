<template>
  <v-form validate>
    <h3>{{ mutation.name }}</h3>
    <p>{{ mutation.description }}</p>
    <form-input
     v-for="arg in getArguments(mutation)"
     v-bind:key="arg.label"
     v-model="model[arg.label]"
     :gqlType="arg.gqlType"
     :label="arg.label"
    />
    <v-btn
      @click="meh"
    >
      Done
    </v-btn>
    <v-btn
      @click="reset"
    >
      Reset
    </v-btn>
    <pre ref="output">{{ model }}</pre>
  </v-form>
</template>

<script>
import { VForm } from 'vuetify/lib/components/VForm'
import FormInput from '@/components/graphqlFormGenerator/components/FormInput'

// import Vue from 'vue'
// Vue.component('form-input', FormInput)

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

  methods: {
    reset () {
      // begin with the initial data
      const model = this.deepcopy(this.initialData || {})

      // then apply default values from the schema
      var defaultValue
      for (let arg of this.mutation.args) {
        if (arg.name in model) {
          // if the argument is defined in the initial data leave it unchanged
          continue
        }
        if (arg.defaultValue) {
          // if a default value is provided in the schema use it
          defaultValue = arg.defaultValue
        } else {
          // if no default value is provided choose a sensible null value
          // NOTE: that if we set null as the default type for a list then
          //       tried to change it to [] later this would break the Vue model
          defaultValue = this.getNullValue(arg.type)
        }
        model[arg.name] = defaultValue
      }

      // done
      this.model = model
    },

    deepcopy (obj) {
      return JSON.parse(
        JSON.stringify(
          obj
        )
      )
    },

    getArguments (mutations) {
      // TODO convert to computed?
      const ret = []
      for (let arg of mutations.args) {
        ret.push({
          gqlType: arg.type,
          label: arg.name
        })
      }
      return ret
    },

    /* Return a null value of a JS type corresponding to the GraphQL type. */
    getNullValue (type) {
      var ret = null
      var pointer = type
      while (pointer) {
        if (pointer.kind === 'LIST') {
          ret = []
          break
        }
        if (pointer.kind == 'OBJECT') {
          ret = {}
          break
        }
        pointer = pointer.ofType
      }
      return ret
    },

    meh () {
      this.$refs.output.innerText = JSON.stringify(this.model, null, '  ')
    }
  }
}
</script>
