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
  <div
    class="c-view-toolbar"
    :style="{ fontSize }"
  >
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
        <v-btn
          icon
          variant="text"
          :disabled="iControl.disabled"
          :color="iControl.color"
          @click="iControl.callback"
          :size="size"
        >
          <v-icon>{{ iControl.icon }}</v-icon>
          <v-tooltip>{{ iControl.title }}</v-tooltip>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ViewToolbar',

  emits: [
    'setOption'
  ],

  props: {
    groups: {
      required: true,
      type: Array
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
                // action to perform when clicked:
                // * toggle - toggle true/false
                // * callback - call the provided callback
                action: String
                // for use with action='callback'
                callback: Fuction
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
      let color // control color
      let callback // callback to fire when control is activated
      let disabled // true if control should not be enabled
      const values = this.getValues()
      for (const group of this.groups) {
        iGroup = {
          ...group,
          iControls: []
        }
        for (const control of group.controls) {
          color = null
          callback = null
          disabled = false

          // set callback and color
          switch (control.action) {
            case 'toggle':
              callback = (e) => this.toggle(control, e)
              if (control.value) {
                color = 'blue'
              }
              break
            case 'callback':
              callback = (e) => this.call(control, e)
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
            color,
            callback,
            disabled
          }
          iGroup.iControls.push(iControl)
        }
        ret.push(iGroup)
      }
      return ret
    },
    /**
     * Scale icon size to button size.
     * https://github.com/vuetifyjs/vuetify/issues/16288
     *
     * @returns {string=} font size
     */
    fontSize () {
      const size = parseInt(this.size)
      if (Number.isNaN(size)) {
        // do nothing for named sizes ('small', 'large', etc.)
        return undefined
      }
      // Round to even px then convert to rem
      return `${2 * Math.round(0.2 * size) / 16}rem`
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
        width: 2px;
        background: rgb(0, 0, 0, 0.22);
        // put a bit of space between the groups
        margin: 0 $spacing;
      }
    }
  }
</style>
