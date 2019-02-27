import User from '@/model/User.model'
import axios from 'axios'
import store from '@/store/'

export const UserService = {

  getUserProfile() {
    return axios.get(window.location.pathname + '/userprofile').then((response) => {
      let user = new User(response.data.name, response.data.groups, response.data.created, response.data.admin);
      return store.dispatch('user/setUser', user);
    });
  }

};
