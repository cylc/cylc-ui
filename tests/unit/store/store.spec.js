import { expect } from 'chai'
import store from '@/store'
import Alert from "@/model/Alert.model";

describe('store', () => {
  beforeEach(() => {
    store.dispatch('clearAlerts');
  });
  describe('alerts', () => {
    it('should start with an empty list', () => {
      expect(store.state.alerts.length).to.equal(0);
    });
    it('should add alerts', () => {
      store.dispatch('addAlert', new Alert('my-alert', '', ''));
      store.dispatch('addAlert', new Alert('my-alert', '', ''));
      expect(store.state.alerts.length).to.equal(2);
    });
    it('should remove alerts', () => {
      store.dispatch('addAlert', new Alert('my-alert', '', ''));
      store.dispatch('addAlert', new Alert('my-alert', '', ''));
      store.dispatch('clearAlerts');
      expect(store.state.alerts.length).to.equal(0);
    });
    it('should remove alert by text', () => {
      store.dispatch('addAlert', new Alert('my-alert', '', ''));
      store.dispatch('addAlert', new Alert('my-alert', '', ''));
      // For now removes just the first occurrence
      store.dispatch('removeAlert', 'my-alert');
      expect(store.state.alerts.length).to.equal(1);
    });
  })
});
