import User from '@/model/User.model'
import axios from 'axios'
import store from '@/store/'
import Alert from '@/model/Alert.model'

export const UserService = {

  getUserProfile () {
    return axios.get(window.location.pathname + '/userprofile').then((response) => {
      const user = new User(response.data.name, response.data.groups, response.data.created, response.data.admin)
      return store.dispatch('user/setUser', user)
    }).catch((error) => {
      const alert = new Alert(error.response.statusText, null, 'error')
      return store.dispatch('setAlert', alert)
    })
  }

}
