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
      const server = '/cylc/user/john.foe'
      const user = new User(name, groups, created, admin, server)
      expect(user.username).to.equal(name)
      expect(user.groups.length === 2).to.equal(admin)
      expect(user.admin).to.equal(true)
      expect(user.created).to.equal(created)
      expect(user.server).to.equal(server)
    })
  })
  describe('Hub URL', () => {
    const user = new User('', [], '', false, '')
    expect(user.getHubUrl()).to.equal('/hub/home')
    user.server = '/user/john.foo/'
    expect(user.getHubUrl()).to.equal('/hub/home')
    user.server = '/cylc/user/john.foo/'
    expect(user.getHubUrl()).to.equal('/cylc/hub/home')
    user.server = '/cylc/flow/workflow/engine/user/john.foo/'
    expect(user.getHubUrl()).to.equal('/cylc/flow/workflow/engine/hub/home')
    // who knows right? no idea if the configurable-http-proxy would still work with these URLs, but just in case...
    user.server = '/user/user/john.foo/'
    expect(user.getHubUrl()).to.equal('/user/hub/home')
    user.server = '/cylc/flow/user/workflow/engine/user/john.foo/'
    expect(user.getHubUrl()).to.equal('/cylc/flow/user/workflow/engine/hub/home')
  })
})
