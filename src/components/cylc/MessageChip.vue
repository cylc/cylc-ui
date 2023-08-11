<template>
  <div>
    <v-tooltip>
      <template v-slot:activator="{ props }">
        <v-chip
          v-bind="props"
          :class="`bg-${getStyle.bg} text-${getStyle.text} font-weight-${getStyle.weight}`"
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

<script>
export default {
  name: 'MessageChip',
  props: {
    level: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isMessage: {
      type: String,
      required: true
    }
  },
  computed: {
    getStyle () {
      if (this.level === 'this is a debug message') {
        return { bg: 'blue', text: 'white', weight: 'normal' }
      }
      if (this.level === 'this is a info message') {
        return { bg: 'grey', text: 'white', weight: 'normal' }
      }
      if (this.level === 'this is a warning message') {
        return { bg: 'yellow', text: 'black', weight: 'normal' }
      }
      if (this.level === 'this is an error message') {
        return { bg: 'red', text: 'white', weight: 'normal' }
      }
      if (this.level === 'this is a critical message') {
        return { bg: 'red lighten-2', text: 'black', weight: 'bold' }
      } else { return { bg: 'grey', text: 'black', weight: 'normal' } }
    }
  }
}

</script>
