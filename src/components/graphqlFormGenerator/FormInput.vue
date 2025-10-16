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

<!--
This is a convenience component that wraps an input component, allowing
dynamically created inputs.
-->

<template>
  <component
    :is="inputProps.is"
    v-bind="inputProps"
    v-model="model"
    :gqlType="gqlType"
    :types="types"
    v-mask="inputProps.mask"
  >
    <template
      v-if="help"
      v-slot:append-inner
    >
      <v-tooltip>
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            style="cursor: default"
            :icon="mdiHelpCircleOutline"
          />
        </template>
        <Markdown :markdown="help" />
      </v-tooltip>
    </template>
    <!-- pass the "append" slot onto the child component -->
    <template v-slot:append="slotProps">
      <slot
        name="append"
        v-bind="slotProps"
      />
    </template>
  </component>
</template>

<script setup>
import { mergeProps, useAttrs } from 'vue'
import { mask } from 'vue-the-mask'
import Markdown from '@/components/Markdown.vue'
import { formElementProps, useFormElement } from '@/components/graphqlFormGenerator/mixins'
import VuetifyConfig, { getComponentProps } from '@/components/graphqlFormGenerator/components/vuetify'
import { mdiHelpCircleOutline } from '@mdi/js'
import { VIcon } from 'vuetify/components/VIcon'
import { VTooltip } from 'vuetify/components/VTooltip'

defineOptions({
  // Prevent fallthrough attrs overriding the supplied props for the input
  // https://github.com/vuejs/core/issues/6504
  inheritAttrs: false,
})

const attrs = useAttrs()

const vMask = (el, binding) => {
  // only use the mask if one is provided, this allows us to use the
  // mask directive on elements which it doesn't support
  if (binding.value) {
    mask(el, binding)
  }
}

const props = defineProps({
  ...formElementProps,
  // dictionary of props for overriding default values
  propOverrides: {
    type: Object,
    default: () => ({})
  }
})

const model = defineModel()

// Set the props to pass to the form input. Note, this includes the "is"
// prop which tells Vue which component class to use.
// TODO: move to rule based system to allow changing
//       of parent components based on child types?

// get the default props for this graphQL type
const componentProps = getComponentProps(props.gqlType, VuetifyConfig.namedTypes, VuetifyConfig.kinds)

// merge this in with default and override props
const propGroups = [
  componentProps,
  props.propOverrides || {}
]
// rules is a list so needs special treatment
const rules = propGroups.flatMap(({ rules }) => rules ?? [])

const inputProps = mergeProps(attrs, ...propGroups, { rules })

const { help } = useFormElement(props)
</script>
