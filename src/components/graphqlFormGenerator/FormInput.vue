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
  <v-tooltip
    bottom
    v-model="showHelp"
  >
    <!-- Note: tooltip activated by v-model so doesn't need `on` listeners -->
    <template v-slot:activator="{}">
      <!-- TODO: fix the inputType form alignment thinggy -->
      <!-- NOTE: the `is` field comes from `props` v-bind -->
      <!-- eslint-disable-next-line vue/require-component-is -->
      <component
        v-model="model"
        v-bind="props"
        v-mask="props.mask"
        :gqlType="gqlType"
        :types="types"
        @blur="showHelp = false"
      >
        <template v-slot:append>
          <v-icon
           @click="showHelp = !showHelp"
          >
            {{ $options.icons.mdiHelpCircleOutline }}
          </v-icon>
        </template>

        <template
          v-if="$options.vuetifyAppendOuterComponents.includes(props.is)"
          v-slot:append-outer
        >
          <!-- pass the "append-outer" slot onto the child component -->
          <!-- Note: unable to use scoped slot (i.e. v-slot:append-outer="slotProps")
          in Vuetify 2 because of https://github.com/vuetifyjs/vuetify/issues/10215 -->
          <slot name="append-outer"/>
        </template>
        <template
          v-else
          v-slot:append-outer="slotProps"
        >
          <slot
            name="append-outer"
            v-bind="slotProps"
          />
        </template>

      </component>
    </template>
    <Markdown :markdown="help" />
  </v-tooltip>
</template>

<script>
import { mask } from 'vue-the-mask'
import Markdown from '@/components/Markdown'
import { formElement } from '@/components/graphqlFormGenerator/mixins'
import VuetifyConfig, { getComponentProps } from '@/components/graphqlFormGenerator/components/vuetify'
import { mdiHelpCircleOutline } from '@mdi/js'
import { VTextarea, VTextField } from 'vuetify/lib/components'

export default {
  name: 'g-form-input',

  mixins: [formElement],

  components: {
    Markdown
  },

  directives: {
    mask: (el, binding) => {
      // only use the mask if one is provided, this allows us to use the
      // mask directive on elements which it doesn't support
      if (binding.value) {
        mask(el, binding)
      }
    }
  },

  props: {
    // dictionary of props for overriding default values
    propOverrides: {
      type: Object,
      default: () => { Object() }
    }
  },

  data: () => ({
    defaultProps: VuetifyConfig.defaultProps,
    namedTypes: VuetifyConfig.namedTypes,
    kinds: VuetifyConfig.kinds,
    showHelp: false
  }),

  computed: {
    /* The props to pass to the form input.
     *
     * Note, this includes the "is" prop which tells Vue which component class
     * to use.
     *
     * TODO: move to rule based system to allow changing
     *       of parent components based on child types?
     */
    props () {
      // get the default props for this graphQL type
      const componentProps = getComponentProps(this.gqlType, this.namedTypes, this.kinds)

      // merge this in with default and override props
      const propGroups = [
        this.defaultProps,
        componentProps,
        this.propOverrides || {}
      ]
      const ret = Object.assign({}, ...propGroups)

      // rules is a list so needs special treatment
      ret.rules = []
      for (const prop of propGroups) {
        if (prop.rules) {
          ret.rules.push(...prop.rules)
        }
      }

      return ret
    }
  },

  // Misc options:
  icons: {
    mdiHelpCircleOutline
  },
  vuetifyAppendOuterComponents: [
    VTextField, VTextarea
  ]
}
</script>
