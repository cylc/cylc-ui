import User from '@/model/User.model.js'

describe('UserModel', function () {
  describe('constructor', function () {
    it('should be created', function() {
      const data = {
        'username': 'john.foe',
        'password': '123john.foe123'
      }
      const user = new User(data)
      expect(user.username).toBe('john.foe')
    })
  })
})
