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
  <div>
    <pre><span v-for="(log, index) in logs" :key="index">{{log}}</span></pre>
  </div>
</template>

<script>

export default {
  name: 'LogComponent',
  props: {
    placeholder: {
      type: String,
      default: 'Waiting for logs',
      required: false
    },
    logs: {
      type: Array,
      required: true
    }
  },
  computed: {
    computedLogs () {
      if (this.logs.length > 0) {
        return this.logs
      } else {
        return [this.placeholder]
      }
    }
  }
}

</script>
