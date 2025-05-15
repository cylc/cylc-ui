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
  <v-select
    v-model="model"
    v-bind="$attrs"
    :items="enumValues"
    item-title="name"
    :hint="itemDesc"
    placeholder="Select an option"
    persistent-hint
  />
</template>

<script>
import { formElement } from '@/components/graphqlFormGenerator/mixins'

export default {
  name: 'g-enum',

  mixins: [formElement],

  props: {
    /** Specify a subset of the type's enum values that will be displayed. */
    allowedValues: {
      type: Array,
      required: false,
    },
  },

  computed: {
    enumValues () {
      return this.allowedValues?.length
        ? this.type.enumValues.filter(
          ({ name }) => this.allowedValues.includes(name)
        )
        : this.type.enumValues
    },

    itemDesc () {
      return this.type.enumValues.find(
        ({ name }) => name === this.modelValue
      )?.description ?? ''
    },
  }
}
</script>
