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
  <v-list density="compact">
    <v-list-item
      v-for="(item, index) in modelValue"
      :key="index"
    >
      <!-- The input -->
      <FormInput
        v-model="modelValue[index]"
        :gqlType="gqlType.ofType"
        :types="types"
        ref="inputs"
      >
        <template v-slot:append="slotProps">
          <v-btn
            @click="remove(index)"
            v-bind="slotProps"
            icon
            size="small"
            variant="plain"
            class="remove-btn"
          >
            <v-icon size="x-large">
              {{ $options.icons.mdiCloseCircle }}
            </v-icon>
          </v-btn>
        </template>
      </FormInput>
    </v-list-item>
    <v-list-item>
      <v-btn
        @click="add()"
        variant="text"
        data-cy="add"
        :prepend-icon="$options.icons.mdiPlusCircle"
      >
        Add Item
      </v-btn>
    </v-list-item>
  </v-list>
</template>

<script>
import { formElement } from '@/components/graphqlFormGenerator/mixins'
import { getNullValue } from '@/utils/aotf'
import { mdiPlusCircle, mdiCloseCircle } from '@mdi/js'

export default {
  name: 'g-list',

  mixins: [
    formElement,
  ],

  props: {
    addAtStart: {
      type: Boolean,
      default: false,
    },
  },

  inheritAttrs: false,

  methods: {
    /** Add an item to the list. */
    add () {
      const newInput = getNullValue(this.gqlType.ofType, this.types)
      let index = 0
      if (this.addAtStart) {
        this.modelValue.unshift(newInput)
      } else {
        index = this.modelValue.length
        this.modelValue.push(newInput)
      }
      // this is not ideal, but I believe whats happening is the new (wrapper) component is created over the first tick from the new array item
      // the component content is created over the next tick (including the input)
      this.$nextTick(() => {
        this.$nextTick(() => {
          // get the latest input ref (which is a tooltip for some reason), get its parent, then the input itself and focus() it (if it exists)
          this.$refs.inputs[index].$el?.parentNode?.querySelector('input')?.focus()
        })
      })
    },

    /** Remove the item at `index` from the list. */
    remove (index) {
      this.modelValue.splice(index, 1)
    },
  },

  icons: {
    mdiPlusCircle,
    mdiCloseCircle,
  },
}
</script>
