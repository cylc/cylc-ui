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
    persistent-hint
    v-model="model"
    v-bind="$attrs"
    :items="type.enumValues"
    item-text="name"
    :hint="itemDesc"
    placeholder="Select an option"
  />
</template>

<script>
import { formElement } from '@/components/graphqlFormGenerator/mixins'

export default {
  name: 'g-enum',
  mixins: [formElement],
  computed: {
    itemDesc () {
      for (const item of this.type.enumValues) {
        if (item.name === this.value) {
          return item.description
        }
      }
      return ''
    }
  }
}
</script>
