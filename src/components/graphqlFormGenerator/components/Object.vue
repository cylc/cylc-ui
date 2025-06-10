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

<script>
import { formElement } from '@/components/graphqlFormGenerator/mixins'

export default {
  name: 'g-input-object',

  mixins: [formElement],

  computed: {
    inputs () {
      return this.type.fields.map(field => ({
        gqlType: field.type,
        label: field.name,
      }))
    },
  },
}
</script>
