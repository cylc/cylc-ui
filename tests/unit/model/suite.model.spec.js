import { expect } from 'chai'
import Suite from '@/model/Suite.model.js'

describe('SuiteModel', () => {
  describe('constructor', () => {
    it('should be created', () => {
      const id = 'john/localhost';
      const name = 'john-suite';
      const owner = 'john';
      const host = 'localhost';
      const port = 1234;
      const suite = new Suite(id, name, owner, host, port);
      expect(suite.getId()).to.equal('john/localhost');
      expect(suite.getName()).to.equal('john-suite');
      expect(suite.getOwner()).to.equal('john');
      expect(suite.getHost()).to.equal('localhost');
      expect(suite.getPort()).to.equal(1234)
    })
  })
});
