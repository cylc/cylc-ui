import { expect } from 'chai'
import { SuiteService } from '@/services/suite.service'
import sinon from 'sinon'
import axios from 'axios'
import store from '@/store'
import Suite from "@/model/Suite.model";
import {UserService} from "@/services/user.service";

describe('SuiteService', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    store.dispatch("suites/setSuites", []);
  });
  afterEach(() => sandbox.restore());
  describe('getSuites returns the list of suites', () => {
    it('should return list of suites', () => {
      // we have fake data until the graphql backend is ready
      const suitesReturned = new Promise((r) => r({ data:
        [
          {
            name: "suite 1",
            user: "rob",
            host: "localhost",
            port: 1234
          },
          {
            name: "suite 2",
            user: "john",
            host: "remotehost",
            port: 4321
          }
        ]
      }));
      sandbox.stub(axios, 'get').returns(suitesReturned);
      return SuiteService.getSuites().then(function() {
        const suites = store.getters['suites/suites'];
        expect(suites.length).to.equal(2);
        expect(suites[0].name).to.equal("suite 1");
      });
    });
    it('should add an alert on error', () => {
      expect(store.state.alerts.length).to.equal(0);
      const e = new Error('mock error');
      e.response = {
        statusText: 'Test Status'
      };
      sandbox.stub(axios, 'get').rejects(e);
      return SuiteService.getSuites().finally(() => {
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
      sandbox.stub(SuiteService, 'createGraphqlClient').returns(stubClient);

      return SuiteService.getSuiteTasks(new Suite("suitename", "root", "localhost", 8080)).then(function() {
        const tasks = store.getters['suites/tasks'];
        expect(tasks.length).to.equal(2);
        expect(tasks[0].name).to.equal("speaker 1");
      });
    });
  });
});
