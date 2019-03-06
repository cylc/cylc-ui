import { expect } from 'chai'
import Suite from '@/model/Suite.model.js'

describe('SuiteModel', () => {
  describe('constructor', () => {
    it('should be created', () => {
      const name = 'john-suite';
      const user = 'john';
      const host = 'localhost';
      const port = 1234;
      const suite = new Suite(name, user, host, port);
      expect(suite.getName()).to.equal('john-suite');
      expect(suite.getUser()).to.equal('john');
      expect(suite.getHost()).to.equal('localhost');
      expect(suite.getPort()).to.equal(1234)
    })
  })
});
