import { expect } from 'chai'
import Family from '@/model/Family.model.js'

describe('FamilyModel', () => {
  describe('constructor', () => {
    it('should be created', () => {
      const name = 'fam1'
      const cyclePoint = '2019010100000.1'
      const state = 'success'
      const depth = 2
      const childTasks = [2, 3, 1]
      const childFamilies = [21, 31, 11]
      const family = new Family(name, cyclePoint, state, depth, childTasks, childFamilies)
      expect(family.name).to.equal('fam1')
      expect(family.cyclePoint).to.equal('2019010100000.1')
      expect(family.state).to.equal('success')
      expect(family.depth).to.equal(2)
      expect(family.childTasks).to.eql([2, 3, 1])
      expect(family.childFamilies).to.eql([21, 31, 11])
    })
  })
})
