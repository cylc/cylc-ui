<template>
  <v-input>
    <template>
      <component
       v-for="input in inputs"
       v-bind:key="input.label"
       v-model="model[input.label]"
       :is="FormInput"
       :gqlType="input.gqlType"
       :types="types"
       :label="input.label"
      />
    </template>
    <template v-slot:append>
    <!-- resolve the "append-outer" slot here -->
    <slot name="append-outer"></slot>
  </template>
  </v-input>
</template>

<script>
import { formElement } from '@/components/graphqlFormGenerator/mixins'

export default {
  name: 'g-input-object',

  mixins: [formElement],

  computed: {
    inputs () {
      const ret = []
      for (const field of this.type.inputFields) {
        ret.push({
          gqlType: field.type,
          label: field.name
        })
      }
      return ret
    }
  }
}
</script>
