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
      <template
        v-for="(slot, name) in $slots"
        :key="name"
      >
        <slot v-if="name === 'default'"/>
        <div v-else class="group">
          <slot :name="name"/>
        </div>
      </template>
    </v-defaults-provider>
  </div>
</template>

<script setup>
import { activeColor } from './util'

const height = 40

const vuetifyDefaults = {
  VBtn: {
    size: height,
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
    align-items: center;

    $spacing: 0.5rem;

    .group {
      display: flex;
      align-self: stretch;
      align-items: center;

      &:not(:first-child)::before {
        // place a divider between groups
        content: '';
        // height: calc(0.7px * v-bind(height))
        height: 70%;
        width: 0.15em;
        border-radius: 0.15em;
        background: rgb(0, 0, 0, 0.18);
        // put a bit of space between the groups
        margin: 0 $spacing;
      }
    }

    >, .group > {
      .v-input, .v-btn-group {
        // add spacing after certain elements
        &:not(:last-child) {
          margin-right: $spacing;
        }
      }
    }
  }
</style>
