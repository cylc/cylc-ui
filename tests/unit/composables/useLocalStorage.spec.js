import useLocalStorage from '@/composables/useLocalStorage.js'

describe('useLocalStorage composable', () => {
  const {
    items,
    addToLocalStorage,
    removeFromLocalStorage
  } = useLocalStorage('itemsLocalStoreKey', 'test initial item')

  localStorage.setItem('itemsLocalStoreKey', JSON.stringify(Array.from(items.value)))

  it('should add a value to the local store', () => {
    addToLocalStorage('test item')
    expect(Array.from(items.value)).toStrictEqual(['test initial item', 'test item'])
  })

  it('should remove a value to the local store', () => {
    removeFromLocalStorage('test item')
    expect(Array.from(items.value)).toStrictEqual(['test initial item'])
  })
})
