import { expect } from 'chai'
import User from '@/model/User.model.js'

describe('UserModel', () => {
  describe('constructor', () => {
    it('should be created', () => {
      const name = 'john.foe'
      const groups = ['abc', 'wheel']
      const admin = true
      const created = 'now'
      const server = '/cylc/user/john.foe'
      const user = new User(name, groups, created, admin, server)
      expect(user.username).to.equal(name)
      expect(user.groups.length === 2).to.equal(admin)
      expect(user.admin).to.equal(true)
      expect(user.created).to.equal(created)
      expect(user.server).to.equal(server)
    })
  })
})
