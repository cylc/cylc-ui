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

const styles = new Map([
  ['this is a debug message', { bg: 'blue', text: 'white', weight: 'normal' }],
  ['this is a info message', { bg: 'grey', text: 'white', weight: 'normal' }],
  ['this is a warning message', { bg: 'yellow', text: 'black', weight: 'normal' }],
  ['this is an error message', { bg: 'red', text: 'white', weight: 'normal' }],
  ['this is a critical message', { bg: 'red lighten-2', text: 'black', weight: 'bold' }],
])

const getStyle = computed(() => {
  return styles.get(props.level) || { bg: 'grey  lighten-2', text: 'white', weight: 'normal' }
})

</script>
