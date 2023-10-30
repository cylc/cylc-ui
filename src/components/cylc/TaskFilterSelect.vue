<template>
  <v-select
    :label="`Filter by ${type}`"
    :data-cy="`filter ${type}`"
    :items="items"
    clearable
    multiple
    :placeholder="`Filter by ${type}`"
    class="mt-2"
    v-model="localValue.states"
  >
    <template #item="{ item, props }">
      <v-list-item
        v-bind="props"
        :title="undefined"
      >
        <Workflowicon
          v-if="type==='workflow state'"
          :status="item.raw"
        />
        <Task
          v-if="type==='task state'"
          :task="{ state: item.raw }"
        />
        <span class="ml-2">{{ item.raw }}</span>
      </v-list-item>
    </template>
    <template #selection="{ item, index }">
      <v-chip
        closable
        @click:close="removeItem(item.raw)"
        v-if="index >= 0 && index < maxVisibleStates"
      >
        <template #prepend>
          <Workflowicon
            v-if="type==='workflow state'"
            :status="item.raw"
          />
          <Task
            v-if="type==='task state'"
            :task="{ state: item.raw }"
          />
        </template>
        {{ item.title }}
      </v-chip>
      <span
        v-if="index === maxVisibleStates"
        class="text-grey text-caption"
      >
        (+{{ localValue.states.length - maxVisibleStates }})
      </span>
    </template>
  </v-select>
</template>

<script setup>
import { computed } from 'vue'
import Task from '@/components/cylc/Task.vue'
import Workflowicon from '@/components/cylc/gscan/WorkflowIcon.vue'

const props = defineProps({
  modelValue: { type: Object, required: true }, // { id, states }
  items: { type: Array, required: true },
  type: { type: String, required: true },
})

defineEmits(['update:modelValue'])

const localValue = computed(() => props.modelValue)

const maxVisibleStates = 4

function removeItem (key) {
  localValue.value.states = localValue.value.states.filter(item => item !== key)
}
</script>
