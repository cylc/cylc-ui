import { shallowMount } from '@vue/test-utils'
import { expect } from 'chai'
// import vuetify here so that we do not have warnings in the console output
// eslint-disable-next-line no-unused-vars
import * as vuetify from '@/plugins/vuetify'
import Task from '@/components/cylc/Task'

describe('Task component', () => {
  it('should initialize props', () => {
    const wrapper = shallowMount(Task, {
      propsData: {
        status: '',
        isHeld: true
      }
    })
    expect(wrapper.props().status).to.equal('')
    expect(wrapper.props().isHeld).to.equal(true)
    expect(wrapper.props().progress).to.equal(0)
  })
  it('should compute progress style', () => {
    // local this gives the values used in the computed function, as we are not mounting the component
    const localThis = {
      progress: 25
    }
    expect(Task.computed.progressStyle.call(localThis)['stroke-dashoffset']).to.equal(157 - (0.25 * 157))
  })
  it('should compute classes', () => {
    [
      [
        ['unknown'], // expected
        [false, ''] // isHeld, status
      ],
      [
        ['held', 'unknown'], // expected
        [true, ''] // isHeld, status
      ],
      [
        ['held', 'submitted'], // expected
        [true, 'submitted'] // isHeld, status
      ],
      [
        ['held', 'unknown'], // expected
        [true, 'what-is-it'] // isHeld, status
      ]
    ].forEach((val) => {
      const localThis = {
        isHeld: val[1][0],
        status: val[1][1]
      }
      expect(Task.computed.classes.call(localThis)).to.deep.equal(val[0])
    })
  })
})
