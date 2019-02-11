import { expect } from 'chai'
// import { shallowMount } from '@vue/tests-utils'
// import HelloWorld from '@/components/HelloWorld.vue'
import User from '@/model/User.model.js'

describe('UserModel', () => {
  describe('constructor', () => {
    it('should be created', () => {
      const data = {
        'username': 'john.foe',
        'password': '123john.foe123'
      }
      const user = new User(data)
      expect(user.username).to.equal('john.foe')
    })
  })
})
