<template>
  <v-form>
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
    }
  },

  data: () => ({
    model: {}
  }),

  methods: {
    getArguments (mutations) {
      // TODO convert to computed?
      const ret = []
      for (let argument of mutations.args) {
        ret.push({
          gqlType: argument.type,
          label: argument.name
        })
        // spin up the model
        this.model[argument.name] = (
          argument.defaultValue
          ? argument.defaultValue
          : null
        )
      }
      return ret
    },

    meh () {
      this.$refs.output.innerText = JSON.stringify(this.model, null, '  ')
    }
  }
}
</script>
