import { expect } from 'chai'
import { SuiteService } from '@/services/suite.service'
import sinon from 'sinon'
import axios from 'axios'
import apolloClient from '@/utils/graphql'
import store from '@/store'
import Suite from "@/model/Suite.model";

describe('SuiteService', () => {
  let sandbox;
  beforeEach(() => sandbox = sinon.createSandbox());
  afterEach(() => sandbox.restore());
  describe('getSuites returns the list of suites', () => {
    it('should return list of suites', () => {
      // we have fake data until the graphql backend is ready
      const suitesReturned = new Promise((r) => r({ data:
        [
          {
            name: "speaker 1"
          },
          {
            name: "speaker 2"
          }
        ]
      }));
      sandbox.stub(axios, 'get').returns(suitesReturned);
      return SuiteService.getSuites().then(function() {
        const suites = store.getters['suites/suites'];
        expect(suites.length).to.equal(2);
        expect(suites[0].name).to.equal("speaker 1");
      });
    });
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
      sandbox.stub(apolloClient, 'query').returns(tasksReturned);
      return SuiteService.getSuiteTasks(new Suite("suitename", null, null, null)).then(function() {
        const suites = store.getters['suites/suites'];
        expect(suites.length).to.equal(2);
        expect(suites[0].name).to.equal("speaker 1");
      });
    });
  })
});
