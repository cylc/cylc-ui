import { expect } from 'chai'
import store from '@/store'
import Suite from "@/model/Suite.model";

describe('store', () => {
  beforeEach(() => {
    store.dispatch('suites/setSuites', []);
    store.dispatch('suites/setTasks', []);
  });
  describe('suites', () => {
    it('should start with an empty list', () => {
      expect(store.state.suites.suites.length).to.equal(0);
    });
    it('should set suites', () => {
      store.dispatch('suites/setSuites', [new Suite('my-suite', '', '', 0), new Suite('my-other-suite', '', '', 0)]);
      expect(store.state.suites.suites.length).to.equal(2);
    });
    it('should get suites', () => {
      expect(store.getters['suites/suites'].length).to.equal(0);
      store.dispatch('suites/setSuites', [new Suite('my-suite', '', '', 0), new Suite('my-other-suite', '', '', 0)]);
      expect(store.getters['suites/suites'].length).to.equal(2);
    });
  });
  describe('tree', () => {
    beforeEach(() => {
      store.dispatch('suites/setTree', [])
    })
    it('should start with an empty list', () => {
      expect(store.state.suites.tree.length).to.equal(0)
    })
    it('should set tree', () => {
      store.dispatch('suites/setTree', [new Suite('my-suite', '', '', 0), new Suite('my-other-suite', '', '', 0)])
      expect(store.state.suites.tree.length).to.equal(2)
    })
    it('should get tree', () => {
      expect(store.getters['suites/tree'].length).to.equal(0)
      store.dispatch('suites/setTree', [new Suite('my-suite', '', '', 0), new Suite('my-other-suite', '', '', 0)])
      expect(store.getters['suites/tree'].length).to.equal(2)
    })
  })
})
