import { expect } from 'chai'
import store from '@/store'
import Alert from '@/model/Alert.model'

describe('store', () => {
  beforeEach(() => {
    store.dispatch('setAlert', null)
  })
  describe('alerts', () => {
    it('should start with no alert', () => {
      expect(store.state.alert).to.equal(null)
    })
    it('should set alert', () => {
      store.dispatch('setAlert', new Alert('my-alert', '', ''))
      expect(store.state.alert.getText()).to.equal('my-alert')
      // repeating an alert with same text does not change anything
      store.dispatch('setAlert', new Alert('my-alert', '', ''))
      expect(store.state.alert.getText()).to.equal('my-alert')
      // but if the text is different, it will use the new value
      store.dispatch('setAlert', new Alert('my-alert-2', '', ''))
      expect(store.state.alert.getText()).to.equal('my-alert-2')
      // and we can reset the state
      store.dispatch('setAlert', null)
      expect(store.state.alert).to.equal(null)
    })
  })
  describe('loading', () => {
    it('should start with loading false', () => {
      expect(store.state.isLoading).to.equal(false)
      expect(store.state.refCount).to.equal(0)
    })
    it('should update refCount correctly', () => {
      expect(store.state.refCount).to.equal(0)
      store.dispatch('setLoading', true)
      store.dispatch('setLoading', true)
      expect(store.state.refCount).to.equal(2)
      store.dispatch('setLoading', false)
      expect(store.state.refCount).to.equal(1)
      store.dispatch('setLoading', false)
      expect(store.state.refCount).to.equal(0)
      store.dispatch('setLoading', false)
      expect(store.state.refCount).to.equal(0)
    })
  })
})
