<template>
  <component
   v-model="model"
   :propOverrides="{rules: [x => Boolean(x) || 'Required!']}"
   :gqlType="gqlType.ofType"
   :types="types"
   :label="label + ' (required)'"
   :is="FormInput"
  >
    <template v-slot:append-outer>
      <!-- pass the "append-outer" slot onto the child component -->
      <slot name="append-outer">
      </slot>
    </template>
  </component>
</template>

<script>
import { formElement } from '@/components/graphqlFormGenerator/mixins'

export default {
  name: 'g-non-null',
  mixins: [formElement]
}
</script>
