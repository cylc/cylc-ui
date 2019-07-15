import Graph from '@/views/Graph.vue'

describe('Graph', () => {
  // Inspect the raw component options
  it('has a created hook', () => {
    expect(typeof Graph.created).toBe('function')
  })
  // Evaluate the results of functions in
  // the raw component options
  it('sets the correct default data', () => {
    // expect(typeof GraphComponent.data).toBe('function')
    // const defaultData = Graph.data();
    // expect(defaultData.message).toBe('hello!');
  })
  // Inspect the component instance on mount
  it('correctly sets the message when created', () => {
    // const vm = new Vue(Graph).$mount();
    // expect(vm.message).toBe('bye!');
  })
  // Mount an instance and inspect the render output
  it('renders the correct message', () => {
    // const Ctor = Vue.extend(Graph);
    // const vm = new Ctor().$mount();
    // expect(vm.$el.textContent).toBe('bye!');
  })
})
