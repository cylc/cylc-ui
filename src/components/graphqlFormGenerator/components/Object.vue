<template>
  <div>
    <v-container
     class="grey lighten-2"
    >
      <p>{{ type.name }}</p>
      <v-row>
        <component
         v-for="input in inputs"
         v-bind:key="input.label"
         v-model="model[input.label]"
         :is="FormInput"
         :gqlType="input.gqlType"
         :types="types"
         :label="input.label"
        />
      </v-row>
    </v-container>
  </div>
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
