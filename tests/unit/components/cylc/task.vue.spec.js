import { mount } from '@vue/test-utils'
import { expect } from 'chai'
// import vuetify here so that we do not have warnings in the console output
// eslint-disable-next-line no-unused-vars
import * as vuetify from '@/plugins/vuetify'
import Task from '@/components/cylc/Task'

describe('Task component', () => {
  it('should initialize props', () => {
    const wrapper = mount(Task, {
      context: {
        props: {
          status: '',
          isHeld: true
        }
      }
    })
    expect(wrapper.is(Task)).to.equal(true)
  })
})
