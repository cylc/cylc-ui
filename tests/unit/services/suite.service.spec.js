import { expect } from 'chai'
import { SuiteService } from '@/services/suite.service'
import sinon from 'sinon'
import apolloClient from '@/utils/graphql'
import store from '@/store'

describe('SuiteService', () => {
  let sandbox;
  beforeEach(() => sandbox = sinon.createSandbox());
  afterEach(() => sandbox.restore());
  describe('getSuites returns the list of suites', () => {
    it('should return list of suites', () => {
      // we have fake data until the graphql backend is ready
      const suitesReturned = new Promise((r) => r({ data: {
          allSpeakers: [
            {
              name: "speaker 1"
            },
            {
              name: "speaker 2"
            }
          ]
        }
      }));
      sandbox.stub(apolloClient, 'query').returns(suitesReturned);
      return SuiteService.getSuites().then(function() {
        const suites = store.getters['suites/suites'];
        expect(suites.length).to.equal(2);
        expect(suites[0].name).to.equal("speaker 1");
      });
    })
  })
});
