<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <v-input>
    <template>
      <FormInput
       v-for="input in inputs"
       v-bind:key="input.label"
       v-model="model[input.label]"
       :gqlType="input.gqlType"
       :types="types"
      />
    </template>
    <template v-slot:append>
      <!-- resolve the "append" slot here -->
      <slot name="append"></slot>
    </template>
  </v-input>
</template>

<script setup>
import { computed } from 'vue'
import FormInput from '@/components/graphqlFormGenerator/FormInput.vue'
import { formElementProps, useFormElement } from '@/components/graphqlFormGenerator/mixins'

const props = defineProps({
  ...formElementProps
})

const model = defineModel({ required: true })

const { type } = useFormElement(props)

const inputs = computed(() => type.value.fields.map(
  (field) => ({
    gqlType: field.type,
    label: field.name
  })
))
</script>
