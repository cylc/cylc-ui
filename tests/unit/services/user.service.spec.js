import { expect } from 'chai'
import { UserService } from '@/services/user.service'
import sinon from 'sinon'
import axios from 'axios'
import store from '@/store'

describe('UserService', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    store.dispatch('clearAlerts');
  });
  afterEach(() => sandbox.restore());
  describe('getUserProfile returns the logged-in user profile information', () => {
    it('should return user profile object', () => {
      const userReturned = new Promise((r) => r({ data: {
          name: "cylc-user-01",
          groups: ["root", "wheel"],
          created: "2019-01-01",
          admin: true
        }
      }));
      sandbox.stub(axios, 'get').returns(userReturned);
      return UserService.getUserProfile().then(function() {
        const user = store.getters['user/user'];
        expect(user.getUserName()).to.equal("cylc-user-01");
        expect(user.getGroups().length).to.equal(2);
        expect(user.getCreated()).to.equal("2019-01-01");
        expect(user.isAdmin()).to.equal(true);
      });
    });
    it('should add an alert on error', () => {
      expect(store.state.alerts.length).to.equal(0);
      const e = new Error('mock error');
      e.response = {
        statusText: 'Test Status'
      };
      sandbox.stub(axios, 'get').rejects(e);
      return UserService.getUserProfile().finally(() => {
        expect(store.state.alerts.length).to.equal(1);
      });
    });
  })
});
