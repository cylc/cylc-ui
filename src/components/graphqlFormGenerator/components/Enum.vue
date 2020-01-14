<template>
  <v-select
   v-model="model"
   :label="label + ' (required)'"
   :items="type.enumValues"
   item-text="name"
  />
</template>

<script>
import { formElement } from '@/components/graphqlFormGenerator/mixins'

export default {
  name: 'g-enum',
  mixins: [formElement]
}
</script>
