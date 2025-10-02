<template>
  <v-select
    :items="items"
    clearable
    multiple
    v-model="model"
  >
    <template #prepend-item>
      <v-select-actions>
        <v-btn
          @click="selectAll()"
          data-cy="task-filter-select-all"
        >
          Select All
        </v-btn>
      </v-select-actions>
      <v-divider/>
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
        @click:close="removeItem(index)"
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
        (+{{ model.length - maxVisibleStates }})
      </span>
    </template>
  </v-select>
</template>

<script setup>
import { mdiClose } from '@mdi/js'
import Task from '@/components/cylc/Task.vue'
import Workflowicon from '@/components/cylc/gscan/WorkflowIcon.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
})

/** Array of selected states */
const model = defineModel({ type: Array })

const maxVisibleStates = 4

function removeItem (index) {
  model.value.splice(index, 1)
}

function selectAll () {
  model.value = props.items
}
</script>
