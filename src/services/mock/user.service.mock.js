import User from '@/model/User.model'
import store from '@/store/index'

export const UserService = {

  getUserProfile () {
    const username = 'cylc'
    const user = new User(
      username,
      ['cylc-developers', 'linux-users'],
      new Date(),
      true,
      `/user/${username}/`
    )
    return store.dispatch('user/setUser', user)
  }

}
