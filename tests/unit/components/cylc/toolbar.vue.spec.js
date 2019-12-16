import { mount } from '@vue/test-utils'
import { expect } from 'chai'
// import vuetify here so that we do not have warnings in the console output
// eslint-disable-next-line no-unused-vars
import * as vuetify from '@/plugins/vuetify'
import Toolbar from '@/components/cylc/Toolbar'
import TaskState from '@/model/TaskState.model'
import store from '@/store/index'
import Vue from 'vue'

describe('Toolbar component', () => {
  it('should initialize props', () => {
    const wrapper = mount(Toolbar, {
      store,
      propsData: {
        workflow: {
          id: 'Workflow Test Toolbar',
          status: TaskState.RUNNING.name.toLowerCase()
        }
      }
    })
    expect(wrapper.is(Toolbar)).to.equal(true)
  })
  it('should hide and display drawer according to screen viewport size', () => {
    const wrapper = mount(Toolbar, {
      store,
      propsData: {
        workflow: {
          id: 'Workflow Test Toolbar',
          status: TaskState.RUNNING.name.toLowerCase()
        }
      }
    })
    expect(store.state.app.drawer).to.equal(null)
    // empty wrapper before responsive is set to true
    expect(wrapper.find('button.default').exists()).to.equal(false)
    // let's make it responsive, so that the burger menu is visible
    wrapper.vm.$data.responsive = true
    expect(wrapper.find('button.default').exists()).to.equal(true)
    expect(wrapper.find('button.default').isVisible()).to.equal(true)
    wrapper.find('button.default').trigger('click')
    expect(store.state.app.drawer).to.equal(true)
  })
  it('should stop the workflow', async () => {
    const wrapper = mount(Toolbar, {
      store,
      propsData: {
        workflow: {
          id: 'Workflow Test Toolbar',
          status: TaskState.RUNNING.name.toLowerCase()
        }
      }
    })

    wrapper.vm.$apollo = {
      mutate: function () {
        return new Promise((resolve) => {
          return resolve(true)
        })
      }
    }

    const stopLink = wrapper.find('#workflow-stop-button')
    expect(wrapper.vm.$data.isStopped).to.equal(false)
    stopLink.trigger('click')
    await Vue.nextTick()
    expect(wrapper.vm.$data.isStopped).to.equal(true)
  })
  it('should stop/release the workflow', async () => {
    const wrapper = mount(Toolbar, {
      store,
      propsData: {
        workflow: {
          id: 'Workflow Test Toolbar',
          status: TaskState.RUNNING.name.toLowerCase()
        }
      }
    })

    wrapper.vm.$apollo = {
      mutate: function () {
        return new Promise((resolve) => {
          if (wrapper.vm.workflow.status === TaskState.HELD.name.toLowerCase()) {
            wrapper.setProps({
              workflow: {
                id: 'Workflow Test Toolbar',
                status: TaskState.RUNNING.name.toLowerCase()
              }
            })
          } else {
            wrapper.setProps({
              workflow: {
                id: 'Workflow Test Toolbar',
                status: TaskState.HELD.name.toLowerCase()
              }
            })
          }
          return resolve(true)
        })
      }
    }

    const toggleLink = wrapper.find('#workflow-release-hold-button')
    toggleLink.trigger('click')
    await Vue.nextTick()
    expect(wrapper.vm.isHeld).to.equal(true)
    toggleLink.trigger('click')
    await Vue.nextTick()
    expect(wrapper.vm.isHeld).to.equal(false)
  })
})
