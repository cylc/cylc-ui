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
import { nextTick, ref } from 'vue'
import FormInput from '@/components/graphqlFormGenerator/FormInput.vue'
import { formElementProps } from '@/components/graphqlFormGenerator/mixins'
import { getNullValue } from '@/utils/aotf'
import { mdiPlusCircle, mdiCloseCircle } from '@mdi/js'

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

const model = defineModel({ type: Array, required: true })

const inputs = ref([])

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
  // this is not ideal, but I believe whats happening is the new (wrapper) component is created over the first tick from the new array item
  // the component content is created over the next tick (including the input)
  await nextTick()
  await nextTick()
  // get the latest input ref (which is a tooltip for some reason), get its parent, then the input itself and focus() it (if it exists)
  inputs.value[index].$el?.parentNode?.querySelector('input')?.focus()
}

/** Remove the item at `index` from the list. */
function remove (index) {
  model.value.splice(index, 1)
}

</script>
