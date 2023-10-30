import { ref } from 'vue'

/**
 * @callback addToLocalStorage
 * @param {*} item Item to add to local storage
 * @return {void}
*/

/**
 * @callback removeFromLocalStorage
 * @param {*} item Item to remove from local storage
 * @return {void}
*/

/**
 * @typedef {Object} LocalStorage
 * @property {*} itemOnLoad - The default item on load
 * @property {import('vue').Ref} item - The selected item
 * @property {import('vue').Ref<Set>} items - The array of items in local storage
 * @property {addToLocalStorage} addToLocalStorage - Adds a value to local storage
 * @property {removeFromLocalStorage} removeFromLocalStorage - Removes a value from local storage
 */

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
 * @return {LocalStorage}
 */
export default function useLocalStorage (key, initialValue) {
  const itemOnLoad = initialValue
  const item = ref(itemOnLoad)
  const items = ref(new Set([itemOnLoad]))

  function addToLocalStorage (item) {
    if (item) {
      items.value.add(item)
      localStorage.setItem(key, JSON.stringify(Array.from(items.value)))
    }
  }
  function removeFromLocalStorage (item) {
    if (item) {
      items.value.delete(item)
      localStorage.setItem(key, JSON.stringify(Array.from(items.value)))
    }
  }

  return {
    itemOnLoad,
    item,
    items,
    addToLocalStorage,
    removeFromLocalStorage
  }
}
