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
  <v-chip
    v-if="showFlowNums"
    label
    density="compact"
    size="small"
    class="ml-1 cursor-default"
    :prepend-icon="mdiLabelOutline"
    data-cy="flow-num-chip"
  >
    {{ flowNumsStr }}
    <v-tooltip location="right">
      Flows: {{ flowNumsStr }}
    </v-tooltip>
  </v-chip>
</template>

<script setup>
import { formatFlowNums } from '@/utils/tasks'
import { mdiLabelOutline } from '@mdi/js'
import { computed } from 'vue'

const props = defineProps({
  flowNums: {
    type: String,
    required: false,
  },
})

const flowNumsStr = computed(
  () => props.flowNums && formatFlowNums(props.flowNums)
)

/** Hide flow=1 and flow=None by default */
const showFlowNums = computed(
  () => flowNumsStr.value && !['1', 'None'].includes(flowNumsStr.value)
)

</script>
