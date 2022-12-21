/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Vue from 'vue'

import { VTextField } from 'vuetify/lib/components/VTextField'
import { VSwitch } from 'vuetify/lib/components/VSwitch'

import GEnum from '@/components/graphqlFormGenerator/components/Enum'
import GNonNull from '@/components/graphqlFormGenerator/components/NonNull'
import GList from '@/components/graphqlFormGenerator/components/List'
import GObject from '@/components/graphqlFormGenerator/components/Object'
import GBroadcastSetting from '@/components/graphqlFormGenerator/components/BroadcastSetting'
import GMapItem from '@/components/graphqlFormGenerator/components/MapItem'

/* Vuetify number input component.
 *
 * Note: Vuetify doesn't supply a dedicated number field, instead you
 *       specialise the text field using `type='number'`, this, however,
 *       does not cast values to `Number` for you so this extension parses
 *       values to `Number` so they can be used directly in the data model.
 */
export const VNumberField = Vue.component('v-number-field', {
  extends: VTextField,
  computed: {
    internalValue: {
      get() {
        return this.lazyValue
      },
      set(val) {
        // cast values on `set` operations, note this does not get
        // called on creation
        this.lazyValue = Number(val)
        this.$emit('input', this.lazyValue)
      },
    },
  },
  props: {
    type: {
      default: 'number',
    },
  },
})

const RE = {
  cyclePoint: '\\d+(T\\d+(Z|[+-]\\d+)?)?',
}

const RULES = {
  integer: (x) => !x || Number.isInteger(x) || 'Must be integer',
  noSpaces: (x) => !x || !x.includes(' ') || 'Cannot contain spaces',
  cylcConfigItem:
    // PERMIT [a][b]c, a, [a] PROHIBIT a[b], [b]a, a], ]a
    (x) =>
      Boolean(!x || x.match(/^((\[[^=\]]+\])+)?([^[=\]-]+)?$/)) || 'Invalid',
  taskID:
    // PERMIT 1/a PROHIBIT a, 1
    (x) => Boolean(!x || x.match(/^(.){1,}\/(.){1,}$/)) || 'Invalid',
  flow: (x) => Boolean(!x || x.match(/(^\d+$|^(all|new|none)$)/)) || 'Invalid',
}

export const RUNTIME_SETTING = 'RuntimeSetting'

export default {
  defaultProps: {
    // default props for all form inputs
    filled: true,
    dense: true,
  },

  namedTypes: {
    // registry of GraphQL "named types" (e.g. String)
    // {namedType: {is: ComponentClass, prop1: value, ...}}
    //
    // * GraphQL types *
    String: {
      is: VTextField,
    },
    Int: {
      is: VNumberField,
      rules: [RULES.integer],
    },
    Float: {
      is: VNumberField,
    },
    Boolean: {
      is: VSwitch,
      color: 'blue darken-3',
    },

    // * Cylc types *
    //
    WorkflowID: {
      is: VTextField,
      rules: [RULES.noSpaces],
    },
    User: {
      is: VTextField,
      rules: [RULES.noSpaces],
    },
    CyclePoint: {
      is: VTextField,
      rules: [
        RULES.noSpaces,
        // character whitelist
        (x) =>
          Boolean(!x || x.match(`^${RE.cyclePoint}$`)) || 'Invalid Cycle Point',
      ],
    },
    CyclePointGlob: {
      is: VTextField,
      rules: [
        RULES.noSpaces,
        // character whitelist
        (x) =>
          Boolean(!x || x.match(/^[\dT*]+$/)) || 'Invalid Cycle Point Glob',
      ],
    },
    BroadcastSetting: {
      is: GBroadcastSetting,
    },
    BroadcastCyclePoint: {
      is: VTextField,
      rules: [
        (x) =>
          Boolean(!x || x.match(`^(${RE.cyclePoint}|\\*)$`)) ||
          'Must be "*" or a valid cycle point',
      ],
    },
    // TaskStatus
    // TaskState
    TaskName: {
      is: VTextField,
      rules: [RULES.noSpaces],
    },
    TaskID: {
      is: VTextField,
      placeholder: 'cycle/task',
      rules: [RULES.noSpaces, RULES.taskID],
    },
    NamespaceName: {
      is: VTextField,
      rules: [RULES.noSpaces],
    },
    NamespaceIDGlob: {
      is: VTextField,
      placeholder: 'cycle[/task][:status]',
      rules: [RULES.noSpaces],
    },
    TimePoint: {
      is: VTextField,
      placeholder: 'yyyy-mm-ddThh:mm:ss',
      mask: '####-##-##T##:##:##',
      rules: [
        (x) =>
          Boolean(
            !x ||
              x.match(/^\d{4}(-\d{2}(-\d{2}(T\d{2}(:\d{2}(:\d{2})?)?)?)?)?$/)
          ) || 'Invalid',
      ],
    },
    RuntimeConfiguration: {
      is: VTextField,
      placeholder: '[section]setting',
      rules: [RULES.cylcConfigItem],
    },
    Flow: {
      is: VTextField,
      placeholder: 'flow number',
      rules: [RULES.flow],
    },
    [RUNTIME_SETTING]: {
      is: GMapItem,
    },
  },

  kinds: {
    // registry of GraphQL "kinds" (e.g. LIST)
    // { kind: (ofType) => ({ is: ComponentClass, prop1: value, ... }) }
    ENUM: (ofType) => ({
      is: GEnum,
    }),
    NON_NULL: (ofType) => ({
      is: GNonNull,
    }),
    LIST: (ofType) => ({
      is: GList,
      addAtStart: ofType?.name === RUNTIME_SETTING,
    }),
    OBJECT: (ofType) => ({
      is: GObject, // happy naming coincidence
    }),
  },
}

export function getComponentProps(gqlType, namedTypes, kinds) {
  const { name, kind, ofType } = gqlType
  const ret = namedTypes[name] ?? kinds[kind]?.(ofType)
  if (ret) {
    return ret
  }
  // eslint-disable-next-line no-console
  console.warn(`Falling back to string for type: ${name}, kind: ${kind}`)
  return namedTypes.String
}
