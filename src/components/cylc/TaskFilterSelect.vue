<template>
  <v-select
    :items="items"
    clearable
    multiple
    v-model="localValue"
  >
    <template #prepend-item>
      <v-list-item
        @click="selectAll"
      >
        Select All
      </v-list-item>
    </template>

    <template #item="{ item, props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <div class="mr-4">
            <Workflowicon
              v-if="type === 'workflow state'"
              :status="item.raw"
            />
            <Task
              v-if="type === 'task state'"
              :task="{ state: item.raw }"
            />
          </div>
        </template>
      </v-list-item>
    </template>
    <template #selection="{ item, index }">
      <v-chip
        v-if="index < maxVisibleStates"
        closable
        @click:close="removeItem(item.raw)"
        size="small"
        :close-icon="mdiClose"
      >
        <template #prepend>
          <div class="mr-1 ml-n1">
            <Workflowicon
              v-if="type === 'workflow state'"
              :status="item.raw"
            />
            <Task
              v-if="type === 'task state'"
              :task="{ state: item.raw }"
            />
          </div>
        </template>
        {{ item.title }}
      </v-chip>
      <span
        v-if="index === maxVisibleStates"
        class="text-grey text-caption"
      >
        (+{{ localValue.length - maxVisibleStates }})
      </span>
    </template>
  </v-select>
</template>

<script setup>
import { computed } from 'vue'
import { mdiClose } from '@mdi/js'
import Task from '@/components/cylc/Task.vue'
import Workflowicon from '@/components/cylc/gscan/WorkflowIcon.vue'

const props = defineProps({
  /** Array of selected states */
  modelValue: {
    type: Array,
    default: () => [],
  },
  items: {
    type: Array,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const localValue = computed({
  get () {
    return props.modelValue
  },
  set (val) {
    emit('update:modelValue', val)
  }
})

const maxVisibleStates = 4

function removeItem (key) {
  localValue.value = localValue.value.filter(item => item !== key)
}

function selectAll () {
  localValue.value = props.items
}
</script>
