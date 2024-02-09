import { ref } from 'vue'

// options ref needs to be defined outside of export function to ensure
// state persists between components

const optionsArray = ref([])

export default function useViewState () {
  const options = {
    tree: {
      tasksFilter: { type: Object, value: { id: null, states: null } },
      expandAll: { type: Array, value: [] },
    },
    table: {
      tasksFilter: { type: Object, value: { id: null, states: null } },
    },
    graph: {},
    log: {},
    analysis: {}
  }
  const getOptions = (workflow) => optionsArray.value.find(obj => obj.workflow === workflow)
  const newOptions = (workflow) => optionsArray.value.push({ workflow, options })
  return {
    options,
    optionsArray,
    getOptions,
    newOptions
  }
}
