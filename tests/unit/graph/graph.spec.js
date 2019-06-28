import Vue from 'vue'
import Graph from '@/views/Graph.vue'
import { mount } from '@vue/test-utils'
import { expect } from 'chai'
import Vuetify from 'vuetify'
import VBtn from 'vuetify'
import cytoscape from 'cytoscape'

Vue.use(
  Vuetify,
  {
    VBtn
  },
  cytoscape
)

describe('Graph', () => {
  it('should mount for testing', () => {
    const wrapper = mount(Graph)
    expect(wrapper.find('[id="holder"]'))
  })

  it('should create the cytoscape element', () => {
    const wrapper = mount(Graph)
    expect(wrapper.find('[id="cytoscape"]'))
  })

  it('should create the loading spinner', () => {
    const wrapper = mount(Graph)
    expect(wrapper.find('[id="spinner"]'))
  })

  it('should create the switch layout buttons div', () => {
    const wrapper = mount(Graph)
    expect(wrapper.find('[class="switchlayout"]'))
  })

  it('should create the cytoscape-navigator-view', () => {
    const wrapper = mount(Graph)
    expect(wrapper.find('[class="cytoscape-navigatorView"]'))
  })

  it('should create the cytoscape-navigator-overlay', () => {
    const wrapper = mount(Graph)
    expect(wrapper.find('[class="cytoscape-navigatorOverlay"]'))
  })

  it('should create the cytoscape-navigatorView', () => {
    const wrapper = mount(Graph)
    expect(wrapper.find('[class="cytoscape-navigatorView"]'))
  })

  it('should load the panzoom extension', () => {
    const wrapper = mount(Graph)
    expect(wrapper.find('[class="cy-panzoom"]'))
  })
})
