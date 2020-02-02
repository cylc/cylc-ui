import { mount } from '@vue/test-utils'
import { expect } from 'chai'
import ConnectionStatus from '@/components/cylc/ConnectionStatus'
import store from '@/store/index'

describe('ConnectionStatus component', () => {
  it('hidden when not offline', () => {
    store.state.offline = false
    const wrapper = mount(ConnectionStatus, {
      store
    })
    expect(wrapper.contains('div')).to.equal(false)
  })
  it('visible when offline', () => {
    store.state.offline = true
    const wrapper = mount(ConnectionStatus, {
      store
    })
    expect(wrapper.contains('div')).to.equal(true)
  })
})
