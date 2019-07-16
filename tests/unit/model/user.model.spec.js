import { expect } from 'chai'
// import { shallowMount } from '@vue/tests-utils'
// import HelloWorld from '@/components/HelloWorld.vue'
import User from '@/model/User.model.js'

describe('UserModel', () => {
  describe('constructor', () => {
    it('should be created', () => {
      const name = 'john.foe'
      const groups = ['abc', 'wheel']
      const admin = true
      const created = 'now'
      const user = new User(name, groups, created, admin)
      expect(user.getUserName()).to.equal('john.foe')
      expect(user.getGroups().length === 2).to.equal(true)
      expect(user.isAdmin()).to.equal(true)
      expect(user.getCreated()).to.equal('now')
    })
  })
})
