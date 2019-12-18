import { shallowMount, mount } from '@vue/test-utils'
import { expect } from 'chai'
import Toolbar from '@/components/cylc/Toolbar'
import TaskState from '@/model/TaskState.model'
import store from '@/store/index'
import Vue from 'vue'
import Vuetify from 'vuetify'

describe('Toolbar component', () => {
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify()
    store.state.workflows.workflows = [
      {
        id: 'user/id',
        name: 'test',
        status: TaskState.RUNNING.name.toLowerCase()
      }
    ]
    store.state.workflows.workflowName = 'test'
  })
  it('should initialize props', () => {
    const wrapper = shallowMount(Toolbar, {
      store
    })
    expect(wrapper.is(Toolbar)).to.equal(true)
  })
  it('should hide and display drawer according to screen viewport size', async () => {
    // v-app-toolbar when using "app" directive, must also have a v-app. So we need to initialize vuetify
    const wrapper = mount(Toolbar, {
      vuetify,
      store
    })
    expect(store.state.app.drawer).to.equal(null)
    // empty wrapper before responsive is set to true
    expect(wrapper.find('button.default').exists()).to.equal(false)
    // let's make it responsive, so that the burger menu is visible
    wrapper.vm.$data.responsive = true
    await Vue.nextTick()
    expect(wrapper.find('button.default').exists()).to.equal(true)
    expect(wrapper.find('button.default').isVisible()).to.equal(true)
    wrapper.find('button.default').trigger('click')
    expect(store.state.app.drawer).to.equal(true)
  })
  it('should stop the workflow', async () => {
    const wrapper = shallowMount(Toolbar, {
      store
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
    const wrapper = shallowMount(Toolbar, {
      store
    })
    wrapper.vm.$data.responsive = true
    await Vue.nextTick()

    wrapper.vm.$apollo = {
      mutate: function () {
        return new Promise((resolve) => {
          if (store.state.workflows.workflows[0].status === TaskState.HELD.name.toLowerCase()) {
            store.state.workflows.workflows[0].status = TaskState.RUNNING.name.toLowerCase()
          } else {
            store.state.workflows.workflows[0].status = TaskState.HELD.name.toLowerCase()
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
