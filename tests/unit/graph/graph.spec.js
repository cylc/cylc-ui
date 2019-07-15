import Vue from 'vue'
import Graph from '@/views/Graph.vue'
import { mount } from '@vue/test-utils'
import { expect } from 'chai'
import Vuetify, { VBtn } from 'vuetify'
import cytoscape from 'cytoscape'

Vue.use(
  Vuetify,
  {
    VBtn
  },
  cytoscape
)

describe('Graph', () => {
  const wrapper = mount(Graph)

  it('should mount for testing', () => {
    expect(wrapper.find('[id="holder"]'))
  })

  it('should create the cytoscape element', () => {
    expect(wrapper.find('[id="cytoscape"]'))
  })

  it('should create the loading spinner', () => {
    expect(wrapper.find('[id="spinner"]'))
  })

  it('should create the switch layout buttons div', () => {
    expect(wrapper.find('[class="switchlayout"]'))
  })

  it('should create the cytoscape-navigator-view', () => {
    expect(wrapper.find('[class="cytoscape-navigatorView"]'))
  })

  it('should create the cytoscape-navigator-overlay', () => {
    expect(wrapper.find('[class="cytoscape-navigatorOverlay"]'))
  })

  it('should create the cytoscape-navigatorView', () => {
    expect(wrapper.find('[class="cytoscape-navigatorView"]'))
  })

  it('should load the panzoom extension', () => {
    expect(wrapper.find('[class="cy-panzoom"]'))
  })
})
