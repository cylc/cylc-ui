<template>
  <component
   v-model="model"
   :propOverrides="{rules: [(x) => !!x || 'Required!']}"
   :gqlType="gqlType.ofType"
   :label="label + ' (required)'"
   :is="FormInput"
  />
</template>

<script>
import PassProps from 'vue-pass-props'
import FormInput from '@/components/graphqlFormGenerator/components/FormInput'

export default {
  name: 'non-null',

  components: {
    'form-input': FormInput
  },

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
    }
  },

  data: () => ({
    'FormInput': FormInput
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
    }
  }
}
</script>
