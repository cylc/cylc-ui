import { ref } from 'vue'

// options ref needs to be defined outside of export function to ensure
// state persists between components
const options = ref({
  tree: {
    tasksFilter: { type: Object, value: { id: null, states: null } },
    expandAll: { type: Array, value: [] },
  },
  table: {},
  graph: {},
  log: {},
  analysis: {}
})

export default function useViewState () {
  return {
    options,
  }
}
