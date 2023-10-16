import { ref } from 'vue'

/**
 * Function for initialising, adding to and removing from local storage.
 * Values are stored in arrays with and can be accessed
 * via a key which specified by the 'key' parameter.
 * The local storage array is initialized with a value
 * specified by the 'initialValue' parameter.
 * Note: this could be replaced by a VueUse composable in the future
 * https://vueuse.org/core/useLocalStorage/
 *
 * @param {string} key
 * @param {*} initialValue
 * @returns {function}
 */
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
