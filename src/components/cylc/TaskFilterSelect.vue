<template>
<v-select
  :data-cy="'filter '+type"
  :items="items"
  clearable
  multiple
  :placeholder="'Filter by '+type"
  v-model="localValue.value.states"
>
<template v-slot:item="{ item, props }">
  <v-list-item v-bind="props" :title="undefined">
    <Workflowicon v-if="type==='workflow state'" :status=item.raw />
    <Task v-if="type==='task state'" :task="{ state: item.raw }" />
    <span class="ml-2">{{ item.raw }}</span>
  </v-list-item>
</template>
<template v-slot:selection="{ item, index }">
  <v-chip closable @click:close="removeItem(item.raw)" v-if="index >= 0 && index < maxVisibleStates">
    <template v-slot:prepend>
      <Workflowicon v-if="type==='workflow state'" :status=item.raw />
      <Task v-if="type==='task state'" :task="{ state: item.raw }" />
    </template>
    {{item.title}}

  </v-chip>
  <span
      v-if="index === maxVisibleStates"
      class="text-grey text-caption"
    >
      (+{{ localValue.value.states.length - maxVisibleStates }})
  </span>
</template>
</v-select>
</template>

<script setup>
import { computed, ref } from 'vue'
import Task from '@/components/cylc/Task.vue'
import Workflowicon from '@/components/cylc/gscan/WorkflowIcon.vue'

const props = defineProps({
  modelValue: Object, // { id, states }
  items: Array,
  type: Text
})

defineEmits(['update:modelValue'])

const localValue = ref()
localValue.value = computed(() => props.modelValue)

const maxVisibleStates = 4

function removeItem (key) {
  localValue.value.value.states = localValue.value.value.states.filter(item => item !== key)
}
</script>
