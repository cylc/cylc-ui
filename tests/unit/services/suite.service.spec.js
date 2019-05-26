import { expect } from 'chai'
import { SuiteService } from '@/services/suite.service'
import sinon from 'sinon'
import store from '@/store'
import Suite from "@/model/Suite.model";

describe('SuiteService', () => {
  let suiteService = new SuiteService()
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    store.dispatch("suites/setSuites", []);
    store.dispatch('clearAlerts');
  });
  afterEach(() => sandbox.restore());
  describe('getSuites returns the list of suites', () => {
    it('should return list of suites', () => {
      // we have fake data until the graphql backend is ready
      const suitesReturned = new Promise((r) => r({ data:
          {
            workflows:
              [
                {
                  id: "rob/localhost",
                  name: "suite 1",
                  owner: "rob",
                  host: "localhost",
                  port: 1234
                },
                {
                  id: "job/remotehost",
                  name: "suite 2",
                  owner: "john",
                  host: "remotehost",
                  port: 4321
                }
              ]
          }
      }));
      const stubClient = {
        uri: null,
        query: function() {
          return Promise.resolve(suitesReturned);
        }
      };
      sandbox.stub(suiteService, 'createGraphqlClient').returns(stubClient);
      return suiteService.getSuites().then(function() {
        const suites = store.getters['suites/suites'];
        expect(suites.length).to.equal(2);
        expect(suites[0].name).to.equal("suite 1");
      });
    });
    it('should add an alert on error', () => {
      expect(store.state.alerts.length).to.equal(0);
      const e = new Error('mock error');
      const stubClient = {
        uri: null,
        query: function() {
          return Promise.reject(e);
        }
      };
      sandbox.stub(suiteService, 'createGraphqlClient').returns(stubClient);
      return suiteService.getSuites().finally(() => {
        expect(store.state.alerts.length).to.equal(1);
      });
    });
  });
  describe('getSuiteTasks returns the list of tasks of a suite', () => {
    it('should return list of tasks for a suite', () => {
      // we have fake data until the graphql backend is ready
      const tasksReturned = new Promise((r) => r({ data: {
          tasks: [
            {
              id: "id1",
              name: "speaker 1"
            },
            {
              id: "id2",
              name: "speaker 2"
            }
          ]
        }
      }));
      const stubClient = {
        uri: null,
        query: function() {
          return Promise.resolve(tasksReturned);
        }
      };
      sandbox.stub(suiteService, 'createGraphqlClient').returns(stubClient);

      return suiteService.getSuiteTasks(new Suite("suitename", "root", "localhost", 8080)).then(function() {
        const tasks = store.getters['suites/tasks'];
        expect(tasks.length).to.equal(2);
        expect(tasks[0].name).to.equal("speaker 1");
      });
    });
    it('should add an alert on error', () => {
      expect(store.state.alerts.length).to.equal(0);
      const e = new Error('mock error');
      const stubClient = {
        uri: null,
        query: function() {
          return Promise.reject(e);
        }
      };
      sandbox.stub(suiteService, 'createGraphqlClient').returns(stubClient);
      return suiteService.getSuiteTasks(new Suite("suitename", "root", "localhost", 8080)).finally(() => {
        expect(store.state.alerts.length).to.equal(1);
      });
    });
  });
});
