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
        class="control"
        v-for="iControl in iGroup.iControls"
        :key="iControl.title"
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              large
              :disabled="iControl.disabled"
              :color="iControl.color"
              @click="iControl.callback"
              v-on="on"
              v-bind="attrs"
            >
              {{ iControl.icon }}
            </v-icon>
          </template>
          <span>{{ iControl.title }}</span>
        </v-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    groups: {
      required: true,
      type: Array
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
    }
  },
  methods: {
    toggle (control, e) {
      // toogle a boolean value
      // NOTE: undefined is interpreted is false
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
    }
  }
}
</script>

<style lang="scss">
  .c-view-toolbar {
    padding: 0.5rem 0 0.5rem 0;

    .group {
      padding-right: 0.5rem;
      display: inline-block;

      .control {
        padding: 0 0 0 0.5rem;
        display: inline-block;
      }
    }
  }
</style>
