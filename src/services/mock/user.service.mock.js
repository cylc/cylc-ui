import User from '@/model/User.model'
import store from '@/store/index'

export const UserService = {

  getUserProfile () {
    return new Promise((resolve, reject) => {
      const user = new User('cylc-dev', ['cylc-developers', 'linux-users'], new Date(), true)
      return store.dispatch('user/setUser', user)
    })
  }

}
