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
  <v-chip size="x-small" v-bind="props">{{ level }}</v-chip>
</template>

<script>
export default {
  name: 'LogLevelChip',

  props: {
    level: {
      type: String,
      required: true,
    },
  },

  computed: {
    props () {
      if (this.level === 'CRITICAL') {
        return { color: 'red', variant: 'flat' }
      }
      if (this.level === 'ERROR') {
        return { color: 'red-darken-4', variant: 'flat' }
      }
      if (this.level === 'WARNING') {
        return { color: 'amber-darken-4', variant: 'flat' }
      }
      if (this.level === 'INFO') {
        return { color: 'grey', variant: 'flat' }
      }
      return { color: 'grey', variant: 'outlined' }
    }
  }
}
</script>
