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
  <div class="c-view-toolbar">
    <!-- control group -->
    <div
      class="group"
      v-for="iGroup in iGroups"
      :key="iGroup.title"
    >
      <!-- control -->
      <div
        v-for="iControl in iGroup.iControls"
        :key="iControl.title"
        class="control"
        :data-cy="`control-${iControl.key}`"
      >
        <!-- menu component (to support dropdowns) -->
        <v-menu
          eager
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ props }">
            <!-- inputs -->
            <v-text-field
              v-if="iControl.action === 'input'"
              v-model="iControl.value"
              class="input"
              v-bind="iControl.props"
              clearable
              :prepend-inner-icon="iControl.icon"
              @update:modelValue="iControl.callback"
              @focus="autoResizeInput"
              @blur="autoResizeInput"
            />

            <!-- buttons -->
            <v-btn
              v-else
              class="control-btn"
              v-bind="{...$attrs, ...props, ...btnProps}"
              @click="(e) => {iControl.action === 'menu' ? null : iControl.callback(e)}"
              :disabled="iControl.disabled"
              :aria-checked="iControl.value"
              :color="isSet(iControl.value) ? 'blue' : undefined"
              role="switch"
              density="compact"
            >
              <v-icon>{{ iControl.icon[iControl.value] || iControl.icon }}</v-icon>
              <v-tooltip>{{ iControl.title }}</v-tooltip>
            </v-btn>
          </template>

          <!-- dropdowns -->
          <v-card
            v-if="iControl.action === 'menu'"
          >
            <v-btn
              :prepend-icon="$options.icons.mdiUndo"
              variant="plain"
              @click="iControl.callback([])"
              block
              spaced="end"
              :data-cy="`control-${iControl.key}-reset`"
            >
              Reset
            </v-btn>
            <v-divider></v-divider>

            <v-treeview
              v-bind="iControl.props"
              v-model:activated="iControl.value"
              @update:activated="iControl.callback"
              color="blue"
              density="compact"
              style="padding-top: 0;"
            >
              <!-- task icons (for task state filters -->
              <template
                v-slot:prepend="{ item }"
                v-if="iControl.props['task-state-icons']"
              >
                <Task :task="item.taskProps" />
              </template>
            </v-treeview>
          </v-card>
        </v-menu>
      </div>
    </div>
  </div>
</template>

<script>
import { btnProps, taskStateItems } from '@/utils/viewToolbar'
import Task from '@/components/cylc/Task.vue'
import {
  mdiFilter,
  mdiMagnify,
  mdiUndo,
} from '@mdi/js'
import { TaskState, WaitingStateModifierNames } from '@/model/TaskState.model'

export default {
  name: 'ViewToolbar',

  emits: [
    'setOption'
  ],

  components: {
    Task
  },

  icons: {
    mdiUndo,
  },

  props: {
    groups: {
      required: true,
      type: Array,
      /*
        groups: [
          {
            // display name
            title: String,
            // list of controls in this group
            controls: [
              {
                // display name
                title: String,

                // unique key:
                // * Provided with "setOption" events.
                // * Used by enableIf/disableIf
                // * Added to the control's class list for testing.
                key: String

                // icon for the control:
                // * Either an icon.
                // * Or a mapping of state to an icon.
                // NOTE: this is autopopulated for action="taskStateFilter | taskIDFilter"
                icon: Icon | Object[key, Icon]

                // action to perform when clicked:
                // Generic actions:
                // * toggle - toggle true/false
                // * callback - call the provided callback
                // * menu - open a menu (provide props: {items} in v-treeview format)
                // Specialised actions:
                // * taskIDFilter - Search box for task IDs
                // * taskStateFilter - open a task state filter menu
                action: String

                // for use with action='callback'
                callback: Fuction

                // props to be set on the control
                props: Object

                // list of keys
                // only enable this control if all of the listed controls have
                // truthy values
                enableIf

                // list of keys
                // disable this control if any of the listed controls have
                // truthy values
                disableIf
              }
            ]
          }
        ]
      */
    },
    /** Button size in px or vuetify named size */
    size: {
      type: String,
      default: 'default',
    }
  },

  computed: {
    iGroups () {
      // wrap the provided props into something we can mutate with derived
      // parameters
      const ret = []
      let iGroup
      let iControl
      let callback // callback to fire when control is activated
      let disabled // true if control should not be enabled
      let props
      let action
      const values = this.getValues()
      for (const group of this.groups) {
        iGroup = {
          ...group,
          iControls: []
        }
        for (const control of group.controls) {
          callback = null
          disabled = false
          props = control.props || {}
          action = control.action

          // set callback
          switch (action) {
            case 'toggle': // toggle button
              callback = (e) => this.toggle(control, e)
              break
            case 'callback': // button which actions a callback
              callback = (e) => this.call(control, e)
              break
            case 'taskIDFilter': // specialised "input" for filtering tasks
              callback = (value) => this.set(control, value)
              control.icon = mdiMagnify
              action = 'input'
              props = {
                placeholder: 'Search',
                ...props,
              }
              break
            case 'input': // text input
              callback = (value) => this.set(control, value)
              break
            case 'taskStateFilter': // specialised "menu" for filtering tasks
              action = 'menu'
              control.icon = mdiFilter
              props = {
                items: taskStateItems,
                'indent-lines': true,
                activatable: true,
                'active-strategy': 'independent',
                'item-value': 'value',
                'task-state-icons': true, // flag to enable special slots
                ...props,
              }
              callback = (value) => this.set(control, value)
              break
          }

          // set disabled
          for (const enableIf of control.enableIf || []) {
            if (!values[enableIf]) {
              disabled = true
              break
            }
          }
          for (const disableIf of control.disableIf || []) {
            if (values[disableIf]) {
              disabled = true
              break
            }
          }

          iControl = {
            ...control,
            action,
            props,
            callback,
            disabled
          }
          iGroup.iControls.push(iControl)
        }
        ret.push(iGroup)
      }
      return ret
    },
    btnProps () {
      return btnProps(this.size)
    }
  },

  methods: {
    toggle (control, e) {
      // toggle a boolean value
      // NOTE: undefined is falsy
      control.value = !control.value
      this.$emit('setOption', control.key, control.value)
      e.currentTarget.blur()
    },
    call (control, e) {
      // call a control's callback
      control.callback()
      e.currentTarget.blur()
    },
    getValues () {
      // an object with all defined values
      const vars = {}
      for (const group of this.groups) {
        for (const control of group.controls) {
          if (control.key) {
            vars[control.key] = control.value
          }
        }
      }
      return vars
    },
    set (control, value) {
      // update the value
      if ( // special logic for the taskStateFilter
        control.action === 'taskStateFilter' &&
        // if a waiting state modifier is selected
        value.some((modifier) => WaitingStateModifierNames.includes(modifier)) &&
        // but the waiting state is not
        !value.includes(TaskState.WAITING.name)
      ) {
        // then add the waiting state (i.e, don't allow the user to de-select
        // waiting whilst a modifier is in play)
        value.push(TaskState.WAITING.name)
      }
      this.$emit('setOption', control.key, value)
    },
    autoResizeInput (e) {
      // enlarge a text input when focused or containing text
      if (e.type === 'focus') {
        e.target.classList.add('expanded')
      } else {
        if (e.target.value) {
          e.target.classList.add('expanded')
        } else {
          e.target.classList.remove('expanded')
        }
      }
    },
    isSet (value) {
      // determine if a control is active or not
      if (Array.isArray(value)) {
        return value.length
      }
      return value
    }
  }
}
</script>

<style lang="scss">
  .c-view-toolbar {
    display: flex;

    .group {
      display: flex;
      align-items: center;

      $spacing: 0.5rem;

      &:not(:first-child):before {
        // place a divider between groups
        content: '';
        height: 70%;
        width: 0.15em;
        border-radius: 0.15em;
        background: rgb(0, 0, 0, 0.18);
        // put a bit of space between the groups
        margin: 0 $spacing;
      }

      // pack buttons more tightly than the vuetify default
      .control-btn {
        margin: 0.4em 0.25em 0.4em 0.25em;
      }

      // auto expand/collapse the search bar
      .input {
        width: 8em;
      }
      .input:has(input.expanded) {
        width: 20em;
      }
    }
  }
</style>
