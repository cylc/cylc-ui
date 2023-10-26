<template>
<v-select
  :data-cy="'filter '+type"
  :items="items"
  clearable
  multiple
  :placeholder="'Filter by '+type"
  v-model="localValue.states"
>
  <template v-slot:item="{ item, props }">
    <v-list-item v-bind="props" :title="undefined">
      <Workflowicon v-if="type==='workflow state'" :status=item.raw />
      <Task v-if="type==='task state'" :task="{ state: item.raw }" />
      <span class="ml-2">{{ item.raw }}</span>
    </v-list-item>
  </template>
  <template v-slot:selection="{ item, index }">
    <div class="mr-2" v-if="index >= 0 && index < $options.maxVisibleStates">
      <Workflowicon
        v-if="type==='workflow state'"
        :status=item.raw
        style="font-size: 1.2rem; height: 100%"
      />
      <Task
        v-if="type==='task state'"
        :task="{ state: item.raw }"
        style="font-size: 1.2rem; height: 100%"
      />
    </div>
    <span
      v-if="index === $options.maxVisibleStates"
      class="text-grey text-caption"
    >
      (+{{ localValue.states.length - $options.maxVisibleStates }})
    </span>
  </template>
</v-select>
</template>

<script>
import Task from '@/components/cylc/Task.vue'
import Workflowicon from '@/components/cylc/gscan/WorkflowIcon.vue'

export default {
  name: 'TaskFilter',

  components: {
    Task,
    Workflowicon
  },

  props: {
    modelValue: Object, // { id, states }
    items: Array,
    type: Text
  },

  computed: {
    localValue: {
      get () {
        return this.modelValue
      },
      set (value) {
        // Update 'modelValue' prop by notifying parent component's v-model for this component
        this.$emit('update:modelValue', value)
      }
    },
  },

  maxVisibleStates: 4,
}
</script>
