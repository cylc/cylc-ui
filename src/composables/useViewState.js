import { ref } from 'vue'

// options ref needs to be defined outside of export function to ensure
// state persists between components
const options = ref({
  tree: {},
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
