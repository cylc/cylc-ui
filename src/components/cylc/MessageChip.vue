<template>
  <div>
    <v-tooltip :activator="null">
      <template v-slot:activator="{ props }">
        <v-chip
          v-bind="props"
          :class="chipClass"
          class="ml-2 message-output"
          size="small"
        >
          {{ level }}
        </v-chip>
      </template>
      <span>{{ message }}</span>
    </v-tooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  level: String,
  message: String,
  isMessage: Boolean
})

const classMap = new Map([
  ['this is a debug message', ''],
  ['this is a info message', 'bg-grey'],
  ['this is a warning message', 'bg-warning'],
  ['this is an error message', 'bg-error'],
  ['this is a critical message', 'bg-black font-weight-bold'],
])

const chipClass = computed(() => (
  classMap.get(props.level) ?? (props.isMessage ? 'bg-grey-lighten-5' : 'bg-grey')
))

</script>
