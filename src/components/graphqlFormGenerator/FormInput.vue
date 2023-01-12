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

<script>
import { h } from 'vue'
import { mask } from 'vue-the-mask'
import Markdown from '@/components/Markdown'
import { formElement } from '@/components/graphqlFormGenerator/mixins'
import VuetifyConfig, { getComponentProps } from '@/components/graphqlFormGenerator/components/vuetify'
import { mdiHelpCircleOutline } from '@mdi/js'
import { VIcon, VTooltip } from 'vuetify/components'
import { upperFirst } from 'lodash'

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
      const componentProps = getComponentProps(this.gqlType, VuetifyConfig.namedTypes, VuetifyConfig.kinds)

      // merge this in with default and override props
      const propGroups = [
        VuetifyConfig.defaultProps,
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

  render () {
    const createHelpIcon = () => h(
      VTooltip,
      { location: 'bottom' },
      {
        activator: ({ props }) => h(
          VIcon,
          {
            ...props,
            style: {
              cursor: 'default'
            }
          },
          () => mdiHelpCircleOutline
        ),
        default: () => h(Markdown, { markdown: this.help })
      }
    )

    // Some components implement custom v-model
    // (https://v2.vuejs.org/v2/guide/components-custom-events.html#Customizing-Component-v-model)
    const vModel = this.props.is.options?.model || { prop: 'modelValue', event: 'update:modelValue' }

    return h(
      this.props.is,
      {
        ...this.props,
        [vModel.prop]: this.model,
        [`on${upperFirst(vModel.event)}`]: (value) => {
          this.model = value
        },
        gqlType: this.gqlType,
        types: this.types
      },
      {
        'append-inner': createHelpIcon,
        // pass the "append" slot onto the child component
        append: (slotProps) => this.$slots.append?.(slotProps)
      }
    )
  }

}
</script>
