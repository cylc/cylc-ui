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

<!-- Form input component for "key = value" pair -->

<template>
  <v-row
    class="c-key-val"
    dense
    no-gutters
  >
    <v-col cols="4">
      <v-tooltip v-bind="tooltipProps">
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-text-field
              placeholder="key"
              v-model="value.key"
              :disabled="value.frozenKey"
              dense
              filled
              class="c-input-key"
            />
          </div>
        </template>
        <span>Pre-existing settings cannot be renamed</span>
      </v-tooltip>
    </v-col>
    <v-col cols="auto">
      <span>=</span>
    </v-col>
    <v-col>
      <v-text-field
        placeholder="value"
        v-model="value.value"
        dense
        filled
        class="c-input-val"
      />
    </v-col>
    <v-col cols="auto">
      <v-tooltip v-bind="tooltipProps">
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <slot
              name="append-outer"
              :disabled="value.frozenKey"
            />
          </div>
        </template>
        <span>Pre-existing settings cannot be removed</span>
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script>
import { formElement } from '@/components/graphqlFormGenerator/mixins'

export default {
  name: 'g-map-item',

  mixins: [formElement],

  computed: {
    tooltipProps() {
      return {
        top: true,
        disabled: !this.value.frozenKey,
        openDelay: 400,
      }
    },
  },
}
</script>
