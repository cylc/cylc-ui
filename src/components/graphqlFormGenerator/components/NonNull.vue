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
  <FormInput
    v-model="model"
    :propOverrides="{ rules: [$options.nonNullRule] }"
    :gqlType="gqlType.ofType"
    :types="types"
  >
    <template v-slot:append>
      <!-- pass the "append" slot onto the child component -->
      <slot name="append"></slot>
    </template>
  </FormInput>
</template>

<script>
import { formElement } from '@/components/graphqlFormGenerator/mixins'

/** Disallow empty array/string or nullish */
export const nonNullRule = (x) => Boolean(x?.length ?? x != null) || 'Required'

export default {
  name: 'g-non-null',

  mixins: [formElement],

  nonNullRule,
}
</script>
