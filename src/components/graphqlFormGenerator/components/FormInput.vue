<template>
  <component
   v-model="componentValue"
   :is="componentClass"
   :label="label"
   :gqlType="gqlType"
  />
</template>

<script>
import { VTextField } from 'vuetify/lib/components/VTextField'
import GList from '@/components/graphqlFormGenerator/components/List'
import GNonNull from '@/components/graphqlFormGenerator/components/NonNull'

const TYPE_COMPONENTS = {
  String: VTextField,
}

const KIND_COMPONENTS = {
    LIST: GList,
    NON_NULL: GNonNull
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
    }
  },

  computed: {
    componentValue: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    },

    componentClass () {
      const name = this.gqlType.name
      const kind = this.gqlType.kind
      // const ofType = this.gqlType.ofType

      // TODO: move to rule based system to allow changing
      //       of parent compoents based on child types

      if (TYPE_COMPONENTS[name]) {
        return TYPE_COMPONENTS[name]
      }
      if (KIND_COMPONENTS[kind]) {
        return KIND_COMPONENTS[kind]
      }

      console.log(
        `Warning: falling back to string for ${this.gqlType.name}, ${this.gqlType.kind}`
      )
      return TYPE_COMPONENTS['String']
    }
  }
}
</script>
