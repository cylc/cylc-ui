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
      v-for="(item, index) in model"
      :key="index"
    >
      <!-- The input -->
      <FormInput
        v-model="model[index]"
        :gqlType="gqlType.ofType"
        :types="types"
        :id="inputId(index)"
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
              {{ mdiCloseCircle }}
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
        :prepend-icon="mdiPlusCircle"
      >
        Add Item
      </v-btn>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { nextTick } from 'vue'
import FormInput from '@/components/graphqlFormGenerator/FormInput.vue'
import { formElementProps } from '@/components/graphqlFormGenerator/mixins'
import { getNullValue } from '@/utils/aotf'
import { mdiPlusCircle, mdiCloseCircle } from '@mdi/js'
import { uniqueId } from 'lodash-es'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  ...formElementProps,
  addAtStart: {
    type: Boolean,
    default: false
  }
})

const model = defineModel({ type: Array })
// Handle cases in the schema where a List is not required/NON_NULL:
model.value ??= []

const listId = uniqueId('list')
/** Return unique DOM ID for an input. */
function inputId (index) {
  return `${listId}-input${index}`
}

/** Add an item to the list. */
async function add () {
  const newInput = getNullValue(props.gqlType.ofType, props.types)
  let index = 0
  if (props.addAtStart) {
    model.value.unshift(newInput)
  } else {
    index = model.value.length
    model.value.push(newInput)
  }
  await nextTick()
  // get the latest input ref and focus it (if it exists)
  document.getElementById(inputId(index))?.focus()
}

/** Remove the item at `index` from the list. */
function remove (index) {
  model.value.splice(index, 1)
}

</script>
