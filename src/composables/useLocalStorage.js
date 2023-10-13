import { ref } from 'vue'

export default function useLocalStorage (key, initialValue) {
  const itemOnLoad = initialValue
  const item = ref(itemOnLoad)
  const items = ref(new Set([itemOnLoad]))

  function addToLocalStorage (item) {
    items.value.add(item)
    localStorage.setItem(key, JSON.stringify(Array.from(items.value)))
  }
  function removeFromLocalStorage (item) {
    items.value.delete(item)
    localStorage.setItem(key, JSON.stringify(Array.from(items.value)))
  }

  return {
    itemOnLoad,
    item,
    items,
    addToLocalStorage,
    removeFromLocalStorage
  }
}
