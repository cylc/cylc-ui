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

import { VSwitch } from 'vuetify/components/VSwitch'
import { VTextField } from 'vuetify/components/VTextField'

import GEnum from '@/components/graphqlFormGenerator/components/Enum.vue'
import GNonNull, { nonNullRule } from '@/components/graphqlFormGenerator/components/NonNull.vue'
import GList from '@/components/graphqlFormGenerator/components/List.vue'
import GObject from '@/components/graphqlFormGenerator/components/Object.vue'
import GBroadcastSetting from '@/components/graphqlFormGenerator/components/BroadcastSetting.vue'
import GMapItem from '@/components/graphqlFormGenerator/components/MapItem.vue'

const NumberFieldProps = {
  is: VTextField,
  type: 'number',
  modelModifiers: {
    number: true
  }
}

const RE = {
  cyclePoint: '\\d+(T\\d+(Z|[+-]\\d+)?)?'
}

export const RULES = {
  required: nonNullRule,
  integer:
    (x) => (!x || Number.isInteger(x)) || 'Must be integer',
  noSpaces:
    (x) => (!x || !x.includes(' ')) || 'Cannot contain spaces',
  /** Permit [a][b]c, a, [a]; Prohibit a[b], [b]a, a], ]a */
  cylcConfigItem:
    (x) => Boolean(!x || x.match(/^((\[[^=\]]+\])+)?([^[=\]-]+)?$/)) || 'Invalid',
  /** Permit 1/a; Prohibit a, 1 */
  taskID:
    (x) => Boolean(!x || x.match(/^(.){1,}\/(.){1,}$/)) || 'Invalid',
  flow:
    (x) => Boolean(!x || x.match(/(^\d+$|^(all|new|none)$)/)) || 'Invalid'
}

export const RUNTIME_SETTING = 'RuntimeSetting'

export default {
  defaultProps: {
    // default props for all form inputs
    variant: 'filled',
    density: 'compact',
    hideDetails: false,
  },

  namedTypes: {
    // registry of GraphQL "named types" (e.g. String)
    // {namedType: {is: ComponentClass, prop1: value, ...}}
    //
    // * GraphQL types *
    String: {
      is: VTextField
    },
    Int: {
      ...NumberFieldProps,
      rules: [
        RULES.integer
      ]
    },
    Float: {
      ...NumberFieldProps
    },
    Boolean: {
      is: VSwitch,
      color: 'primary',
      class: 'mx-3'
    },

    // * Cylc types *
    //
    WorkflowID: {
      is: VTextField,
      rules: [
        RULES.noSpaces
      ]
    },
    User: {
      is: VTextField,
      rules: [
        RULES.noSpaces
      ]
    },
    CyclePoint: {
      is: VTextField,
      rules: [
        RULES.noSpaces,
        // character whitelist
        x => Boolean(!x || x.match(`^${RE.cyclePoint}$`)) || 'Invalid Cycle Point'
      ]
    },
    CyclePointGlob: {
      is: VTextField,
      rules: [
        RULES.noSpaces,
        // character whitelist
        x => Boolean(!x || x.match(/^[\dT*]+$/)) || 'Invalid Cycle Point Glob'
      ]
    },
    BroadcastSetting: {
      is: GBroadcastSetting
    },
    BroadcastCyclePoint: {
      is: VTextField,
      rules: [
        x => Boolean(!x || x.match(`^(${RE.cyclePoint}|\\*)$`)) || 'Must be "*" or a valid cycle point'
      ]
    },
    // TaskStatus
    // TaskState
    TaskName: {
      is: VTextField,
      rules: [
        RULES.noSpaces
      ]
    },
    TaskID: {
      is: VTextField,
      placeholder: 'cycle/task',
      rules: [
        RULES.noSpaces,
        RULES.taskID
      ]
    },
    NamespaceName: {
      is: VTextField,
      rules: [
        RULES.noSpaces
      ]
    },
    NamespaceIDGlob: {
      is: VTextField,
      placeholder: 'cycle[/task][:status]',
      rules: [
        RULES.noSpaces
      ]
    },
    TimePoint: {
      is: VTextField,
      placeholder: 'yyyy-mm-ddThh:mm:ss',
      mask: '####-##-##T##:##:##',
      rules: [
        x => Boolean(!x || x.match(/^\d{4}(-\d{2}(-\d{2}(T\d{2}(:\d{2}(:\d{2})?)?)?)?)?$/)) || 'Invalid'
      ]
    },
    RuntimeConfiguration: {
      is: VTextField,
      placeholder: '[section]setting',
      rules: [
        RULES.cylcConfigItem
      ]
    },
    Flow: {
      is: VTextField,
      placeholder: 'flow number',
      rules: [
        RULES.flow
      ]
    },
    [RUNTIME_SETTING]: {
      is: GMapItem
    }
  },

  kinds: {
    // registry of GraphQL "kinds" (e.g. LIST)
    // { kind: (ofType) => ({ is: ComponentClass, prop1: value, ... }) }
    ENUM: (ofType) => ({
      is: GEnum
    }),
    NON_NULL: (ofType) => ({
      is: GNonNull
    }),
    LIST: (ofType) => ({
      is: GList,
      addAtStart: ofType?.name === RUNTIME_SETTING
    }),
    OBJECT: (ofType) => ({
      is: GObject // happy naming coincidence
    })
  }
}

export function getComponentProps (gqlType, namedTypes, kinds) {
  const { name, kind, ofType } = gqlType
  const ret = namedTypes[name] ?? kinds[kind]?.(ofType)
  if (ret) {
    return ret
  }
  console.warn(`Falling back to string for type: ${name}, kind: ${kind}`)
  return namedTypes.String
}
