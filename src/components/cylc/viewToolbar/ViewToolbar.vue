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
    <v-defaults-provider :defaults="vuetifyDefaults">
      <div
        class="group"
        v-for="(slot, name) in $slots"
        :key="name"
      >
        <slot :name="name"/>
      </div>
    </v-defaults-provider>
  </div>
</template>

<script setup>
import { activeColor } from './util'

const vuetifyDefaults = {
  VBtn: {
    size: 40,
    variant: 'text',
    density: 'compact',
    rounded: 'lg',
  },
  VBtnToggle: {
    divided: true,
    variant: 'outlined',
    color: activeColor,
    density: 'comfortable',
    VBtn: {
      size: 'default',
      rounded: 'default',
    },
  },
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

      > :not(button + button):not(:first-child) {
        margin-left: $spacing;
      }
    }
  }
</style>
