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
import { formElement } from '@/components/graphqlFormGenerator/mixins'

export default {
  name: 'g-non-null',
  mixins: [formElement]
}
</script>
