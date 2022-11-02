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
import { mask } from 'vue-the-mask'
import Markdown from '@/components/Markdown'
import { formElement } from '@/components/graphqlFormGenerator/mixins'
import VuetifyConfig, { getComponentProps } from '@/components/graphqlFormGenerator/components/vuetify'
import { mdiHelpCircleOutline } from '@mdi/js'
import { VIcon, VTooltip } from 'vuetify/lib/components'

/**
 * Workaround Vuetify (v2) component issue where non-scoped slots would not appear in
 * this.$scopedSlots, preventing the slot from rendering.
 *
 * Taken from https://stackoverflow.com/a/67412844/3217306
 *
 * @param fn - Function meant for the value of slot in the data-object's "scopedSlots"
 */
function vuetifyScopedSlotShim (fn) {
  fn.proxy = true
  return fn
}

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

  render (createElement) {
    // https://v2.vuejs.org/v2/guide/render-function.html

    const createHelpIcon = () => createElement(
      VTooltip,
      {
        props: {
          bottom: true
        },
        scopedSlots: {
          activator: ({ on }) => createElement(
            VIcon,
            {
              on,
              style: {
                cursor: 'default'
              }
            },
            [mdiHelpCircleOutline]
          ),
          default: () => createElement(
            Markdown,
            {
              props: {
                markdown: this.help
              }
            }
          )
        }
      }
    )

    // Some components implement custom v-model
    // (https://v2.vuejs.org/v2/guide/components-custom-events.html#Customizing-Component-v-model)
    const vModel = this.props.is.options?.model || { prop: 'value', event: 'input' }

    return createElement(
      this.props.is,
      {
        props: {
          ...this.props,
          [vModel.prop]: this.model,
          gqlType: this.gqlType,
          types: this.types
        },
        on: {
          [vModel.event]: (value) => {
            this.model = value
          }
        },
        scopedSlots: {
          append: vuetifyScopedSlotShim(
            createHelpIcon
          ),
          'append-outer': vuetifyScopedSlotShim(
            // pass the "append-outer" slot onto the child component
            (slotProps) => this.$scopedSlots['append-outer']?.(slotProps)
          )
        }
      }
    )
  }

}
</script>
