<template>
  <component
   v-model="componentValue"
   :gqlType="gqlType.ofType"
   :label="label"
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
    'value': {
      required: true
    },
    'gqlType': {
      type: Object,
      required: true
    },
    'label': {
      type: String,
      required: true
    }
  },

  data: () => ({
    'FormInput': FormInput
  }),

  computed: {
    componentValue: {
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
